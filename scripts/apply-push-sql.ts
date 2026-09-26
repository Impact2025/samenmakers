import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";

const sql = neon(process.env.DATABASE_URL_UNPOOLED!);

async function main() {
  const raw = readFileSync(new URL("./_push.sql", import.meta.url), "utf8");
  // Statements are newline-terminated; CREATE TABLE blocks span lines.
  const statements = raw
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);

  let ok = 0;
  let skipped = 0;
  for (const stmt of statements) {
    try {
      await sql.query(stmt + ";");
      ok++;
      console.log("✓ " + stmt.split("\n")[0]!.slice(0, 70));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (/already exists|duplicate/i.test(msg)) {
        skipped++;
        console.log(
          "• overgeslagen (bestaat al): " + stmt.split("\n")[0]!.slice(0, 50),
        );
      } else {
        console.error("✗ FOUT bij: " + stmt.split("\n")[0]!.slice(0, 70));
        console.error("   " + msg);
        throw e;
      }
    }
  }
  console.log(`\nKlaar — ${ok} toegepast, ${skipped} overgeslagen.`);
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});

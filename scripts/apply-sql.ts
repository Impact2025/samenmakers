// Past een SQL-bestand (drizzle-kit output of handgeschreven) idempotent toe:
// bestaande types/kolommen/tabellen/constraints worden overgeslagen.
// Gebruik: npx tsx --env-file=.env.local scripts/apply-sql.ts drizzle/schema-sync.sql
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";

const file = process.argv[2];
if (!file) {
  console.error("Geef een SQL-bestand mee.");
  process.exit(1);
}

const sql = neon(
  process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL!,
);
const ALREADY = /already exists|duplicate_object|duplicate key value/i;

async function main() {
  const statements = readFileSync(file!, "utf8")
    .replace(/^\s*--(?!>).*$/gm, "")
    .split("--> statement-breakpoint")
    .map((s) => s.trim().replace(/;$/, ""))
    .filter(Boolean);

  let ok = 0;
  let skipped = 0;
  let failed = 0;
  for (const stmt of statements) {
    const label = stmt.split("\n")[0]!.slice(0, 90);
    try {
      await sql.query(stmt);
      ok++;
      console.log("ok   " + label);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (ALREADY.test(msg)) {
        skipped++;
      } else {
        failed++;
        console.error("FAIL " + label + "\n     " + msg);
      }
    }
  }
  console.log(
    `\nKlaar: ${ok} toegepast, ${skipped} al aanwezig, ${failed} mislukt.`,
  );
  if (failed > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

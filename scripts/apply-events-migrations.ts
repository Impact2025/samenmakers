// Past de eventmigraties in volgorde toe. Idempotent: bestaande types/kolommen/tabellen
// worden overgeslagen, dus veilig om opnieuw te draaien.
// Gebruik: npx tsx --env-file=.env.local scripts/apply-events-migrations.ts
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";

const FILES = [
  "events-fase1.sql",
  "events-fase2.sql",
  "security-fase1.sql",
  "onderwijs-fase2.sql",
];
// Optioneel één bestand: npx tsx --env-file=.env.local scripts/apply-events-migrations.ts onderwijs-fase2.sql
const only = process.argv[2];
const TODO = only ? [only] : FILES;
const sql = neon(
  process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL!,
);

async function main() {
  for (const file of TODO) {
    console.log(`\n== ${file}`);
    const raw = readFileSync(
      new URL(`../drizzle/${file}`, import.meta.url),
      "utf8",
    );
    const statements = raw
      .replace(/^\s*--.*$/gm, "")
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean);

    for (const stmt of statements) {
      const label = stmt.split("\n")[0]!.slice(0, 80);
      try {
        await sql.query(stmt);
        console.log("ok   " + label);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (/already exists/i.test(msg)) {
          console.log("skip " + label);
        } else {
          console.error("FOUT " + label + "\n     " + msg);
          process.exit(1);
        }
      }
    }
  }
  console.log("\nKlaar.");
}

void main();

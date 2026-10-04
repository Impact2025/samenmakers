import { is } from "drizzle-orm";
import { getTableConfig, PgTable } from "drizzle-orm/pg-core";
import * as schema from "@/server/db/schema";

/** Tabellen met alleen sessie- en inlogmateriaal: nooit exporteren. */
const EXCLUDED_TABLES = new Set([
  "accounts",
  "sessions",
  "verification_tokens",
  "push_subscriptions",
]);

/** Kolommen (TS-namen) met geheimen die nooit in een export horen. */
const REDACTED_COLUMNS = new Set(["password", "accessToken"]);

export type ExportTable = { name: string; table: PgTable };

/** Alle tabellen uit het schema die exporteerbaar zijn, op naam gesorteerd. */
export function exportableTables(): ExportTable[] {
  const found: ExportTable[] = [];
  for (const value of Object.values(schema)) {
    if (!is(value, PgTable)) continue;
    const { name } = getTableConfig(value);
    if (EXCLUDED_TABLES.has(name)) continue;
    found.push({ name, table: value });
  }
  return found.sort((a, b) => a.name.localeCompare(b.name));
}

export function redactRow(row: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    out[key] =
      REDACTED_COLUMNS.has(key) && value != null ? "[VERWIJDERD]" : value;
  }
  return out;
}

function csvCell(value: unknown): string {
  if (value == null) return "";
  const text =
    value instanceof Date
      ? value.toISOString()
      : typeof value === "object"
        ? JSON.stringify(value)
        : String(value);
  return /[",\n\r;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(rows: Record<string, unknown>[]): string {
  const first = rows[0];
  if (!first) return "";
  const columns = Object.keys(first);
  const lines = [columns.join(",")];
  for (const row of rows)
    lines.push(columns.map((c) => csvCell(row[c])).join(","));
  return lines.join("\r\n") + "\r\n";
}

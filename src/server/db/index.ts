import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

function createDb() {
  try {
    const sql = neon(process.env.DATABASE_URL ?? "");
    return drizzle(sql, { schema });
  } catch {
    // Build-time fallback: DATABASE_URL is a placeholder.
    // Runtime queries will fail with a proper error via env validation.
    const sql = neon("postgresql://build:build@localhost/build");
    return drizzle(sql, { schema });
  }
}

export const db = createDb();
export type Database = typeof db;

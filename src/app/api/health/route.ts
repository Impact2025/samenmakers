import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/server/db";

// Publiek en bewust zonder details: voor uptime-monitoring. Controleert alleen of de app
// draait en de database antwoordt. Geen geheimen of versies in het antwoord.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const started = Date.now();
  const database = await Promise.race([
    db.execute(sql`select 1`).then(() => true),
    new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 5000)),
  ]).catch(() => false);

  return NextResponse.json(
    {
      status: database ? "ok" : "degraded",
      database,
      ms: Date.now() - started,
    },
    { status: database ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}

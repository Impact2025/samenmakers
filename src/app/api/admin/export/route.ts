import { NextResponse } from "next/server";
import { auth } from "@/server/auth/config";
import { db } from "@/server/db";
import { auditLog } from "@/server/db/schema";
import { exportableTables, redactRow, toCsv } from "@/lib/data-export";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Volledige data-export voor beheerders (offerte: 100% eigendom van data).
 * - /api/admin/export                      alle tabellen als één JSON-bestand
 * - /api/admin/export?table=users&format=csv  één tabel als CSV
 * - /api/admin/export?list=1               lijst met beschikbare tabellen
 * Wachtwoorden, sessies en tokens zijn nooit onderdeel van de export.
 */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const tables = exportableTables();

  if (url.searchParams.has("list")) {
    return NextResponse.json({ tables: tables.map((t) => t.name) });
  }

  const only = url.searchParams.get("table");
  const format = url.searchParams.get("format") === "csv" ? "csv" : "json";
  const selected = only ? tables.filter((t) => t.name === only) : tables;
  if (only && selected.length === 0) {
    return NextResponse.json({ error: "Onbekende tabel" }, { status: 404 });
  }
  if (format === "csv" && !only) {
    return NextResponse.json(
      { error: "CSV kan per tabel: voeg ?table=<naam> toe" },
      { status: 400 },
    );
  }

  const data: Record<string, Record<string, unknown>[]> = {};
  for (const { name, table } of selected) {
    const rows = await db.select().from(table);
    data[name] = rows.map((r) => redactRow(r as Record<string, unknown>));
  }

  await db.insert(auditLog).values({
    adminId: session.user.id,
    action: "data_export",
    targetType: "export",
    targetId: only ?? "alles",
    details: format,
  });

  const stamp = new Date().toISOString().slice(0, 10);
  if (format === "csv") {
    return new NextResponse(toCsv(data[only ?? ""] ?? []), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="weave-${only}-${stamp}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  }
  return new NextResponse(
    JSON.stringify(
      { exportedAt: new Date().toISOString(), tables: data },
      null,
      2,
    ),
    {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="weave-export-${stamp}.json"`,
        "Cache-Control": "no-store",
      },
    },
  );
}

import { ImageResponse } from "next/og";
import { and, eq, or } from "drizzle-orm";
import { db } from "@/server/db";
import { events } from "@/server/db/schema";
import { eventWhere, formatEventWhen } from "@/lib/event-format";

export const runtime = "nodejs";
export const alt = "We Shape the Future event";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Deelkaart per event ("ik ga"-delen op LinkedIn/WhatsApp). Alleen publieke events
// tonen details; al het andere krijgt een neutrale kaart.
export default async function EventOgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const e = await db.query.events
    .findFirst({
      where: and(
        or(eq(events.slug, slug), eq(events.id, slug)),
        eq(events.visibility, "public"),
        or(eq(events.status, "published"), eq(events.status, "cancelled")),
      ),
    })
    .catch(() => undefined);

  const title = e?.title ?? "Events voor impact-ondernemers";
  const when = e ? formatEventWhen(e.startAt, e.endAt, e.timezone) : "";
  const where = e ? eventWhere(e) : "";

  return new ImageResponse(
    <div
      style={{
        background: "#ffffff",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <span
          style={{
            fontSize: "18px",
            letterSpacing: "0.15em",
            color: "#707973",
            fontWeight: 600,
          }}
        >
          {e?.status === "cancelled" ? "GEANNULEERD" : "EVENT"}
        </span>
        <h1
          style={{
            fontSize: title.length > 50 ? "56px" : "72px",
            fontWeight: 900,
            color: "#191c1a",
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            margin: 0,
          }}
        >
          {title}
        </h1>
        {when && (
          <p style={{ fontSize: "30px", color: "#404943", margin: 0 }}>
            {when}
          </p>
        )}
        {where && (
          <p style={{ fontSize: "26px", color: "#707973", margin: 0 }}>
            {where}
          </p>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ width: "40px", height: "40px", background: "#0f5238" }} />
        <span
          style={{
            fontSize: "22px",
            fontWeight: 900,
            letterSpacing: "-0.04em",
            color: "#191c1a",
          }}
        >
          We Shape the Future
        </span>
      </div>
    </div>,
    { ...size },
  );
}

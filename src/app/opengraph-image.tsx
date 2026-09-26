import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "We Shape the Future — Vind je medemissie-ondernemer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    <div
      style={{
        background: "#ffffff",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "80px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Top */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <span
          style={{
            fontSize: "12px",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#707973",
            fontWeight: 600,
          }}
        >
          Purpose-driven netwerk
        </span>
        <h1
          style={{
            fontSize: "72px",
            fontWeight: 900,
            color: "#191c1a",
            lineHeight: 1,
            letterSpacing: "-0.03em",
            margin: 0,
          }}
        >
          Vind je
          <br />
          medemissie-
          <br />
          ondernemer
        </h1>
      </div>

      {/* Bottom */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
        }}
      >
        <p
          style={{
            fontSize: "18px",
            color: "#404943",
            fontWeight: 300,
            maxWidth: "480px",
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          We Shape the Future verbindt impact-ondernemers die samen meer
          bereiken.
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              background: "#0f5238",
            }}
          />
          <span
            style={{
              fontSize: "20px",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              color: "#191c1a",
            }}
          >
            We Shape the Future
          </span>
        </div>
      </div>
    </div>,
    { ...size },
  );
}

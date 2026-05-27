import { ImageResponse } from "next/og";

export const alt = "Bramble - Community Foraging App";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #065f46 0%, #16a34a 50%, #4ade80 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24 }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="72"
            height="72"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 20 7 20 7s2.1 4.5 .1 10.2A7 7 0 0 1 11 20" />
            <path d="M10 20.5c2-2.5 3-5 3.5-8.5" />
          </svg>
          <span style={{ fontSize: 72, fontWeight: 700, color: "white" }}>Bramble</span>
        </div>
        <span style={{ fontSize: 28, color: "rgba(255,255,255,0.85)" }}>
          Community Foraging App
        </span>
        <span style={{ fontSize: 20, color: "rgba(255,255,255,0.6)", marginTop: 12 }}>
          Identify plants with AI - Keep a foraging journal - Share finds on a community map
        </span>
      </div>
    ),
    { ...size }
  );
}

import { ImageResponse } from "next/og";
import { SITE } from "@/config/site";

export const alt = `${SITE.name} — ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function Pine({ x, h, color }: { x: number; h: number; color: string }) {
  const w = h * 0.42;
  return (
    <div
      style={{
        position: "absolute",
        left: x - w / 2,
        bottom: 0,
        width: 0,
        height: 0,
        borderLeft: `${w / 2}px solid transparent`,
        borderRight: `${w / 2}px solid transparent`,
        borderBottom: `${h}px solid ${color}`,
      }}
    />
  );
}

export default function OpengraphImage() {
  const far = [60, 140, 210, 300, 380, 820, 900, 980, 1060, 1140];
  const near = [20, 110, 1090, 1180];
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(180deg, #bfdcd6 0%, #e3eedf 55%, #f7eedb 100%)",
          position: "relative",
          fontFamily: "serif",
        }}
      >
        <div style={{ position: "absolute", right: 170, top: 70, width: 120, height: 120, borderRadius: 999, background: "#fff4d4", boxShadow: "0 0 120px 60px rgba(255,206,120,.55)" }} />
        {far.map((x, i) => (
          <Pine key={`f${i}`} x={x} h={150 + ((i * 37) % 70)} color="#4b7a61" />
        ))}
        {near.map((x, i) => (
          <Pine key={`n${i}`} x={x} h={300 + ((i * 53) % 80)} color="#173a2a" />
        ))}
        <div style={{ display: "flex", fontSize: 30, color: "#2f6b47", letterSpacing: 6, textTransform: "uppercase", fontFamily: "sans-serif", fontWeight: 700 }}>
          Generator QR gratis &amp; privat
        </div>
        <div style={{ display: "flex", fontSize: 108, color: "#13271d", marginTop: 16, fontWeight: 700 }}>
          QR Code&nbsp;<span style={{ color: "#2f6b47", fontStyle: "italic" }}>MaR</span>
        </div>
        <div style={{ display: "flex", fontSize: 34, color: "#4a6255", marginTop: 18, fontFamily: "sans-serif" }}>
          Tautan · WiFi · Kontak · WhatsApp · Lokasi
        </div>
      </div>
    ),
    size,
  );
}

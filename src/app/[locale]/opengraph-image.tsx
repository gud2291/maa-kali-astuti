import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export const alt = "Maa Kali Astuti — Authentic Vedic Astrology & Energized Remedies";

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<ImageResponse> {
  await params;

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
          backgroundColor: "#0E3B30",
          backgroundImage:
            "radial-gradient(circle at 50% 30%, #164E3F 0%, #0E3B30 70%, #071E18 100%)",
          padding: "60px 80px",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {/* Outer gold border */}
        <div
          style={{
            position: "absolute",
            top: 24,
            left: 24,
            right: 24,
            bottom: 24,
            border: "1.5px solid #B8923A",
            opacity: 0.6,
            borderRadius: 8,
            display: "flex",
          }}
        />

        {/* Small top emblem */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              color: "#D9B96A",
              fontSize: 18,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            Vedic Sanctum & Upasana
          </div>
        </div>

        {/* Wordmark */}
        <div
          style={{
            display: "flex",
            fontSize: 68,
            fontWeight: "bold",
            color: "#FFFDF8",
            letterSpacing: "0.02em",
            textAlign: "center",
            marginBottom: 16,
            textShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
          }}
        >
          Maa Kali Astuti
        </div>

        {/* Gold divider */}
        <div
          style={{
            width: 140,
            height: 3,
            backgroundColor: "#B8923A",
            marginBottom: 24,
            display: "flex",
          }}
        />

        {/* Tagline */}
        <div
          style={{
            display: "flex",
            fontSize: 28,
            color: "#D9B96A",
            textAlign: "center",
            maxWidth: 840,
            lineHeight: 1.4,
            fontWeight: 500,
            marginBottom: 40,
          }}
        >
          Authentic Vedic Astrology, Energized Yantras & Sacred Remedies
        </div>

        {/* Brand footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            maxWidth: 720,
            borderTop: "1px solid rgba(184, 146, 58, 0.3)",
            paddingTop: 20,
            color: "#EAE0CA",
            fontSize: 18,
          }}
        >
          <div style={{ display: "flex" }}>
            Guided by Sadhak Pawan Pandey
          </div>
          <div style={{ display: "flex", color: "#D9B96A", fontWeight: 600 }}>
            sadhakpawanpandey.com
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}

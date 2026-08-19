import { ImageResponse } from "next/og";

export const alt = "Gongmozip";
export const contentType = "image/png";
export const size = {
  width: 1200,
  height: 630,
};

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "linear-gradient(135deg, #ff7658 0%, #ffb35c 100%)",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            alignItems: "center",
            display: "flex",
            flexDirection: "column",
            gap: 32,
          }}
        >
          <div
            style={{
              alignItems: "center",
              background: "#fff9df",
              borderRadius: 48,
              color: "#ff7658",
              display: "flex",
              fontSize: 132,
              fontWeight: 900,
              height: 240,
              justifyContent: "center",
              lineHeight: 1,
              width: 240,
            }}
          >
            G
          </div>
          <div
            style={{
              color: "#fff9df",
              fontSize: 96,
              fontWeight: 800,
              lineHeight: 1,
            }}
          >
            Gongmozip
          </div>
        </div>
      </div>
    ),
    size,
  );
}

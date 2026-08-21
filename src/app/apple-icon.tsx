import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0A0E13",
          color: "#E6A23C",
          fontSize: 72,
          fontWeight: 700,
          letterSpacing: -2,
        }}
      >
        CB
      </div>
    ),
    size,
  );
}

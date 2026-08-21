import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CrystalBall",
    short_name: "CrystalBall",
    description:
      "Pair discovery, watchlist monitoring, and market intelligence command center.",
    start_url: "/",
    display: "standalone",
    background_color: "#0A0E13",
    theme_color: "#0A0E13",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

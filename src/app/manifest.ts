import type { MetadataRoute } from "next";
import { SITE } from "@/config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: "QR MaR",
    description: SITE.description,
    start_url: "/",
    display: "standalone",
    background_color: "#e9f0e6",
    theme_color: "#1f4d36",
    lang: "id",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}

import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config/site";

/** Only the public entry points are listed; the client workspace is private. */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url.replace(/\/$/, "");
  return [
    { url: `${base}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/preview`, changeFrequency: "monthly", priority: 0.6 },
  ];
}

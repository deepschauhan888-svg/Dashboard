import type { MetadataRoute } from "next";
import { publications } from "@/lib/config/publications";
import { siteConfig } from "@/lib/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url.replace(/\/$/, "");
  const pages = ["", "/platform", "/about", "/publications", "/clients", "/contact", "/legal/privacy", "/legal/terms", "/legal/disclaimer"];
  return [
    ...pages.map((p) => ({ url: `${base}${p}`, changeFrequency: "monthly" as const, priority: p === "" ? 1 : 0.7 })),
    ...publications.map((p) => ({ url: `${base}/publications/${p.slug}`, lastModified: p.date, changeFrequency: "yearly" as const, priority: 0.5 })),
  ];
}

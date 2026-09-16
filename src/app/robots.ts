/**
 * App Router metadata route. Must live at src/app/robots.ts (app root),
 * not under [locale]. Next.js registers this as GET /robots.txt.
 */
import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/studio", "/studio/"],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}

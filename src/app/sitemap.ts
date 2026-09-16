/**
 * App Router metadata route. Must live at src/app/sitemap.ts (app root),
 * not under [locale] — otherwise Next emits /pl/sitemap.xml or nothing.
 * Production commit 89622075 had no such file, so Vercel listed neither
 * /sitemap.xml nor /robots.txt.
 */
import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { CATALOG_SLUGS } from "@/lib/catalog";
import { getSiteUrl } from "@/lib/site";

const STATIC_PATHS = [
  "",
  "/quiz",
  "/regulamin",
  "/polityka-prywatnosci",
] as const;

function localePath(locale: string, path: string): string {
  return `/${locale}${path}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const lastModified = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const path of STATIC_PATHS) {
      entries.push({
        url: `${base}${localePath(locale, path)}`,
        lastModified,
        changeFrequency: path === "" ? "daily" : "weekly",
        priority: path === "" ? 1 : 0.8,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((other) => [
              other,
              `${base}${localePath(other, path)}`,
            ])
          ),
        },
      });
    }

    for (const slug of CATALOG_SLUGS) {
      const path = `/products/${slug}`;
      entries.push({
        url: `${base}${localePath(locale, path)}`,
        lastModified,
        changeFrequency: "weekly",
        priority: 0.9,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((other) => [
              other,
              `${base}${localePath(other, path)}`,
            ])
          ),
        },
      });
    }
  }

  return entries;
}

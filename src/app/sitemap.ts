import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getPathname } from "@/i18n/navigation";
import { CATALOG_SLUGS } from "@/lib/catalog";
import { getSiteUrl } from "@/lib/site";

const STATIC_PATHS = [
  "/",
  "/quiz",
  "/regulamin",
  "/polityka-prywatnosci",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const lastModified = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const href of STATIC_PATHS) {
      entries.push({
        url: `${base}${getPathname({ locale, href })}`,
        lastModified,
        changeFrequency: href === "/" ? "daily" : "weekly",
        priority: href === "/" ? 1 : 0.8,
      });
    }

    for (const slug of CATALOG_SLUGS) {
      entries.push({
        url: `${base}${getPathname({
          locale,
          href: `/products/${slug}`,
        })}`,
        lastModified,
        changeFrequency: "weekly",
        priority: 0.9,
      });
    }
  }

  return entries;
}

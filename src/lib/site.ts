/** Canonical production origin (no trailing slash). */
export const DEFAULT_SITE_URL = "https://polish-mcommerce.vercel.app";

export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }
  return DEFAULT_SITE_URL;
}

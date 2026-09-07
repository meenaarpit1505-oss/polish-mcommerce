export const CAMPAIGN_ID_PATTERN = /^[a-zA-Z0-9._-]{1,80}$/;

export const SPONSOR_EVENT_TYPES = ["impression", "click", "copy"] as const;
export const SPONSOR_PLACEMENTS = ["top_banner", "in_feed_card"] as const;
export const SPONSOR_LOCALES = ["pl", "en"] as const;

export type SponsorEventType = (typeof SPONSOR_EVENT_TYPES)[number];
export type SponsorPlacement = (typeof SPONSOR_PLACEMENTS)[number];

export function isValidCampaignId(value: string): boolean {
  return CAMPAIGN_ID_PATTERN.test(value);
}

export function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

export function getSponsorSearchHref(brandName: string): string {
  return `/?search=${encodeURIComponent(brandName)}#produkty`;
}

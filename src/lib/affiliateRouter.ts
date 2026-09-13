export interface QuizSelection {
  skinType: "sucha" | "tlusta" | "mieszana";
  goal: "anti-age" | "acne" | "hydration";
}

/**
 * Real Nutriprofits nplink defaults (first-dollar Step 3).
 * Each env var below overrides the matching default so Vercel can rotate
 * links without a deploy. Defaults work even when env is not set yet.
 *
 * Product records do not currently carry per-SKU affiliate fields. Quiz
 * offers and these primary CTA fallbacks are the live click surfaces.
 *
 * Mapping:
 * 1. NEXT_PUBLIC_NUTRIPROFITS_LINK → https://nplink.net/zj0o7ps8
 *    Global / primary CTA fallback (unanswered quiz).
 * 2. NEXT_PUBLIC_MYLEAD_LINK       → https://nplink.net/rsmetkhe
 *    Quiz skin-type fallback: mixed (mieszana). Kept as the legacy
 *    NEXT_PUBLIC_MYLEAD_LINK slot so existing Vercel keys still apply.
 * 3. NEXT_PUBLIC_OFFER_ANTI_AGE    → https://nplink.net/68rypowt
 *    Quiz goal: anti-age.
 * 4. NEXT_PUBLIC_OFFER_ACNE_OILY   → https://nplink.net/inmfcwwk
 *    Quiz goal: acne; skin-type fallback: oily (tlusta).
 * 5. NEXT_PUBLIC_OFFER_HYDRATION   → https://nplink.net/5py84cbz
 *    Quiz goal: hydration; skin-type fallback: dry (sucha).
 */
export const DEFAULT_AFFILIATE_LINKS = {
  nutriprofits: "https://nplink.net/zj0o7ps8",
  mylead: "https://nplink.net/rsmetkhe",
  offerAntiAge: "https://nplink.net/68rypowt",
  offerAcneOily: "https://nplink.net/inmfcwwk",
  offerHydration: "https://nplink.net/5py84cbz",
} as const;

/**
 * High-conversion affiliate routing utility mapping user quiz answers
 * to targeted partner redirect URLs or custom landing pages.
 */
export function getAffiliateLink(answers: Partial<QuizSelection>): string {
  const defaultNutriprofits =
    process.env.NEXT_PUBLIC_NUTRIPROFITS_LINK || DEFAULT_AFFILIATE_LINKS.nutriprofits;
  const defaultMylead =
    process.env.NEXT_PUBLIC_MYLEAD_LINK || DEFAULT_AFFILIATE_LINKS.mylead;

  const offerAntiAge =
    process.env.NEXT_PUBLIC_OFFER_ANTI_AGE || DEFAULT_AFFILIATE_LINKS.offerAntiAge;
  const offerAcneOily =
    process.env.NEXT_PUBLIC_OFFER_ACNE_OILY || DEFAULT_AFFILIATE_LINKS.offerAcneOily;
  const offerHydration =
    process.env.NEXT_PUBLIC_OFFER_HYDRATION || DEFAULT_AFFILIATE_LINKS.offerHydration;

  // 1. Direct goal-based matching
  if (answers.goal === "anti-age") {
    return offerAntiAge;
  }
  if (answers.goal === "acne") {
    return offerAcneOily;
  }
  if (answers.goal === "hydration") {
    return offerHydration;
  }

  // 2. Skin-type secondary fallback matching
  if (answers.skinType === "sucha") {
    return offerHydration;
  }
  if (answers.skinType === "tlusta") {
    return offerAcneOily;
  }
  if (answers.skinType === "mieszana") {
    return defaultMylead;
  }

  // 3. Absolute global fallback
  return defaultNutriprofits;
}

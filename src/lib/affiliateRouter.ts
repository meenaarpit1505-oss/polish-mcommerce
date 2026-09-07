export interface QuizSelection {
  skinType: "sucha" | "tlusta" | "mieszana";
  goal: "anti-age" | "acne" | "hydration";
}

/**
 * High-conversion affiliate routing utility mapping user quiz answers
 * to targeted partner redirect URLs or custom landing pages.
 */
export function getAffiliateLink(answers: Partial<QuizSelection>): string {
  const defaultNutriprofits = process.env.NEXT_PUBLIC_NUTRIPROFITS_LINK || "https://nutriprofits.com";
  const defaultMylead = process.env.NEXT_PUBLIC_MYLEAD_LINK || "https://mylead.global";

  const offerAntiAge = process.env.NEXT_PUBLIC_OFFER_ANTI_AGE || defaultNutriprofits;
  const offerAcneOily = process.env.NEXT_PUBLIC_OFFER_ACNE_OILY || defaultMylead;
  const offerHydration = process.env.NEXT_PUBLIC_OFFER_HYDRATION || defaultNutriprofits;

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
    return offerAntiAge;
  }

  // 3. Absolute global fallback
  return defaultNutriprofits;
}

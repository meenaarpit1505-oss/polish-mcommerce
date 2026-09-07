import groq from "groq";

export const homePageQuery = groq`
  *[_type == "home" && locale == $locale][0] {
    hero {
      headline,
      subheadline,
      ctaLabel,
      ctaHref,
      secondaryMessage,
      "backgroundImage": backgroundImage.asset->url,
      campaignType
    },
    promo {
      title,
      endsAt,
      showStockIndicator,
      showRecentPurchases
    },
    recentPurchases[] {
      city,
      product
    }
  }
`;

export const categoriesQuery = groq`
  *[_type == "category" && locale == $locale] | order(sortOrder asc) {
    _id,
    name,
    "slug": slug.current,
    icon,
    sortOrder
  }
`;

export const featuredProductsQuery = groq`
  *[_type == "product" && locale == $locale && isFeatured == true] | order(stockCount asc) {
    _id,
    title,
    "slug": slug.current,
    pricePLN,
    priceEUR,
    originalPricePLN,
    originalPriceEUR,
    "image": image.asset->url,
    category,
    stockCount,
    isFeatured
  }
`;

export const activeSponsorshipQuery = groq`
  *[_type == "sponsorCampaign" && isActive == true && locale == $locale][0] {
    campaignId,
    brandName,
    isActive,
    locale,
    topBannerPromoCode,
    topBannerEndDate,
    topBannerPerk,
    topBannerOfferDescription,
    topBannerLink,
    cardPromoCode,
    cardProductTitle,
    "cardProductImage": cardProductImage.asset->url,
    cardOriginalPricePLN,
    cardPromoPricePLN,
    cardOriginalPriceEUR,
    cardPromoPriceEUR,
    cardDescription,
    cardLink,
    paczkomatCutoffHour
  }
`;

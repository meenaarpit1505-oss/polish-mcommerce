import type { HomePageData, SponsorCampaign } from "@/lib/types";
import type { Locale } from "@/i18n/routing";
import { getCatalogCategories, getCatalogProducts } from "@/lib/catalog";

const promoEndsAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

function buildMockHomeData(locale: Locale): HomePageData {
  const products = getCatalogProducts(locale);
  const isEn = locale === "en";

  return {
    hero: {
      headline: isEn
        ? "Partner supplements — buy on the official store"
        : "Suplementy partnerów — zakup w oficjalnym sklepie",
      subheadline: isEn
        ? "We recommend Nutriprofits offers. You complete payment on the partner store — not here."
        : "Rekomendujemy oferty Nutriprofits. Płatność finalizujesz w sklepie partnera — nie na tej stronie.",
      ctaLabel: isEn ? "See recommendations" : "Zobacz rekomendacje",
      ctaHref: "#produkty",
      secondaryMessage: isEn
        ? "VistulaVogue is an independent publisher. Product links are Nutriprofits affiliate links (nplink.net). Prices, BLIK/card payment, and delivery are handled by the partner store where you buy."
        : "VistulaVogue to niezależny wydawca. Linki do produktów są linkami afiliacyjnymi Nutriprofits (nplink.net). Ceny, płatność BLIK/kartą i dostawa są po stronie sklepu partnera, w którym kupujesz.",
      backgroundImage: "https://picsum.photos/seed/vistulavogue-hero/1200/800",
      campaignType: "sale",
    },
    categories: getCatalogCategories(locale),
    products,
    promo: {
      title: isEn ? "Featured partner offers" : "Polecane oferty partnerów",
      endsAt: promoEndsAt,
      showStockIndicator: true,
      showRecentPurchases: true,
    },
    recentPurchases: isEn
      ? [
          { city: "Warsaw", product: "Shilajit Extreme" },
          { city: "Kraków", product: "Silvets" },
          { city: "Wrocław", product: "Eyevita Plus" },
          { city: "Gdańsk", product: "Matcha Extreme" },
        ]
      : [
          { city: "Warszawa", product: "Shilajit Extreme" },
          { city: "Kraków", product: "Silvets" },
          { city: "Wrocław", product: "Eyevita Plus" },
          { city: "Gdańsk", product: "Matcha Extreme" },
        ],
  };
}

export function getMockHomeData(locale: Locale): HomePageData {
  return buildMockHomeData(locale);
}

const mockSponsorPl: SponsorCampaign = {
  campaignId: "lancerto-default-pl",
  brandName: "Lancerto",
  isActive: true,
  locale: "pl",
  topBannerPromoCode: "LANCERTO15",
  topBannerEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  topBannerPerk: "-15% na wszystko + darmowa dostawa InPost Paczkomat!",
  topBannerOfferDescription: "Wyjątkowa kolekcja męska i damska.",
  topBannerLink: "/?search=Lancerto#produkty",
  cardPromoCode: "LANCERTO20",
  cardProductTitle: "Garnitur z wełny premium",
  cardProductImage: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=650&auto=format&fit=crop",
  cardOriginalPricePLN: 1899,
  cardPromoPricePLN: 1499,
  cardOriginalPriceEUR: 440,
  cardPromoPriceEUR: 350,
  cardDescription: "Włoska wełna, perfekcyjny krój i krawiectwo na najwyższym poziomie. Odbierz limitowany rabat partnerski.",
  cardLink: "/?search=Lancerto#produkty",
  paczkomatCutoffHour: 16,
};

const mockSponsorEn: SponsorCampaign = {
  campaignId: "lancerto-default-en",
  brandName: "Lancerto",
  isActive: true,
  locale: "en",
  topBannerPromoCode: "LANCERTO15",
  topBannerEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  topBannerPerk: "Save 15% storewide + Free Shipping!",
  topBannerOfferDescription: "Discover the premium luxury autumn collection.",
  topBannerLink: "/?search=Lancerto#produkty",
  cardPromoCode: "LANCERTO20",
  cardProductTitle: "Premium Wool Suit",
  cardProductImage: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=650&auto=format&fit=crop",
  cardOriginalPricePLN: 1899,
  cardPromoPricePLN: 1499,
  cardOriginalPriceEUR: 440,
  cardPromoPriceEUR: 350,
  cardDescription: "Premium Italian wool, perfect fit and tailoring at the highest level. Claim your limited partner discount.",
  cardLink: "/?search=Lancerto#produkty",
  paczkomatCutoffHour: 16,
};

export function getMockSponsorshipData(locale: string): SponsorCampaign {
  return locale === "en" ? mockSponsorEn : mockSponsorPl;
}

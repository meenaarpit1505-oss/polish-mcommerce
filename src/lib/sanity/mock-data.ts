import type { HomePageData, SponsorCampaign } from "@/lib/types";
import type { Locale } from "@/i18n/routing";

const promoEndsAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

const mockDataPl: HomePageData = {
  hero: {
    headline: "Letnia wyprzedaż — do -40%",
    subheadline: "Najlepsze oferty sezonu na zdrowie, żywność, modę i elektronikę",
    ctaLabel: "Kup teraz",
    ctaHref: "#produkty",
    secondaryMessage:
      "Promocja obejmuje ponad 500 produktów od polskich i europejskich marek. Darmowa dostawa InPost od 199 zł. Oferta ważna do wyczerpania zapasów.",
    backgroundImage: "https://picsum.photos/seed/vistulavogue-hero/1200/800",
    campaignType: "sale",
  },
  categories: [
    { _id: "cat-1", name: "Zdrowie i uroda", slug: "zdrowie-i-uroda", icon: "sparkles", sortOrder: 1 },
    { _id: "cat-2", name: "Żywność i napoje", slug: "zywnosc-i-napoje", icon: "utensils", sortOrder: 2 },
    { _id: "cat-3", name: "Moda", slug: "moda", icon: "shirt", sortOrder: 3 },
    { _id: "cat-4", name: "Elektronika", slug: "elektronika", icon: "smartphone", sortOrder: 4 },
  ],
  products: [
    {
      _id: "prod-1",
      title: "Kurtka wiosenna Premium",
      slug: "kurtka-wiosenna",
      pricePLN: 249,
      priceEUR: 58,
      originalPricePLN: 399,
      originalPriceEUR: 93,
      image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80",
      category: "moda",
      stockCount: 7,
      isFeatured: true,
    },
    {
      _id: "prod-2",
      title: "Organiczny krem do twarzy",
      slug: "krem-do-twarzy",
      pricePLN: 119,
      priceEUR: 28,
      originalPricePLN: 179,
      originalPriceEUR: 42,
      image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600&q=80",
      category: "zdrowie-i-uroda",
      stockCount: 4,
      isFeatured: true,
    },
    {
      _id: "prod-3",
      title: "Słuchawki bezprzewodowe Pro",
      slug: "sluchawki-pro",
      pricePLN: 189,
      priceEUR: 44,
      originalPricePLN: 279,
      originalPriceEUR: 65,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
      category: "elektronika",
      stockCount: 12,
      isFeatured: true,
    },
    {
      _id: "prod-4",
      title: "Kawa ziarnista Arabica 1kg",
      slug: "kawa-arabica",
      pricePLN: 89,
      priceEUR: 21,
      originalPricePLN: 129,
      originalPriceEUR: 30,
      image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&q=80",
      category: "zywnosc-i-napoje",
      stockCount: 18,
      isFeatured: true,
    },
    {
      _id: "prod-5",
      title: "Torba skórzana Classic",
      slug: "torba-skorzana",
      pricePLN: 279,
      priceEUR: 65,
      image: "https://picsum.photos/seed/prod-leather-bag/600/600",
      category: "moda",
      stockCount: 9,
      isFeatured: true,
    },
    {
      _id: "prod-6",
      title: "Smartwatch Active",
      slug: "smartwatch-active",
      pricePLN: 449,
      priceEUR: 104,
      originalPricePLN: 599,
      originalPriceEUR: 139,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
      category: "elektronika",
      stockCount: 5,
      isFeatured: true,
    },
    {
      _id: "prod-7",
      title: "Naturalny olejek arganowy",
      slug: "olejek-arganowy",
      pricePLN: 59,
      priceEUR: 14,
      image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&q=80",
      category: "zdrowie-i-uroda",
      stockCount: 11,
      isFeatured: true,
    },
    {
      _id: "prod-8",
      title: "Ekologiczna herbata Matcha",
      slug: "herbata-matcha",
      pricePLN: 69,
      priceEUR: 16,
      image: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&q=80",
      category: "zywnosc-i-napoje",
      stockCount: 22,
      isFeatured: true,
    },
  ],
  promo: {
    title: "Oferta limitowana",
    endsAt: promoEndsAt,
    showStockIndicator: true,
    showRecentPurchases: true,
  },
  recentPurchases: [
    { city: "Warszawa", product: "Organiczny krem do twarzy" },
    { city: "Kraków", product: "Kurtka wiosenna Premium" },
    { city: "Wrocław", product: "Słuchawki bezprzewodowe Pro" },
    { city: "Gdańsk", product: "Smartwatch Active" },
    { city: "Poznań", product: "Torba skórzana Classic" },
  ],
};

const mockDataEn: HomePageData = {
  hero: {
    headline: "Summer Sale — Up to 40% Off",
    subheadline: "Best seasonal deals on health, food, fashion & electronics",
    ctaLabel: "Shop now",
    ctaHref: "#produkty",
    secondaryMessage:
      "Over 500 products from Polish and European brands. Free InPost delivery from 199 PLN. Offer valid while stocks last.",
    backgroundImage: "https://picsum.photos/seed/vistulavogue-hero/1200/800",
    campaignType: "sale",
  },
  categories: [
    { _id: "cat-1", name: "Health & Beauty", slug: "health-beauty", icon: "sparkles", sortOrder: 1 },
    { _id: "cat-2", name: "Food & Beverage", slug: "food-beverage", icon: "utensils", sortOrder: 2 },
    { _id: "cat-3", name: "Fashion", slug: "fashion", icon: "shirt", sortOrder: 3 },
    { _id: "cat-4", name: "Electronics", slug: "electronics", icon: "smartphone", sortOrder: 4 },
  ],
  products: mockDataPl.products.map((p) => ({
    ...p,
    category: p.category
      .replace("zdrowie-i-uroda", "health-beauty")
      .replace("zywnosc-i-napoje", "food-beverage")
      .replace("moda", "fashion")
      .replace("elektronika", "electronics"),
    title: p.title
      .replace("Kurtka wiosenna Premium", "Premium Spring Jacket")
      .replace("Organiczny krem do twarzy", "Organic Face Cream")
      .replace("Słuchawki bezprzewodowe Pro", "Wireless Pro Headphones")
      .replace("Kawa ziarnista Arabica 1kg", "Arabica Coffee Beans 1kg")
      .replace("Torba skórzana Classic", "Classic Leather Bag")
      .replace("Smartwatch Active", "Active Smartwatch")
      .replace("Naturalny olejek arganowy", "Natural Argan Oil")
      .replace("Ekologiczna herbata Matcha", "Organic Matcha Tea"),
  })),
  promo: {
    title: "Limited offer",
    endsAt: promoEndsAt,
    showStockIndicator: true,
    showRecentPurchases: true,
  },
  recentPurchases: [
    { city: "Warsaw", product: "Organic Face Cream" },
    { city: "Kraków", product: "Premium Spring Jacket" },
    { city: "Wrocław", product: "Wireless Pro Headphones" },
    { city: "Gdańsk", product: "Active Smartwatch" },
    { city: "Poznań", product: "Classic Leather Bag" },
  ],
};

export function getMockHomeData(locale: Locale): HomePageData {
  return locale === "en" ? mockDataEn : mockDataPl;
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

export type Currency = "PLN" | "EUR";

export type CampaignType = "sale" | "launch" | "seasonal";

export interface HeroBanner {
  headline: string;
  subheadline: string;
  ctaLabel: string;
  ctaHref: string;
  secondaryMessage: string;
  backgroundImage: string;
  campaignType: CampaignType;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  sortOrder: number;
}

export interface Product {
  _id: string;
  title: string;
  slug: string;
  pricePLN: number;
  priceEUR: number;
  originalPricePLN?: number;
  originalPriceEUR?: number;
  image: string;
  category: string;
  stockCount: number;
  isFeatured: boolean;
}

export interface ProductVariant {
  name: string;
  options: Array<{
    value: string;
    visualValue?: string;
    isAvailable: boolean;
  }>;
}

export interface ProductDetail extends Product {
  images?: string[];
  description?: string;
  lowestPrice30DaysPLN: number;
  lowestPrice30DaysEUR: number;
  variants?: ProductVariant[];
  specifications?: Array<{ key: string; value: string }>;
}

export interface PromoSection {
  title: string;
  endsAt: string;
  showStockIndicator: boolean;
  showRecentPurchases: boolean;
}

export interface RecentPurchase {
  city: string;
  product: string;
}

export interface HomePageData {
  hero: HeroBanner;
  categories: Category[];
  products: Product[];
  promo: PromoSection;
  recentPurchases: RecentPurchase[];
}

import type { HomePageData } from "@/lib/types";
import type { Locale } from "@/i18n/routing";
import { isSanityConfigured, sanityClient } from "./client";
import {
  categoriesQuery,
  featuredProductsQuery,
  homePageQuery,
} from "./queries";
import { getMockHomeData } from "./mock-data";

export async function fetchHomeData(locale: Locale): Promise<HomePageData> {
  if (!isSanityConfigured || !sanityClient) {
    return getMockHomeData(locale);
  }

  try {
    const [home, categories, products] = await Promise.all([
      sanityClient.fetch<Partial<HomePageData> | null>(homePageQuery, { locale }),
      sanityClient.fetch<HomePageData["categories"]>(categoriesQuery, { locale }),
      sanityClient.fetch<HomePageData["products"]>(featuredProductsQuery, {
        locale,
      }),
    ]);

    if (!home?.hero || !home.promo) {
      return getMockHomeData(locale);
    }

    return {
      hero: home.hero,
      categories: categories.length > 0 ? categories : getMockHomeData(locale).categories,
      products: products.length > 0 ? products : getMockHomeData(locale).products,
      promo: home.promo,
      recentPurchases:
        home.recentPurchases && home.recentPurchases.length > 0
          ? home.recentPurchases
          : getMockHomeData(locale).recentPurchases,
    };
  } catch {
    return getMockHomeData(locale);
  }
}

export const revalidate = 60;

import type { HomePageData } from "@/lib/types";
import type { Locale } from "@/i18n/routing";
import { isSanityConfigured, sanityClient } from "./client";
import {
  categoriesQuery,
  featuredProductsQuery,
  homePageQuery,
} from "./queries";
import { getMockHomeData } from "./mock-data";
import { mergeWithCatalog } from "@/lib/catalog";

export async function fetchHomeData(locale: Locale): Promise<HomePageData> {
  const mock = getMockHomeData(locale);

  if (!isSanityConfigured || !sanityClient) {
    return mock;
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
      return mock;
    }

    return {
      hero: home.hero,
      categories: categories.length > 0 ? categories : mock.categories,
      products: mergeWithCatalog(products ?? [], locale),
      promo: home.promo,
      recentPurchases:
        home.recentPurchases && home.recentPurchases.length > 0
          ? home.recentPurchases
          : mock.recentPurchases,
    };
  } catch {
    return mock;
  }
}

import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { fetchHomeData } from "@/lib/sanity/fetch-home-data";
import { HeroSection } from "@/components/home/HeroSection";
import { TrustBar } from "@/components/home/TrustBar";
import { CategoryNav } from "@/components/home/CategoryNav";
import { PromoSectionBlock } from "@/components/home/PromoSection";
import { RecentPurchaseToast } from "@/components/product/RecentPurchaseToast";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const data = await fetchHomeData(locale as Locale);

  return (
    <>
      <HeroSection hero={data.hero} />
      <TrustBar />
      <CategoryNav categories={data.categories} />
      <PromoSectionBlock promo={data.promo} products={data.products} categories={data.categories} />
      <RecentPurchaseToast
        purchases={data.recentPurchases}
        enabled={data.promo.showRecentPurchases}
      />
    </>
  );
}

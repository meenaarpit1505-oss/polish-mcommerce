import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { VipOnboarding } from "@/components/vip-onboarding";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isPl = locale === "pl";
  return {
    title: isPl ? "Klub VIP i early access" : "VIP Club & Early Access",
    description: isPl
      ? "Zarezerwuj miejsce w fali VIP, odbierz PDF i wyraź osobne zgody na newsletter oraz reklamy."
      : "Reserve a VIP wave seat, download the PDF, and give separate consents for newsletter and ads.",
  };
}

export default async function VipPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <VipOnboarding />
      </div>
    </main>
  );
}

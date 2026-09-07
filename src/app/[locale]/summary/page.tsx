import { setRequestLocale } from "next-intl/server";
import { SummaryStep } from "@/components/product/SummaryStep";
import { routing, type Locale } from "@/i18n/routing";
import { notFound } from "next/navigation";

interface SummaryPageProps {
  params: Promise<{ locale: string }>;
}

export default async function SummaryPage({ params }: SummaryPageProps) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <SummaryStep />
    </div>
  );
}

import { setRequestLocale } from "next-intl/server";
import { ShippingStep } from "@/components/product/ShippingStep";
import { routing, type Locale } from "@/i18n/routing";
import { notFound } from "next/navigation";

interface ShippingPageProps {
  params: Promise<{ locale: string }>;
}

export default async function ShippingPage({ params }: ShippingPageProps) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <ShippingStep />
    </div>
  );
}

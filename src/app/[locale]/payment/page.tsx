import { setRequestLocale } from "next-intl/server";
import { PaymentStep } from "@/components/product/PaymentStep";
import { routing, type Locale } from "@/i18n/routing";
import { notFound } from "next/navigation";

interface PaymentPageProps {
  params: Promise<{ locale: string }>;
}

export default async function PaymentPage({ params }: PaymentPageProps) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <PaymentStep />
    </div>
  );
}

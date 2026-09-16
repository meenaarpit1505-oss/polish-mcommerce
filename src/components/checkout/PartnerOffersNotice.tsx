"use client";

import { ExternalLink } from "lucide-react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getCatalogProducts } from "@/lib/catalog";
import type { Locale } from "@/i18n/routing";
import { PaymentsUnavailableNotice } from "@/components/checkout/PaymentsUnavailableNotice";

export function PartnerOffersNotice() {
  const locale = (useLocale() as Locale) || "pl";
  const isPl = locale === "pl";
  const products = getCatalogProducts(locale);

  return (
    <div className="space-y-4">
      <PaymentsUnavailableNotice locale={locale} />
      <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-4 space-y-3">
        <p className="text-sm font-black text-foreground">
          {isPl
            ? "Zakupy finalizujesz w sklepie partnera Nutriprofits"
            : "Purchases are completed on the Nutriprofits partner store"}
        </p>
        <p className="text-xs font-semibold text-muted leading-relaxed">
          {isPl
            ? "Ta strona nie przyjmuje BLIK-a, karty ani przelewu. Wybierz rekomendację i przejdź do oficjalnej oferty partnera (nplink.net)."
            : "This site does not accept BLIK, cards, or bank transfers. Choose a recommendation and continue to the partner’s official offer (nplink.net)."}
        </p>
        <ul className="space-y-2">
          {products.map((product) => (
            <li key={product.slug}>
              <a
                href={product.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="flex items-center justify-between gap-3 rounded-xl border border-accent/10 bg-surface px-3 py-2.5 text-xs font-bold hover:border-primary/40 hover:text-primary transition-colors"
              >
                <span>{product.title}</span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              </a>
            </li>
          ))}
        </ul>
        <p className="text-[11px] font-semibold text-muted">
          <Link href="/#produkty" className="text-primary underline">
            {isPl ? "Zobacz karty produktów na stronie" : "See product pages on this site"}
          </Link>
        </p>
      </div>
    </div>
  );
}

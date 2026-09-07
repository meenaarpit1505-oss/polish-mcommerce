"use client";

import { Clock } from "lucide-react";

export function PaymentsUnavailableNotice({ locale }: { locale: string }) {
  const isPl = locale === "pl";

  return (
    <div className="rounded-2xl border border-amber-200/80 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/20 px-4 py-3.5 text-xs font-semibold text-amber-900 dark:text-amber-300 leading-relaxed">
      <p className="flex items-start gap-2">
        <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <span>
          {isPl
            ? "Płatności BLIK, kartą i Google Pay włączymy po podłączeniu licencjonowanej bramki (PayU, Przelewy24 lub Stripe). Sklep jest online — nie pobieramy teraz prawdziwych płatności."
            : "BLIK, card, and Google Pay will go live after we connect a licensed gateway (PayU, Przelewy24, or Stripe). The storefront is online — we are not taking real payments yet."}
        </span>
      </p>
    </div>
  );
}

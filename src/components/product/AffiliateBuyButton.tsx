"use client";

import { ExternalLink } from "lucide-react";

interface AffiliateBuyButtonProps {
  href: string;
  locale: string;
  className?: string;
}

export function AffiliateBuyButton({
  href,
  locale,
  className,
}: AffiliateBuyButtonProps) {
  const isPl = locale === "pl";

  return (
    <div className={className}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-primary py-4 text-sm font-black text-white shadow-lg shadow-primary/20 hover:bg-primaryDark transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
      >
        <span>{isPl ? "Kup w sklepie partnera" : "Buy on partner store"}</span>
        <ExternalLink className="h-4 w-4 stroke-[2.5px]" />
      </a>
      <p className="mt-2 text-[11px] text-muted leading-relaxed text-center">
        {isPl
          ? "Link afiliacyjny Nutriprofits. Płatność, dostawa i umowa sprzedaży są po stronie sklepu partnera — nie zbieramy numerów kart ani kodów BLIK."
          : "Nutriprofits affiliate link. Payment, delivery, and the sales contract are on the partner store — we do not collect card numbers or BLIK codes."}
      </p>
    </div>
  );
}

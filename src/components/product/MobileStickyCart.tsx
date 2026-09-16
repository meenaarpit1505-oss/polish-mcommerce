"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { useLocale } from "next-intl";
import { useCurrency } from "@/providers/CurrencyProvider";
import { formatPrice, getProductPrice } from "@/lib/currency";
import type { ProductDetail } from "@/lib/types";

export function MobileStickyCart({ product }: { product: ProductDetail }) {
  const [visible, setVisible] = useState(false);
  const locale = useLocale();
  const { currency } = useCurrency();
  const price = getProductPrice(product, currency);
  const intlLocale = locale === "pl" ? "pl-PL" : "en-GB";

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky CTA when scrolled past 650px
      setVisible(window.scrollY > 650);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  const partnerHref = product.affiliateUrl;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-accent/10 bg-surface/90 backdrop-blur-lg px-4 py-3.5 shadow-xl sm:hidden flex items-center justify-between gap-4 animate-in slide-in-from-bottom duration-300">
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-accent/10 bg-background">
          <Image src={product.image} alt={product.title} fill className="object-cover" />
        </div>
        <div className="min-w-0 leading-tight">
          <p className="text-xs font-black text-foreground truncate max-w-32.5">{product.title}</p>
          <p className="text-xs font-black text-primary mt-0.5">{formatPrice(price, currency, intlLocale)}</p>
        </div>
      </div>
      
      {partnerHref ? (
        <a
          href={partnerHref}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-primary py-3 px-4 text-xs font-black text-white shadow-md shadow-primary/20 hover:bg-primaryDark active:scale-95 transition-all cursor-pointer min-h-11"
        >
          <ExternalLink className="h-4 w-4" />
          {locale === "pl" ? "Kup u partnera" : "Buy on partner store"}
        </a>
      ) : (
        <span className="flex-1 text-[11px] font-bold text-muted text-right">
          {locale === "pl" ? "Oferta partnerska niedostępna" : "Partner offer unavailable"}
        </span>
      )}
    </div>
  );
}

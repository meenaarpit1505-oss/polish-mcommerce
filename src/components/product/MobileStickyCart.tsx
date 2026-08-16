"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ShoppingCart, Check } from "lucide-react";
import { useLocale } from "next-intl";
import { useCurrency } from "@/providers/CurrencyProvider";
import { formatPrice, getProductPrice } from "@/lib/currency";
import { motion, AnimatePresence } from "framer-motion";
import type { ProductDetail } from "@/lib/types";

export function MobileStickyCart({ product }: { product: ProductDetail }) {
  const [visible, setVisible] = useState(false);
  const locale = useLocale();
  const { currency } = useCurrency();
  const price = getProductPrice(product, currency);
  const intlLocale = locale === "pl" ? "pl-PL" : "en-GB";

  // Cart adding state
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky CTA when scrolled past 650px
      setVisible(window.scrollY > 650);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleQuickAdd = () => {
    setIsAdding(true);
    setTimeout(() => {
      setIsAdding(false);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    }, 800);
  };

  if (!visible) return null;

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
      
      <button 
        type="button"
        onClick={handleQuickAdd}
        disabled={product.stockCount === 0 || isAdding}
        className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-primary py-3 px-4 text-xs font-black text-white shadow-md shadow-primary/20 hover:bg-primaryDark active:scale-95 transition-all cursor-pointer min-h-11 disabled:bg-neutral-300 disabled:shadow-none"
      >
        <AnimatePresence mode="wait">
          {isAdded ? (
            <motion.span
              key="added"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              className="flex items-center gap-1"
            >
              <Check className="h-4 w-4 stroke-[3px]" />
              {locale === "pl" ? "Dodano!" : "Added!"}
            </motion.span>
          ) : isAdding ? (
            <motion.span
              key="adding"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-4.5 w-4.5 animate-spin rounded-full border-2 border-white border-t-transparent"
            />
          ) : (
            <motion.span
              key="default"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
              className="flex items-center gap-1.5"
            >
              <ShoppingCart className="h-4 w-4" />
              {locale === "pl" ? "Do koszyka" : "Add to Cart"}
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}

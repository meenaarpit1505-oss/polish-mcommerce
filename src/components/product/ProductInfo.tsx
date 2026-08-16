"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, Check, ShieldCheck, ShoppingCart } from "lucide-react";
import { useCurrency } from "@/providers/CurrencyProvider";
import { formatPrice, getProductPrice, getProductOriginalPrice } from "@/lib/currency";
import { useLocale, useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import type { ProductDetail } from "@/lib/types";

interface ProductInfoProps {
  product: ProductDetail;
  reviewsSummary: { averageRating: number; totalCount: number };
}

export function ProductInfo({ product, reviewsSummary }: ProductInfoProps) {
  const { currency } = useCurrency();
  const locale = useLocale();
  const t = useTranslations("common");
  const intlLocale = locale === "pl" ? "pl-PL" : "en-GB";

  const price = getProductPrice(product, currency);
  const originalPrice = getProductOriginalPrice(product, currency);
  const isDiscounted = !!originalPrice && originalPrice > price;

  // Compute Omnibus lowest price from last 30 days (must be equal to or lower than current price, or customized)
  const lowestPrice30Days = currency === "PLN" 
    ? product.lowestPrice30DaysPLN || Math.round(price * 0.9)
    : product.lowestPrice30DaysEUR || Math.round(price * 0.9);

  // Variant States
  const [selectedColor, setSelectedColor] = useState<string>(
    product.variants?.[0]?.options[0]?.value || (locale === "pl" ? "Oliwkowy" : "Olive Green")
  );
  const [selectedSize, setSelectedSize] = useState<string>(
    product.variants?.[1]?.options[1]?.value || "M"
  );
  
  // Cart adding animation state
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    setIsAdding(true);
    setTimeout(() => {
      setIsAdding(false);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    }, 800);
  };

  const scrollToReviews = () => {
    const reviewsEl = document.getElementById("reviews");
    if (reviewsEl) {
      reviewsEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Stock indicator computation
  const lowStockLimit = 15;
  const percentage = Math.min((product.stockCount / lowStockLimit) * 100, 100);

  return (
    <div className="space-y-6">
      {/* Category and Title */}
      <div>
        <p className="text-xs font-extrabold uppercase tracking-widest text-primary">
          {product.category.toUpperCase().replace("-", " & ")}
        </p>
        <h1 className="mt-1 text-3xl font-black text-foreground tracking-tight leading-tight">
          {product.title}
        </h1>
      </div>

      {/* Trust Rating Stars linked to reviews */}
      <div className="flex items-center gap-2">
        <button 
          onClick={scrollToReviews}
          className="flex items-center gap-1 group cursor-pointer text-left focus:outline-none"
        >
          <div className="flex gap-0.5 text-amber-400">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star 
                key={s} 
                className={`h-4.5 w-4.5 fill-current transition-transform duration-200 group-hover:scale-110 ${
                  s <= Math.round(reviewsSummary.averageRating) ? "text-amber-400" : "text-neutral-200"
                }`} 
              />
            ))}
          </div>
          <span className="text-sm font-bold text-muted underline decoration-dotted group-hover:text-primary transition-colors">
            {reviewsSummary.totalCount} {locale === "pl" ? "zweryfikowanych opinii" : "verified reviews"}
          </span>
        </button>
      </div>

      {/* Omnibus Compliant Pricing Display */}
      <div className="rounded-2xl bg-accent-light/30 border border-accent/10 p-5 space-y-2 shadow-sm">
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-black text-primary tracking-tight">
            {formatPrice(price, currency, intlLocale)}
          </span>
          
          {isDiscounted && (
            <>
              <span className="text-lg text-muted line-through font-medium">
                {formatPrice(originalPrice, currency, intlLocale)}
              </span>
              <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-black text-rose-600">
                {locale === "pl" ? "Oszczędzasz" : "Save"} {Math.round(((originalPrice - price) / originalPrice) * 100)}%
              </span>
            </>
          )}
        </div>

        {/* Legal Omnibus Notice required by UOKiK in Poland */}
        <p className="text-[11px] text-muted leading-relaxed">
          {locale === "pl" ? (
            <>
              Cena zawiera podatek VAT. Najniższa cena z 30 dni przed obniżką:{" "}
              <span className="font-extrabold text-foreground">
                {formatPrice(lowestPrice30Days, currency, intlLocale)}
              </span>
            </>
          ) : (
            <>
              VAT included. Lowest price within 30 days prior to discount:{" "}
              <span className="font-extrabold text-foreground">
                {formatPrice(lowestPrice30Days, currency, intlLocale)}
              </span>
            </>
          )}
        </p>
      </div>

      {/* Dynamic Swatches instead of dropdowns */}
      {product.variants && product.variants.map((v) => {
        const isColor = v.name.toLowerCase() === "kolor" || v.name.toLowerCase() === "color";
        return (
          <div key={v.name} className="space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-foreground">
              {v.name}: <span className="text-muted font-semibold">{isColor ? selectedColor : selectedSize}</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {v.options.map((opt) => {
                if (isColor && opt.visualValue) {
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={!opt.isAvailable}
                      onClick={() => setSelectedColor(opt.value)}
                      style={{ backgroundColor: opt.visualValue }}
                      className={`relative h-10 w-10 rounded-full border shadow-sm transition-all cursor-pointer ${
                        selectedColor === opt.value 
                          ? "ring-4 ring-primary/20 border-primary scale-110" 
                          : "border-transparent hover:scale-105"
                      } ${!opt.isAvailable ? "opacity-30 cursor-not-allowed line-through" : ""}`}
                      title={opt.value}
                    >
                      {selectedColor === opt.value && (
                        <Check className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
                      )}
                    </button>
                  );
                } else {
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={!opt.isAvailable}
                      onClick={() => setSelectedSize(opt.value)}
                      className={`flex h-11 w-14 items-center justify-center rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                        selectedSize === opt.value
                          ? "border-primary bg-primary/5 text-primary shadow-sm"
                          : "border-accent/10 bg-surface text-foreground hover:border-accent/30"
                      } ${!opt.isAvailable ? "opacity-30 cursor-not-allowed line-through" : ""}`}
                    >
                      {opt.value}
                    </button>
                  );
                }
              })}
            </div>
          </div>
        );
      })}

      {/* Low-Stock Warning Progression Bar */}
      <div className="space-y-2 py-2">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500"></span>
          </span>
          <p className="text-xs font-bold text-rose-600">
            {locale === "pl" 
              ? `Pośpiesz się! Ostatnie ${product.stockCount} sztuk w magazynie.`
              : `Hurry! Only ${product.stockCount} items left in stock.`
            }
          </p>
        </div>
        <div className="h-1.5 w-full rounded-full bg-accent/10 overflow-hidden">
          <div 
            style={{ width: `${percentage}%` }}
            className="h-full rounded-full bg-rose-500 transition-all duration-1000 ease-out"
          />
        </div>
      </div>

      {/* High-Contrast Interactive Add to Cart button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={product.stockCount === 0 || isAdding}
          className="relative flex w-full items-center justify-center overflow-hidden rounded-full bg-primary py-4 text-sm font-black text-white shadow-lg shadow-primary/20 hover:bg-primaryDark transition-all hover:scale-[1.01] active:scale-[0.99] disabled:bg-neutral-300 disabled:shadow-none disabled:cursor-not-allowed cursor-pointer"
        >
          <AnimatePresence mode="wait">
            {isAdded ? (
              <motion.span
                key="added"
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -15, opacity: 0 }}
                className="flex items-center gap-1.5"
              >
                <Check className="h-4.5 w-4.5 stroke-[3px]" />
                {locale === "pl" ? "Dodano do koszyka!" : "Added to Cart!"}
              </motion.span>
            ) : isAdding ? (
              <motion.span
                key="adding"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"
              />
            ) : (
              <motion.span
                key="default"
                initial={{ y: -15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 15, opacity: 0 }}
                className="flex items-center gap-2"
              >
                <ShoppingCart className="h-4.5 w-4.5" />
                {locale === "pl" ? "Dodaj do koszyka" : "Add to Cart"}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Trust Badges - InPost and BLIK */}
      <div className="grid grid-cols-2 gap-3 border-t border-accent/10 pt-5 text-xs text-muted">
        <div className="flex items-center gap-2.5 rounded-2xl border border-accent/5 p-3.5 bg-surface shadow-sm hover:border-primary/10 transition-colors">
          <div className="relative h-8 w-12 shrink-0">
            <Image src="/trust/inpost.svg" alt="InPost Paczkomat" fill className="object-contain" />
          </div>
          <div className="leading-tight">
            <p className="font-extrabold text-foreground">{locale === "pl" ? "InPost Paczkomat" : "InPost Locker"}</p>
            <p className="text-[10px] mt-0.5">{locale === "pl" ? "Dostawa jutro u Ciebie" : "Next-day delivery"}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 rounded-2xl border border-accent/5 p-3.5 bg-surface shadow-sm hover:border-primary/10 transition-colors">
          <div className="relative h-8 w-12 shrink-0">
            <Image src="/trust/blik.svg" alt="Płatność BLIK" fill className="object-contain" />
          </div>
          <div className="leading-tight">
            <p className="font-extrabold text-foreground">{locale === "pl" ? "Płatność BLIK" : "BLIK Payment"}</p>
            <p className="text-[10px] mt-0.5">{locale === "pl" ? "Szybko i bezpiecznie" : "Fast and secure"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useRef, type MouseEvent } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Product } from "@/lib/types";
import {
  formatPrice,
  getProductOriginalPrice,
  getProductPrice,
} from "@/lib/currency";
import { useCurrency } from "@/providers/CurrencyProvider";

interface ProductCardProps {
  product: Product;
  showStock?: boolean;
  lowStockThreshold?: number;
}

export function ProductCard({
  product,
  showStock = true,
  lowStockThreshold = 10,
}: ProductCardProps) {
  const t = useTranslations("common");
  const locale = useLocale();
  const { currency } = useCurrency();
  const cardRef = useRef<HTMLDivElement>(null);

  const price = getProductPrice(product, currency);
  const originalPrice = getProductOriginalPrice(product, currency);
  const isLowStock = product.stockCount < lowStockThreshold;
  const intlLocale = locale === "pl" ? "pl-PL" : "en-GB";

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(800px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg)`;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg)";
  };

  return (
    <motion.article
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group overflow-hidden rounded-2xl border border-accent/10 bg-surface shadow-sm transition-all duration-300 ease-out hover:border-primary/20 hover:shadow-md will-change-transform h-full"
    >
      <Link href={`/products/${product.slug}`} className="block h-full cursor-pointer">
        <div className="relative aspect-square overflow-hidden bg-background">
          <Image
            src={product.image}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {showStock && isLowStock && (
            <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-white">
              {t("limitedStock")}
            </span>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {product.title}
          </h3>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-lg font-bold text-primary">
              {formatPrice(price, currency, intlLocale)}
            </span>
            {originalPrice && (
              <span className="text-sm text-muted line-through">
                {formatPrice(originalPrice, currency, intlLocale)}
              </span>
            )}
          </div>

          {showStock && (
            <p className="mt-1 text-xs text-muted">
              {product.stockCount} {t("leftInStock")}
            </p>
          )}
        </div>
      </Link>
    </motion.article>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { X } from "lucide-react";
import type { Category, Product, PromoSection } from "@/lib/types";
import { Countdown } from "@/components/ui/Countdown";
import { ProductCard } from "@/components/product/ProductCard";
import { useSearchParams } from "next/navigation";
import { useRouter, usePathname } from "@/i18n/navigation";

interface PromoSectionProps {
  promo: PromoSection;
  products: Product[];
  categories: Category[];
}

const LOW_STOCK_THRESHOLD = 10;

export function PromoSectionBlock({ promo, products, categories }: PromoSectionProps) {
  const t = useTranslations("promo");
  const locale = useLocale();
  const [activeCategory, setActiveCategory] = useState<string>("");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchQuery = searchParams?.get("search") || "";

  // Handle URL hash changes to filter categories interactively
  useEffect(() => {
    const handleHashChange = () => {
      // Decode URL hash to support special/accented characters (e.g., %C5%BCywnosc-i-napoje)
      const hash = decodeURIComponent(window.location.hash.replace("#", ""));
      setActiveCategory(hash);
    };

    window.addEventListener("hashchange", handleHashChange);
    handleHashChange(); // Run check on initial load

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  // Filter products:
  // 1. If search is active, show matching products (case-insensitive checking title or category)
  // 2. Else if category is active, show all in that category.
  // 3. Otherwise, show promo/low-stock products (limited to top 3).
  let displayedProducts = products;
  if (searchQuery) {
    const term = searchQuery.toLowerCase().trim();
    displayedProducts = products.filter(
      (p) =>
        p.title.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term)
    );
  } else if (activeCategory) {
    displayedProducts = products.filter((p) => p.category.toLowerCase() === activeCategory.toLowerCase());
  } else {
    displayedProducts = products
        .filter((p) => p.originalPricePLN || p.stockCount < LOW_STOCK_THRESHOLD)
        .slice(0, 3);
  }

  // Find the selected Category object for custom header naming
  const selectedCategoryObj = categories.find(
    (c) => c.slug.toLowerCase() === activeCategory.toLowerCase()
  );

  const clearFilter = () => {
    if (searchQuery) {
      router.push(pathname);
    } else {
      window.location.hash = "";
      setActiveCategory("");
    }
  };

  // If there are no products to display, hide the section gracefully (except when searching)
  if (displayedProducts.length === 0 && !searchQuery) return null;

  return (
    <section className="relative bg-linear-to-br from-primary/5 to-accent/5 py-8 sm:py-10 transition-colors duration-300">
      {/* Scroll-to targets with offset for sticky header */}
      <div id="produkty" className="absolute -top-24" />
      {categories.map((cat) => (
        <div key={cat._id} id={cat.slug} className="absolute -top-24" />
      ))}

      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2.5 items-start">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-bold text-foreground sm:text-2xl">
                {searchQuery ? (
                  locale === "pl"
                    ? `Wyniki wyszukiwania dla: "${searchQuery}"`
                    : `Search results for: "${searchQuery}"`
                ) : selectedCategoryObj ? (
                  selectedCategoryObj.name
                ) : (
                  promo.title || t("title")
                )}
              </h2>
              {(activeCategory || searchQuery) && (
                <button
                  type="button"
                  onClick={clearFilter}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/25 px-3 py-1 text-xs font-bold text-primary hover:bg-primary hover:text-white transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
                  aria-label="Clear filter"
                >
                  <X className="h-3 w-3" />
                  <span>{locale === "pl" ? "Wyczyść" : "Clear"}</span>
                </button>
              )}
            </div>
            <p className="text-sm text-muted">
              {searchQuery ? (
                locale === "pl"
                  ? `Znaleziono ${displayedProducts.length} produktów`
                  : `Found ${displayedProducts.length} products`
              ) : activeCategory ? (
                locale === "pl" ? "Przeglądasz wybraną kategorię" : "Viewing selected category"
              ) : (
                t("endsIn")
              )}
            </p>
          </div>

          {/* Only show countdown when no category and no search is active */}
          {!activeCategory && !searchQuery && <Countdown endsAt={promo.endsAt} />}
        </div>

        {displayedProducts.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <p className="text-lg font-medium text-foreground/75">
              {locale === "pl"
                ? "Nie znaleziono produktów spełniających kryteria."
                : "No products found matching your search."}
            </p>
            <p className="mt-2 text-sm text-muted">
              {locale === "pl"
                ? "Spróbuj wpisać inną frazę lub wyczyść filtry."
                : "Try typing a different keyword or clear the filters."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {displayedProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                showStock={promo.showStockIndicator}
                lowStockThreshold={LOW_STOCK_THRESHOLD}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

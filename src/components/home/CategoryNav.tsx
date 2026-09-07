"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Sparkles,
  Utensils,
  Shirt,
  Smartphone,
  X,
  Mail,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { Category } from "@/lib/types";
import { MagneticButton } from "@/components/ui/MagneticButton";

const iconMap: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  utensils: Utensils,
  shirt: Shirt,
  smartphone: Smartphone,
};

const COMING_SOON_SLUGS = [
  "moda",
  "elektronika",
  "fashion",
  "electronics",
  "zywnosc-i-napoje",
  "food-beverage",
];

interface CategoryNavProps {
  categories: Category[];
}

export function CategoryNav({ categories }: CategoryNavProps) {
  const t = useTranslations("categories");
  const [selectedComingSoonCategory, setSelectedComingSoonCategory] = useState<Category | null>(null);
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCategoryClick = (e: React.MouseEvent<HTMLAnchorElement>, category: Category) => {
    if (COMING_SOON_SLUGS.includes(category.slug.toLowerCase())) {
      e.preventDefault();
      setSelectedComingSoonCategory(category);
      setIsSubscribed(false);
      setEmail("");
    }
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubscribed(true);
      setEmail("");
    }, 1200);
  };

  return (
    <section className="py-8 sm:py-10">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">
            {t("title")}
          </h2>
          <p className="mt-1 text-sm text-muted">{t("subtitle")}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {categories.map((category) => {
            const Icon = iconMap[category.icon] ?? Shirt;
            return (
              <MagneticButton key={category._id} className="h-full w-full">
                <a
                  href={`#${category.slug}`}
                  onClick={(e) => handleCategoryClick(e, category)}
                  className="flex h-full w-full min-h-22 flex-col items-center justify-center gap-2 rounded-2xl border border-accent/15 bg-surface p-4 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <span className="text-center text-sm font-semibold text-foreground">
                    {category.name}
                  </span>
                </a>
              </MagneticButton>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {selectedComingSoonCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedComingSoonCategory(null)}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-accent/15 bg-surface p-6 shadow-2xl sm:p-8"
            >
              <button
                type="button"
                onClick={() => setSelectedComingSoonCategory(null)}
                className="absolute top-4 right-4 rounded-full p-1.5 text-muted transition-colors hover:bg-accent-light/10 hover:text-foreground cursor-pointer"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                {(() => {
                  const IconComponent = iconMap[selectedComingSoonCategory.icon] ?? Shirt;
                  return <IconComponent className="h-8 w-8 animate-pulse" />;
                })()}
              </div>

              {!isSubscribed ? (
                <>
                  <h3 className="text-center text-2xl font-bold tracking-tight text-foreground">
                    {t("comingSoonTitle", { category: selectedComingSoonCategory.name })}
                  </h3>
                  <p className="mt-3 text-center text-sm leading-relaxed text-muted">
                    {t("comingSoonDesc", { category: selectedComingSoonCategory.name })}
                  </p>

                  <form onSubmit={handleSubscribe} className="mt-6 space-y-3">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t("emailPlaceholder")}
                        className="w-full rounded-xl border border-accent/15 bg-background py-3 pl-10 pr-4 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full rounded-full bg-primary py-3 text-sm font-bold text-white transition-all hover:bg-primary-dark shadow-[0_4px_12px_rgba(16,185,129,0.25)] hover:shadow-[0_4px_20px_rgba(16,185,129,0.45)] disabled:opacity-75 cursor-pointer"
                    >
                      {isSubmitting ? t("notifyLoading") : t("notifyMe")}
                    </button>
                  </form>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center py-4 text-center"
                >
                  <CheckCircle2 className="h-14 w-14 text-primary animate-bounce mb-3" />
                  <h3 className="text-xl font-bold tracking-tight text-foreground">
                    {t("successTitle")}
                  </h3>
                  <p className="mt-2 text-sm text-muted max-w-xs">
                    {t("successDesc", { category: selectedComingSoonCategory.name })}
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelectedComingSoonCategory(null)}
                    className="mt-6 rounded-full border border-accent/15 hover:border-primary/20 bg-background/50 px-6 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-accent-light/10 cursor-pointer"
                  >
                    {t("closeBtn")}
                  </button>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

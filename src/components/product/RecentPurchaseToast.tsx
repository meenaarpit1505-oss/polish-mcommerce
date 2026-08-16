"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import type { RecentPurchase } from "@/lib/types";

interface RecentPurchaseToastProps {
  purchases: RecentPurchase[];
  enabled?: boolean;
}

export function RecentPurchaseToast({
  purchases,
  enabled = true,
}: RecentPurchaseToastProps) {
  const t = useTranslations("products");
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled || purchases.length === 0) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion) return;

    const show = () => {
      setVisible(true);
      setTimeout(() => setVisible(false), 4000);
    };

    const initialTimer = setTimeout(show, 3000);
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % purchases.length);
      show();
    }, 10000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [enabled, purchases.length]);

  if (!enabled || purchases.length === 0) return null;

  const current = purchases[index];

  return (
    <div className="pointer-events-none fixed bottom-20 left-4 right-4 z-40 sm:bottom-6 sm:left-auto sm:right-6 sm:max-w-sm">
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="rounded-xl border border-accent/20 bg-surface px-4 py-3 shadow-lg"
            role="status"
            aria-live="polite"
          >
            <p className="text-sm text-foreground">
              {t("recentPurchase", {
                city: current.city,
                product: current.product,
              })}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

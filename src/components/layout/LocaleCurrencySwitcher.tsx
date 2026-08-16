"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useState, useTransition, useEffect } from "react";
import { motion } from "framer-motion";

// High-quality, lightweight SVG Flag Components
function PolandFlag() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 10"
      className="h-3.5 w-auto rounded-xs shadow-xs border border-black/10"
    >
      <rect width="16" height="5" fill="#ffffff" />
      <rect y="5" width="16" height="5" fill="#D4213D" />
    </svg>
  );
}

function UKFlag() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 60 30"
      className="h-3.5 w-auto rounded-xs shadow-xs border border-black/10"
    >
      <path fill="#012169" d="M0 0h60v30H0z" />
      <path stroke="#ffffff" strokeWidth="6" d="M0 0l60 30M60 0L0 30" />
      <path stroke="#c8102e" strokeWidth="2" d="M0 0l60 30M60 0L0 30" />
      <path stroke="#ffffff" strokeWidth="10" d="M30 0v30M0 15h60" />
      <path stroke="#c8102e" strokeWidth="6" d="M30 0v30M0 15h60" />
    </svg>
  );
}

export function LocaleCurrencySwitcher() {
  const locale = useLocale() as "pl" | "en";
  const pathname = usePathname();
  const router = useRouter();

  // Optimistic state for instant visual feedback
  const [activeLocale, setActiveLocale] = useState<"pl" | "en">(locale);
  const [, startTransition] = useTransition();

  // Keep local state in sync with actual locale if it changes externally
  useEffect(() => {
    setActiveLocale(locale);
  }, [locale]);

  const handleLocaleChange = (nextLocale: "pl" | "en") => {
    if (locale !== nextLocale) {
      // Instantly update the UI state
      setActiveLocale(nextLocale);
      
      // Perform the route transition in the background without scrolling to top
      startTransition(() => {
        router.replace(pathname, { locale: nextLocale, scroll: false });
      });
    }
  };

  return (
    <div className="flex shrink-0 items-center gap-2">
      <div className="relative flex items-center gap-0.5 rounded-full border border-accent/20 bg-surface p-1 sm:gap-1">
        {/* Poland Button */}
        <button
          type="button"
          onClick={() => handleLocaleChange("pl")}
          aria-label="Polski"
          title="Polski"
          className={`relative flex h-6 items-center gap-1 rounded-full px-1.5 text-[10px] font-bold uppercase transition-colors duration-200 z-10 focus:outline-none cursor-pointer sm:px-2.5 ${
            activeLocale === "pl"
              ? "text-white"
              : "text-muted hover:text-foreground"
          }`}
        >
          <PolandFlag />
          <span className="hidden sm:inline">PL</span>
          
          {/* Smooth sliding background pill */}
          {activeLocale === "pl" && (
            <motion.div
              layoutId="activeLocalePill"
              className="absolute inset-0 bg-primary rounded-full -z-10 shadow-xs"
              transition={{
                type: "spring",
                stiffness: 380,
                damping: 30
              }}
            />
          )}
        </button>

        {/* UK Button */}
        <button
          type="button"
          onClick={() => handleLocaleChange("en")}
          aria-label="English"
          title="English"
          className={`relative flex h-6 items-center gap-1 rounded-full px-1.5 text-[10px] font-bold uppercase transition-colors duration-200 z-10 focus:outline-none cursor-pointer sm:px-2.5 ${
            activeLocale === "en"
              ? "text-white"
              : "text-muted hover:text-foreground"
          }`}
        >
          <UKFlag />
          <span className="hidden sm:inline">EN</span>
          
          {/* Smooth sliding background pill */}
          {activeLocale === "en" && (
            <motion.div
              layoutId="activeLocalePill"
              className="absolute inset-0 bg-primary rounded-full -z-10 shadow-xs"
              transition={{
                type: "spring",
                stiffness: 380,
                damping: 30
              }}
            />
          )}
        </button>
      </div>
    </div>
  );
}

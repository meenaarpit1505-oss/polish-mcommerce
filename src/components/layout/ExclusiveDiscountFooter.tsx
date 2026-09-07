"use client";

import { useState, useEffect, useRef } from "react";
import { X, Sparkles, Copy, Check, Clock, ArrowRight, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ExclusiveDiscountFooterProps {
  /**
   * Simple bilingual control prop.
   * Can be driven by page params, next-intl, or standard locale routing.
   * @default "pl"
   */
  lang?: "pl" | "en";
  /**
   * Target promotional code.
   * @default "WELCOME15"
   */
  promoCode?: string;
}

// Inline translations dictionary for self-containment and zero external dependency
const translations = {
  pl: {
    badge: "Tylko teraz",
    tagline: "Odbierz -15% na pierwsze zakupy.",
    urgencyText: "Twój kod wygasa za",
    minutesText: "min",
    copy: "Kopiuj kod",
    copied: "Skopiowano!",
    warningTitle: "Czy na pewno chcesz bezpowrotnie stracić tę zniżkę?",
    discard: "Tak, odrzuć",
    keep: "Zatrzymaj",
    compliance: "Zniżka dotyczy nieprzecenionych produktów. Regulamin promocji.",
    ariaLabel: "Ekskluzywny rabat powitalny",
  },
  en: {
    badge: "Limited",
    tagline: "Get -15% off your first purchase.",
    urgencyText: "Your code expires in",
    minutesText: "min",
    copy: "Copy code",
    copied: "Copied!",
    warningTitle: "Are you sure you want to permanently lose this discount?",
    discard: "Yes, discard",
    keep: "Keep it",
    compliance: "Discount valid for non-discounted items. Terms apply.",
    ariaLabel: "Exclusive welcome discount banner",
  },
};

export function ExclusiveDiscountFooter({
  lang = "pl",
  promoCode = "WELCOME15",
}: ExclusiveDiscountFooterProps) {
  const t = translations[lang] || translations.pl;

  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(600); // 10 minutes lifetime timer
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Prevent Next.js SSR Hydration Mismatch & Handle Persisted Dismissal
  useEffect(() => {
    setMounted(true);
    
    const dismissedKey = "discount_footer_dismissed_7d";
    const dismissalTimestamp = localStorage.getItem(dismissedKey);
    
    if (dismissalTimestamp) {
      const now = new Date().getTime();
      const diffTime = now - parseInt(dismissalTimestamp, 10);
      const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
      
      // If 7 days haven't passed yet, keep it hidden
      if (diffTime < sevenDaysInMs) {
        return;
      } else {
        localStorage.removeItem(dismissedKey);
      }
    }

    // CRO Hook: Delay entrance by 3 seconds for visual prominence
    const entranceTimer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(entranceTimer);
  }, []);

  // 2. Linear Countdown Urgency Timer Loop
  useEffect(() => {
    if (!isVisible || secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible, secondsLeft]);

  // 3. Dynamic layout cleanup on unmount
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const formatTimer = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // 4. Clipboard Handling with browser safety fallbacks
  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(promoCode);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = promoCode;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
      }

      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy coupon code:", err);
    }
  };

  // 5. Persistent 7-Day Dismissal Hook
  const handleConfirmDiscard = () => {
    const dismissedKey = "discount_footer_dismissed_7d";
    localStorage.setItem(dismissedKey, new Date().getTime().toString());
    setIsVisible(false);
  };

  // Hydration safety: Return null on server, transition height smoothly into layout
  if (!mounted) return null;

  const progressPercentage = (secondsLeft / 600) * 100;

  return (
    <>
      {/* 
        PREVENT LAYOUT SHIFT (CLS Guard):
        This absolute layout reserve block keeps standard footer links visible 
        and pushes them up when the sticky bar mounts, ensuring perfect UX ergonomics.
      */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "56px" }}
            exit={{ height: 0 }}
            className="relative w-full shrink-0 pointer-events-none"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed bottom-0 left-0 right-0 z-50 h-14 border-t border-zinc-800 bg-zinc-950 text-slate-100 shadow-[0_-8px_30px_rgba(0,0,0,0.5)] select-none"
            role="banner"
            aria-label={t.ariaLabel}
          >
            {/* 
              URGENCY ELEMENT: 2px Countdown Progress bar 
              Shrinks smoothly over time
            */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-zinc-900 overflow-hidden">
              <div
                style={{ width: `${progressPercentage}%` }}
                className="h-full bg-linear-to-r from-emerald-500 to-teal-400 transition-all duration-1000 ease-linear"
              />
            </div>

            {/* Glowing mesh background for premium tactile ambiance */}
            <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-80 h-16 rounded-full bg-emerald-500/20 blur-[35px]" />
            </div>

            <div className="relative mx-auto flex h-full max-w-7xl items-center justify-between gap-3 px-4 overflow-hidden">
              <AnimatePresence mode="wait">
                {!showWarning ? (
                  // =================== VIEW A: STANDARD DISCOUNT OFFER ===================
                  <motion.div
                    key="promo-view"
                    initial={{ x: 0, opacity: 1 }}
                    exit={{ x: -100, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex w-full items-center justify-between gap-3"
                  >
                    {/* Left: Dynamic Pulsing Badge & Offer Headline */}
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Premium Pulse Tag */}
                      <span className="relative inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-400">
                        <span className="absolute inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping opacity-75" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        {t.badge}
                      </span>

                      {/* Main Message and Local Compliancy */}
                      <div className="min-w-0 leading-tight">
                        <div className="flex flex-wrap items-center gap-x-2">
                          <p className="text-xs sm:text-sm font-semibold tracking-tight text-zinc-100">
                            {t.tagline}
                          </p>
                          <p className="hidden md:flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
                            <Clock className="h-3 w-3 text-emerald-400 animate-pulse" />
                            <span>
                              {t.urgencyText}{" "}
                              <span className="font-mono font-black text-emerald-400">
                                {formatTimer(secondsLeft)}
                              </span>{" "}
                              {t.minutesText}
                            </span>
                          </p>
                        </div>
                        {/* Omnibus EU / UOKiK Poland Compliance Guard */}
                        <p className="hidden xs:block text-[8px] text-zinc-500 font-medium tracking-wide mt-0.5 truncate max-w-sm md:max-w-lg">
                          {t.compliance}
                        </p>
                      </div>
                    </div>

                    {/* Right: Copy Promo CTA Button & Dismissal Button */}
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                      {/* Mobile Urgent Timer Indicator (visible only when timer hidden in desktop view) */}
                      <span className="md:hidden font-mono font-bold text-xs text-emerald-400 shrink-0 mr-1 flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                        {formatTimer(secondsLeft)}
                      </span>

                      {/* Tactile copy voucher */}
                      <button
                        onClick={handleCopy}
                        className="relative overflow-hidden inline-flex h-9 items-center gap-1.5 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 border border-emerald-400/20 active:scale-95 rounded-lg px-3 sm:px-4 text-xs font-black text-zinc-950 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400/50 shadow-[0_3px_12px_rgba(16,185,129,0.2)] group"
                        title={t.copy}
                        aria-live="polite"
                      >
                        <span className="tracking-wide">{t.copy}:</span>
                        <span className="font-mono tracking-wider font-extrabold text-[11px] sm:text-xs bg-zinc-950/10 py-0.5 px-1 rounded-sm">
                          {promoCode}
                        </span>
                        {copied ? (
                          <Check className="h-3.5 w-3.5 text-zinc-950 animate-scale-in shrink-0" />
                        ) : (
                          <Copy className="h-3 w-3 group-hover:translate-x-0.5 transition-transform shrink-0" />
                        )}
                        
                        {/* Instant clipboard feedback card overlay */}
                        <AnimatePresence>
                          {copied && (
                            <motion.span
                              initial={{ opacity: 0, y: 12 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -12 }}
                              className="absolute inset-0 flex items-center justify-center bg-zinc-950 text-emerald-400 text-xs font-bold rounded-lg border border-emerald-400/20"
                            >
                              {t.copied}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </button>

                      {/* Elegant split border */}
                      <span className="h-4 w-px bg-zinc-800" aria-hidden="true" />

                      {/* Close Trigger Button (Swaps view to Loss-Aversion Frame) */}
                      <button
                        onClick={() => setShowWarning(true)}
                        className="rounded-full p-1.5 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-100 transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-zinc-800"
                        aria-label="Dismiss discount offer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  // =================== VIEW B: LOSS AVERSION WARNING ===================
                  <motion.div
                    key="warning-view"
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 100, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex w-full items-center justify-between gap-3"
                  >
                    {/* Warning Notice text */}
                    <div className="flex items-center gap-2 min-w-0">
                      <ShieldAlert className="h-4 w-4 text-amber-500 animate-bounce shrink-0" />
                      <p className="text-xs sm:text-sm font-bold tracking-tight text-zinc-200 truncate">
                        {t.warningTitle}
                      </p>
                    </div>

                    {/* Dual Action Buttons (Accept loss or Keep deal) */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Decline option (Soft, lower contrast) */}
                      <button
                        onClick={handleConfirmDiscard}
                        className="h-8 rounded-md bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 hover:text-red-400 px-3 text-xs font-bold text-zinc-400 transition-all cursor-pointer focus:outline-none"
                      >
                        {t.discard}
                      </button>

                      {/* Keep option (High Contrast glowing CTA - returns to screen) */}
                      <button
                        onClick={() => setShowWarning(false)}
                        className="inline-flex h-8 items-center justify-center gap-1 rounded-md bg-emerald-500 hover:bg-emerald-400 px-4 text-xs font-black text-zinc-950 transition-all cursor-pointer focus:outline-none shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95"
                      >
                        <span>{t.keep}</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

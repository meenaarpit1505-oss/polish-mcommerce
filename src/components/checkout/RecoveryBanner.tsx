"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, ShieldCheck, Smartphone, Landmark } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useCartRecoveryStore } from "@/lib/cart-recovery-store";
import type { CheckoutSession } from "@/lib/cart-recovery-types";

const SPRING = { type: "spring" as const, stiffness: 300, damping: 30 };

function formatMmSs(totalSeconds: number): string {
  const clamped = Math.max(0, totalSeconds);
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function secondsUntil(iso: string | null): number {
  if (!iso) return 0;
  const end = Date.parse(iso);
  if (!Number.isFinite(end)) return 0;
  return Math.max(0, Math.ceil((end - Date.now()) / 1000));
}

/**
 * Sticky recovery chrome. Renders only after a signed abandonment link hydrates
 * a recovered session. Timer is driven by server `offerExpiresAt` (no client-invented window).
 */
export function RecoveryBanner() {
  const searchParams = useSearchParams();
  const session = useCartRecoveryStore((s) => s.session);
  const hydrateFromServer = useCartRecoveryStore((s) => s.hydrateFromServer);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [linkError, setLinkError] = useState<string | null>(null);

  const recover = searchParams.get("recover");
  const token = searchParams.get("t");
  const sig = searchParams.get("s");

  const activateFromLink = useCallback(async () => {
    if (!recover || !token || !sig) return;
    setLinkError(null);
    try {
      const params = new URLSearchParams({
        session_id: recover,
        t: token,
        s: sig,
      });
      const res = await fetch(`/api/checkout/recover?${params.toString()}`);
      const data = (await res.json()) as { session?: CheckoutSession; error?: string };
      if (!res.ok || !data.session) {
        setLinkError(data.error ?? "Nie udało się wznowić koszyka.");
        return;
      }
      hydrateFromServer(data.session);
    } catch {
      setLinkError("Nie udało się wznowić koszyka. Spróbuj ponownie.");
    }
  }, [recover, token, sig, hydrateFromServer]);

  useEffect(() => {
    void activateFromLink();
  }, [activateFromLink]);

  const isRecovered = session?.phase === "recovered" && Boolean(session.offerExpiresAt);

  useEffect(() => {
    if (!isRecovered || !session?.offerExpiresAt) return;
    setSecondsLeft(secondsUntil(session.offerExpiresAt));
    const id = window.setInterval(() => {
      setSecondsLeft(secondsUntil(session.offerExpiresAt));
    }, 1000);
    return () => window.clearInterval(id);
  }, [isRecovered, session?.offerExpiresAt]);

  const visible = Boolean(isRecovered);
  const expired = visible && secondsLeft <= 0;
  const discount = session?.recoveryDiscountPercent;

  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.div
            layoutId="recovery-banner"
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={SPRING}
            className="sticky top-0 z-40 border-b border-rose-200/80 dark:border-rose-900/40 bg-rose-50/95 dark:bg-rose-950/90 backdrop-blur-md"
            role="status"
            aria-live="polite"
          >
            <div className="mx-auto max-w-6xl px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-start gap-2.5 min-w-0">
                <ShieldCheck className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm font-black text-slate-900 dark:text-white leading-snug">
                    Dokończ swoje zamówienie. Twój koszyk został bezpiecznie zarezerwowany.
                  </p>
                  <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                    {discount != null && discount > 0
                      ? `Zabezpieczyliśmy Twój rabat ${discount}% na wybrane produkty (cena przed obniżką zgodna z Omnibus). Oferta wygasa za:`
                      : "Zachowaliśmy ceny z Twojego koszyka. Okno dokończenia wygasa za:"}
                    <span
                      className="ml-1 inline-block w-[4.5ch] text-rose-700 dark:text-rose-300 font-black"
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      {expired ? "00:00" : formatMmSs(secondsLeft)}
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href="#platnosc-blik"
                  className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 text-white text-[11px] font-black px-3 py-2 hover:bg-rose-700 transition-colors"
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  BLIK
                </a>
                <a
                  href="#platnosc-p24"
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100 text-[11px] font-black px-3 py-2"
                >
                  <Landmark className="h-3.5 w-3.5" />
                  Przelewy24
                </a>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-slate-500">
                  <Clock className="h-3 w-3" />
                  15 min
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {linkError && recover && (
        <p className="mx-auto max-w-6xl px-4 pt-3 text-[11px] font-semibold text-rose-600">
          {linkError}{" "}
          <Link href="/polityka-prywatnosci" className="underline">
            Polityka prywatności
          </Link>
        </p>
      )}
    </>
  );
}

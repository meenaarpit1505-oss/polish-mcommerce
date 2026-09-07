"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Check, Mail, ShieldCheck } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useParams } from "next/navigation";

interface RestockAlertProps {
  productSlug: string;
  productName: string;
}

const translations = {
  pl: {
    triggerBtn: "Powiadom mnie o dostawie",
    triggerBtnSub: "Zapisz się, aby otrzymać alert jako pierwszy",
    title: "Chcę wiedzieć o powrocie produktu",
    desc: "Wpisz swój e-mail, a nasz system natychmiast wyśle Ci powiadomienie, gdy tylko produkt pojawi się ponownie na stanie magazynowym.",
    emailPlaceholder: "Wpisz swój najlepszy e-mail...",
    consent: "Zgadzam się na przetwarzanie mojego adresu e-mail przez Administratora w celu przesłania jednorazowego powiadomienia o dostępności produktu. Zgoda jest dobrowolna.",
    errorEmail: "Wprowadź prawidłowy adres e-mail.",
    errorConsent: "Wymagana jest akceptacja zgody.",
    submit: "Zapisz mnie na powiadomienie",
    successMsg: "Pomyślnie zapisano! Powiadomimy Cię w sekundę po dostawie.",
  },
  en: {
    triggerBtn: "Notify me when available",
    triggerBtnSub: "Be the first to know when it is back",
    title: "Get restock notifications",
    desc: "Enter your email, and our warehouse management system will automatically alert you the exact second this product restocks.",
    emailPlaceholder: "Enter your email address...",
    consent: "I agree to the processing of my email address by the Administrator to receive a one-time product restock alert.",
    errorEmail: "Please enter a valid email address.",
    errorConsent: "Consent acceptance is required.",
    submit: "Keep me updated",
    successMsg: "Successfully subscribed! We will notify you instantly upon restock.",
  }
};

export function RestockAlert({ productSlug, productName }: RestockAlertProps) {
  const params = useParams();
  const locale = (params?.locale as "pl" | "en") || "pl";
  const t = translations[locale] || translations.pl;

  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [gdprConsent, setGdprConsent] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !email.includes("@")) {
      setErrorMsg(t.errorEmail);
      return;
    }

    if (!gdprConsent) {
      setErrorMsg(t.errorConsent);
      return;
    }

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          consentGdpr: gdprConsent,
          actionType: "notify_alert",
          metaData: {
            productSlug,
            productName,
            locale
          }
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        setTimeout(() => {
          setIsOpen(false);
          setIsSubmitted(false);
          setEmail("");
          setGdprConsent(false);
        }, 3500);
      } else {
        const data = await response.json();
        setErrorMsg(data.error || "Błąd zapisu powiadomienia.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(locale === "pl" ? "Problem z siecią." : "Network failure.");
    }
  };

  return (
    <>
      {/* Visual, tactile trigger button for out-of-stock items */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full flex flex-col items-center justify-center py-3.5 px-6 rounded-full border-2 border-dashed border-primary bg-primary/5 hover:bg-primary/10 active:scale-[0.98] transition-all text-center cursor-pointer group"
      >
        <span className="flex items-center gap-2 font-black text-sm text-primary uppercase tracking-wider">
          <Bell className="h-4.5 w-4.5 animate-pulse group-hover:rotate-12 transition-transform" />
          {t.triggerBtn}
        </span>
        <span className="text-[10px] font-bold text-slate-500 mt-0.5">
          {t.triggerBtnSub}
        </span>
      </button>

      {/* Drawer Overlay/Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-950/70 z-50 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-x-4 bottom-6 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-md z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 overflow-hidden"
              role="dialog"
              aria-modal="true"
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Zamknij"
              >
                <X className="h-4 w-4" />
              </button>

              <AnimatePresence mode="wait">
                {!isSubmitted ? (
                  <motion.div
                    key="restock-form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="flex items-center gap-2.5 mb-3.5">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bell className="h-5 w-5 text-primary animate-bounce" />
                      </div>
                      <div>
                        <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">
                          Alarm dostępności
                        </h3>
                        <p className="text-xs font-black text-slate-950 dark:text-white mt-1.5 truncate max-w-60">
                          {productName}
                        </p>
                      </div>
                    </div>

                    <h4 className="text-md font-bold tracking-tight text-slate-900 dark:text-white mt-1 leading-snug">
                      {t.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-2">
                      {t.desc}
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-3.5 mt-4.5">
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="email"
                          required
                          placeholder={t.emailPlaceholder}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-semibold"
                        />
                      </div>

                      <div className="flex items-start gap-2">
                        <input
                          id="restock-gdpr"
                          type="checkbox"
                          checked={gdprConsent}
                          onChange={(e) => setGdprConsent(e.target.checked)}
                          className="mt-0.5 h-3.5 w-3.5 rounded-xs text-primary border-slate-300 focus:ring-primary cursor-pointer"
                        />
                        <label htmlFor="restock-gdpr" className="text-[9px] leading-relaxed text-slate-500 dark:text-slate-400 font-semibold select-none cursor-pointer">
                          {t.consent}{" "}
                          <Link href="/polityka-prywatnosci" target="_blank" className="underline font-bold hover:text-primary">
                            Polityka Prywatności
                          </Link>.
                        </label>
                      </div>

                      {errorMsg && (
                        <p className="text-[11px] text-rose-500 font-bold bg-rose-50 dark:bg-rose-950/30 p-2 rounded-lg border border-rose-100 dark:border-rose-900/30">
                          ⚠️ {errorMsg}
                        </p>
                      )}

                      <button
                        type="submit"
                        className="w-full py-3.5 bg-primary hover:bg-primaryDark text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md active:scale-[0.98] transition-all cursor-pointer"
                      >
                        {t.submit}
                      </button>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="restock-success"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center py-6 space-y-3.5"
                  >
                    <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                      <Check className="h-6 w-6 text-emerald-500 stroke-[3px]" />
                    </div>
                    <h3 className="text-md font-black tracking-tight text-slate-900 dark:text-white">
                      Zapisano!
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                      {t.successMsg}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

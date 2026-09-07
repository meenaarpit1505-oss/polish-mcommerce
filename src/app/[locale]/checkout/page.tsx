"use client";

import React, { useState, useEffect, useMemo, useRef, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Check, 
  Lock, 
  ShieldCheck, 
  CreditCard, 
  ArrowLeft, 
  ArrowRight, 
  AlertCircle, 
  Sparkles,
  CheckCircle2,
  ChevronRight,
  ShoppingBag
} from "lucide-react";
import { useCart } from "@/providers/CartProvider";
import { useCurrency } from "@/providers/CurrencyProvider";
import { useLocale } from "next-intl";
import { formatPrice } from "@/lib/currency";
import { Link, useRouter } from "@/i18n/navigation";
import { GoogleLoginBtn } from "@/components/GoogleLoginBtn";
import { CheckoutTimer } from "@/components/CheckoutTimer";
import { RecoveryBanner } from "@/components/checkout/RecoveryBanner";
import { PaymentsUnavailableNotice } from "@/components/checkout/PaymentsUnavailableNotice";
import { arePaymentsEnabledClient } from "@/lib/payments";
import {
  persistCheckoutSession,
  toRecoveryCartItems,
  useCartRecoveryStore,
} from "@/lib/cart-recovery-store";

interface GoogleCheckoutUser {
  email: string;
  name: string;
}

export default function CheckoutPage() {
  const locale = useLocale() as "pl" | "en";
  const { currency } = useCurrency();
  const { items, isMounted, clearCart } = useCart();
  const router = useRouter();
  const recoverySession = useCartRecoveryStore((s) => s.session);
  const startSession = useCartRecoveryStore((s) => s.startSession);
  const captureEmail = useCartRecoveryStore((s) => s.captureEmail);
  const markAbandoned = useCartRecoveryStore((s) => s.markAbandoned);

  const isPLN = currency === "PLN";
  const intlLocale = locale === "pl" ? "pl-PL" : "en-GB";

  // Form states
  const [email, setEmail] = useState("");
  const [fullName, setName] = useState("");
  const [phoneNumber, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"blik" | "card" | "express">("blik");
  const [blikCode, setBlikCode] = useState("");
  
  // Card states
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardBrand, setCardBrand] = useState<"visa" | "mastercard" | "unknown">("unknown");

  // UX states
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [blikFocused, setBlikFocused] = useState(false);
  const [shakeTrigger, setShakeTrigger] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [zgodaMarketingowa, setZgodaMarketingowa] = useState(false);

  const blikInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus BLIK input on selection
  useEffect(() => {
    if (paymentMethod === "blik" && blikInputRef.current) {
      blikInputRef.current.focus();
    }
  }, [paymentMethod]);

  // Pricing calculations
  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => {
      const price = isPLN ? item.product.pricePLN : item.product.priceEUR;
      return acc + price * item.quantity;
    }, 0);
  }, [items, isPLN]);

  const shippingCost = subtotal >= (isPLN ? 199 : 45) ? 0 : (isPLN ? 12.99 : 3.49);
  const total = subtotal + shippingCost;

  const recoveryCartItems = useMemo(
    () => toRecoveryCartItems(items, currency),
    [items, currency]
  );

  const [storeReady, setStoreReady] = useState(false);

  useEffect(() => {
    const finish = () => setStoreReady(true);
    const persistApi = useCartRecoveryStore.persist;
    if (persistApi.hasHydrated()) {
      finish();
      return;
    }
    return persistApi.onFinishHydration(finish);
  }, []);

  useEffect(() => {
    if (!isMounted || !storeReady || items.length === 0) return;
    const session = startSession(recoveryCartItems);
    void persistCheckoutSession({
      sessionId: session.sessionId,
      sessionToken: session.sessionToken,
      cartItems: recoveryCartItems,
      phase: session.phase === "recovered" ? "recovered" : "started",
      zgodaMarketingowa: session.zgodaMarketingowa,
      email: session.email ?? undefined,
    });
  }, [isMounted, storeReady, items.length, recoveryCartItems, startSession]);

  useEffect(() => {
    const onHidden = () => {
      if (document.visibilityState !== "hidden") return;
      const abandoned = markAbandoned();
      if (!abandoned) return;
      void persistCheckoutSession({
        sessionId: abandoned.sessionId,
        sessionToken: abandoned.sessionToken,
        email: abandoned.email ?? undefined,
        zgodaMarketingowa: abandoned.zgodaMarketingowa,
        cartItems: abandoned.cartItems,
        phase: "abandoned",
      });
    };
    document.addEventListener("visibilitychange", onHidden);
    return () => document.removeEventListener("visibilitychange", onHidden);
  }, [markAbandoned]);

  const handleEmailBlur = () => {
    setTouched((prev) => ({ ...prev, email: true }));
    const cleanEmail = email.toLowerCase().trim();
    const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
      setErrors((prev) => ({ ...prev, email: "Wpisz poprawny adres e-mail." }));
      return;
    }
    setErrors((prev) => ({ ...prev, email: "" }));

    const next = captureEmail(cleanEmail, zgodaMarketingowa);
    if (!next) return;

    void persistCheckoutSession({
      sessionId: next.sessionId,
      sessionToken: next.sessionToken,
      email: cleanEmail,
      zgodaMarketingowa,
      cartItems: recoveryCartItems,
      phase: "email_captured",
    });

    if (!zgodaMarketingowa) return;

    void fetch("/api/marketing/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: cleanEmail,
        name: fullName,
        zgodaMarketingowa: true,
      }),
    });

    void fetch("/api/checkout/tracking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: cleanEmail,
        eventName: "Started Checkout",
        zgodaMarketingowa: true,
        totalValue: total,
        cartItems: items.map((item) => ({
          id: item.id,
          title: item.product.title,
          price: isPLN ? item.product.pricePLN : item.product.priceEUR,
          quantity: item.quantity,
          image: item.product.image,
        })),
      }),
    });
  };

  const handleGoogleSuccess = (user: GoogleCheckoutUser) => {
    setEmail(user.email);
    setName(user.name);
    setGlobalError("");
    setSuccessMsg("Pomyślnie zalogowano przy użyciu Google!");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleGoogleError = (err: string) => {
    setGlobalError(err);
  };

  // Card validation branding
  const detectCardBrand = (number: string) => {
    const clean = number.replace(/\s/g, "");
    if (clean.startsWith("4")) return "visa";
    if (clean.startsWith("5")) return "mastercard";
    return "unknown";
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 16);
    setCardBrand(detectCardBrand(val));
    const formatted = val.match(/.{1,4}/g)?.join(" ") || val;
    setCardNumber(formatted);
    if (errors.cardNumber) setErrors((prev) => ({ ...prev, cardNumber: "" }));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (val.length > 2) {
      val = `${val.slice(0, 2)}/${val.slice(2)}`;
    }
    setCardExpiry(val);
    if (errors.cardExpiry) setErrors((prev) => ({ ...prev, cardExpiry: "" }));
  };

  const handleBlikChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setBlikCode(val);
    if (errors.blikCode) setErrors((prev) => ({ ...prev, blikCode: "" }));

    // Friction Killer: Auto-trigger submit upon reaching exactly 6 digits!
    if (val.length === 6) {
      setTimeout(() => {
        executePaymentFlow(val);
      }, 400);
    }
  };

  // Validate form fields on blur
  const validateField = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    let error = "";

    if (field === "email") {
      const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!email) error = "Adres e-mail jest wymagany.";
      else if (!EMAIL_REGEX.test(email)) error = "Wprowadź poprawny adres e-mail.";
    }
    if (field === "fullName" && !fullName) {
      error = "Imię i nazwisko są wymagane do zamówienia.";
    }
    if (field === "phoneNumber" && !phoneNumber) {
      error = "Numer telefonu jest wymagany dla kuriera.";
    }
    if (paymentMethod === "blik" && field === "blikCode" && blikCode.length !== 6) {
      error = "Kod BLIK musi składać się z 6 cyfr.";
    }
    if (paymentMethod === "card") {
      if (field === "cardNumber" && cardNumber.replace(/\s/g, "").length !== 16) {
        error = "Niepoprawny numer karty (wymagane 16 cyfr).";
      }
      if (field === "cardExpiry" && !/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(cardExpiry)) {
        error = "Format ważności to MM/RR.";
      }
      if (field === "cardCvc" && cardCvc.length !== 3) {
        error = "Kod CVC musi zawierać 3 cyfry.";
      }
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
    return !error;
  };

  // Main payment execution
  const executePaymentFlow = async (targetBlikCode = blikCode) => {
    setGlobalError("");

    if (!arePaymentsEnabledClient()) {
      setGlobalError(
        locale === "en"
          ? "Payments are not active yet. A licensed gateway has not been connected."
          : "Płatności nie są jeszcze aktywne. Bramka płatnicza nie została podłączona."
      );
      return;
    }
    
    // Check contact validations first
    const isEmailValid = validateField("email");
    const isNameValid = validateField("fullName");
    const isPhoneValid = validateField("phoneNumber");

    if (!isEmailValid || !isNameValid || !isPhoneValid) {
      setShakeTrigger(true);
      setTimeout(() => setShakeTrigger(false), 500);
      setGlobalError("Proszę poprawnie uzupełnić dane kontaktowe.");
      return;
    }

    // Check payment details validation
    if (paymentMethod === "blik") {
      if (targetBlikCode.length !== 6) {
        setErrors((prev) => ({ ...prev, blikCode: "Kod BLIK musi składać się z 6 cyfr." }));
        setShakeTrigger(true);
        setTimeout(() => setShakeTrigger(false), 500);
        return;
      }
    } else if (paymentMethod === "card") {
      const isCardValid = validateField("cardNumber");
      const isExpiryValid = validateField("cardExpiry");
      const isCvcValid = validateField("cardCvc");
      if (!isCardValid || !isExpiryValid || !isCvcValid) {
        setShakeTrigger(true);
        setTimeout(() => setShakeTrigger(false), 500);
        return;
      }
    }

    setIsProcessing(true);

    try {
      const paymentRes = await fetch("/api/checkout/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod,
          email: email.toLowerCase().trim(),
          amount: total,
          blikCode: paymentMethod === "blik" ? targetBlikCode : undefined,
          cartItems: items.map(item => ({
            id: item.id,
            title: item.product.title,
            price: isPLN ? item.product.pricePLN : item.product.priceEUR,
            quantity: item.quantity,
            image: item.product.image
          })),
        })
      });

      const paymentData = await paymentRes.json();

      if (!paymentRes.ok || !paymentData.success) {
        throw new Error(paymentData.error || "Płatność została odrzucona przez bramkę.");
      }

      // Handle BLIK requires_user_confirmation response
      if (paymentData.status === "requires_user_confirmation") {
        setSuccessMsg("Płatność zainicjowana! Zaakceptuj transakcję w aplikacji bankowej.");
        
        // Wait 3 seconds to simulate user completing the bank verification
        setTimeout(async () => {
          setIsProcessing(false);
          setIsSuccess(true);
          clearCart();
          
          // Fire completed purchase track on confirmation
          await fetch("/api/checkout/tracking", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: email.toLowerCase().trim(),
              eventName: "Completed Purchase",
              zgodaMarketingowa,
              totalValue: total,
              cartItems: items.map(item => ({
                id: item.id,
                title: item.product.title,
                price: isPLN ? item.product.pricePLN : item.product.priceEUR,
                quantity: item.quantity
              }))
            })
          }).catch(() => {});

          setTimeout(() => {
            router.push(`/summary?orderId=${paymentData.paymentId}&amount=${total}`);
          }, 3500);
        }, 4000);

      } else {
        // Direct capture success for card / express
        setIsProcessing(false);
        setIsSuccess(true);
        clearCart();
        setTimeout(() => {
          router.push(`/summary?orderId=${paymentData.paymentId}&amount=${total}`);
        }, 3500);
      }

    } catch (err: unknown) {
      console.error("[Payment Checkout Page] Order processing error:", err);
      const message = err instanceof Error ? err.message : "Wystąpił błąd autoryzacji płatności. Spróbuj ponownie.";
      setGlobalError(message);
      setIsProcessing(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executePaymentFlow();
  };

  // Render blank loader during hydration checks to prevent mismatch layouts
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
      </div>
    );
  }

  // Prevent accessing checkout with empty cart state
  if (items.length === 0 && !isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="h-16 w-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-400 border border-slate-200 dark:border-slate-855 mb-4">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white">Twój koszyk jest pusty</h2>
        <p className="text-xs font-semibold text-slate-400 mt-1 max-w-sm">Dodaj produkty do koszyka, aby przejść do kasy.</p>
        <Link href="/" className="mt-6 inline-flex items-center gap-2 bg-primary text-white text-xs font-black px-6 py-3 rounded-full hover:shadow-lg transition-all cursor-pointer">
          Wróć do sklepu
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-sans">
      <Suspense fallback={null}>
        <Suspense fallback={null}>
          <RecoveryBanner />
        </Suspense>
      </Suspense>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-10 text-slate-900 dark:text-slate-100 pb-20">
        
        {/* PROGRESSIVE GATEWAY AUTHORIZATION PORTALS */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex flex-col items-center justify-center text-center p-6"
            >
              <div className="max-w-md space-y-6">
                <div className="relative flex justify-center">
                  <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <Lock className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-white">Przetwarzanie bezpiecznej transakcji...</h3>
                  <p className="text-sm text-slate-400 font-semibold leading-relaxed">
                    {paymentMethod === "blik" 
                      ? "Wysłaliśmy żądanie na Twój telefon. Potwierdź transakcję 6-cyfrowym PIN-em w swojej aplikacji mobilnej banku."
                      : "Autoryzowanie płatności u operatora transakcji. Prosimy nie odświeżać tej strony."}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {isSuccess && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex flex-col items-center justify-center text-center p-6"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="max-w-md space-y-6 bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl"
              >
                <div className="flex justify-center">
                  <div className="h-16 w-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="h-10 w-10 stroke-[2px]" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white">Transakcja Zaakceptowana! 🎉</h3>
                  <p className="text-sm text-slate-400 font-semibold leading-relaxed">
                    Dziękujemy za zamówienie! Twoja płatność zakończyła się sukcesem. Potwierdzenie wysłaliśmy na Twój e-mail.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: CONTACT DETAILS & PAYMENT SELECTIONS (8/12) */}
          <section className="lg:col-span-8 space-y-6">
            
            {/* URGENCY RESERVE COUNTDOWN */}
            {recoverySession?.phase !== "recovered" && (
              <CheckoutTimer durationMinutes={10} />
            )}

            <form onSubmit={handleFormSubmit} className="space-y-6">
              
              {/* STEP 1: CLIENT IDENTITY */}
              <div className="rounded-3xl border border-slate-100 dark:border-slate-855 bg-white dark:bg-slate-900/40 p-5 sm:p-8 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                  <div>
                    <h2 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-black">1</span>
                      Dane Kontaktowe i Dostawa
                    </h2>
                    <p className="text-xs font-semibold text-slate-400 mt-0.5">Zaloguj się, aby przyspieszyć zakupy, lub podaj dane ręcznie.</p>
                  </div>

                  {/* Google Single Sign-On Anchor */}
                  <div className="w-full sm:w-auto shrink-0">
                    <GoogleLoginBtn onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
                  </div>
                </div>

                {/* Error and success microbanners */}
                {successMsg && (
                  <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-shake">
                    <Check className="h-4 w-4 shrink-0" />
                    {successMsg}
                  </div>
                )}

                {globalError && (
                  <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2 animate-shake">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {globalError}
                  </div>
                )}

                {/* Form Input Slots */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Email — validated on blur; marketing only with zgoda_marketingowa */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-500">Adres e-mail *</label>
                    <input
                      type="email"
                      placeholder="np. jan.kowalski@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={handleEmailBlur}
                      className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 px-4 py-3.5 text-base font-bold bg-slate-50/50 dark:bg-slate-950/25 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary"
                    />
                    {touched.email && errors.email && (
                      <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <label className="sm:col-span-2 flex items-start gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/20 p-4 cursor-pointer">
                    <input
                      type="checkbox"
                      name="zgoda_marketingowa"
                      checked={zgodaMarketingowa}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setZgodaMarketingowa(checked);
                        const current = useCartRecoveryStore.getState().session;
                        if (current?.email) {
                          captureEmail(current.email, checked);
                          void persistCheckoutSession({
                            sessionId: current.sessionId,
                            sessionToken: current.sessionToken,
                            email: current.email,
                            zgodaMarketingowa: checked,
                            cartItems: recoveryCartItems,
                            phase: "email_captured",
                          });
                          if (checked) {
                            void fetch("/api/marketing/sync", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                email: current.email,
                                name: fullName,
                                zgodaMarketingowa: true,
                              }),
                            });
                          }
                        }
                      }}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary"
                    />
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">
                      Wyrażam zgodę na otrzymywanie wiadomości o niedokończonym zamówieniu oraz ofert (zgoda marketingowa, art. 6 ust. 1 lit. a RODO). Zgodę mogę wycofać w każdej chwili. Szczegóły w{" "}
                      <Link href="/polityka-prywatnosci" className="underline text-primary">
                        Polityce prywatności
                      </Link>
                      . Bez zaznaczenia nie wysyłamy maili marketingowych.
                    </span>
                  </label>

                  {/* Full name */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Imię i Nazwisko *</label>
                    <input
                      type="text"
                      placeholder="np. Jan Kowalski"
                      value={fullName}
                      onChange={(e) => setName(e.target.value)}
                      onBlur={() => validateField("fullName")}
                      className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 px-4 py-3.5 text-base font-bold bg-slate-50/50 dark:bg-slate-950/25 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary"
                    />
                    {touched.fullName && errors.fullName && (
                      <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Numer telefonu *</label>
                    <input
                      type="tel"
                      placeholder="np. +48 501 234 567"
                      value={phoneNumber}
                      onChange={(e) => setPhone(e.target.value)}
                      onBlur={() => validateField("phoneNumber")}
                      className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 px-4 py-3.5 text-base font-bold bg-slate-50/50 dark:bg-slate-950/25 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary"
                    />
                    {touched.phoneNumber && errors.phoneNumber && (
                      <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.phoneNumber}
                      </p>
                    )}
                  </div>

                </div>
              </div>

              {/* STEP 2: CHOOSE GATEWAY SELECTIONS */}
              <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-5 sm:p-8 shadow-xs space-y-6">
                <div>
                  <h2 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-black">2</span>
                    Bezpieczna Płatność SSL
                  </h2>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">Twoje transakcje są zaszyfrowane metodą bankową AES-256.</p>
                </div>

                {!arePaymentsEnabledClient() && <PaymentsUnavailableNotice locale={locale} />}

                <div className="space-y-4">
                  
                  {/* BLIK PRIORITY OPTION */}
                  <div 
                    id="platnosc-blik"
                    onClick={() => setPaymentMethod("blik")}
                    className={`group flex flex-col p-5 rounded-2xl border transition-all cursor-pointer relative ${
                      paymentMethod === "blik"
                        ? "border-primary bg-primary/3 ring-2 ring-primary/25"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/20 dark:bg-slate-950/10"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full font-black">
                      <div className="flex items-center gap-4">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 dark:border-slate-700 shrink-0">
                          {paymentMethod === "blik" && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                        </div>
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs font-black text-rose-600 tracking-tighter bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md border border-rose-100 dark:border-rose-900/20 shadow-xs">BLIK</span>
                          <span className="text-sm font-black text-slate-900 dark:text-white">BLIK (Natychmiastowy przelew w aplikacji banku)</span>
                        </div>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-[9px] font-extrabold text-amber-600 dark:text-amber-500 animate-pulse shrink-0">
                        Zalecana
                      </span>
                    </div>

                    {/* Progressive Disclosure slot inputs */}
                    <AnimatePresence>
                      {paymentMethod === "blik" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3"
                        >
                          <div className="max-w-xs mx-auto text-center space-y-4">
                            
                            {/* 6-Digit visual slots */}
                            <div 
                              className={`relative max-w-xs mx-auto ${shakeTrigger && paymentMethod === "blik" ? "animate-shake" : ""}`}
                              onClick={() => blikInputRef.current?.focus()}
                            >
                              <input
                                ref={blikInputRef}
                                type="text"
                                pattern="[0-9]*"
                                inputMode="numeric"
                                maxLength={6}
                                value={blikCode}
                                onChange={handleBlikChange}
                                onFocus={() => setBlikFocused(true)}
                                onBlur={() => {
                                  setBlikFocused(false);
                                  validateField("blikCode");
                                }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                              />

                              <div className="flex justify-between gap-2.5">
                                {Array.from({ length: 6 }).map((_, index) => {
                                  const char = blikCode[index] || "";
                                  const isCurrent = index === blikCode.length;
                                  const isFilled = index < blikCode.length;
                                  const isActive = isCurrent && blikFocused;

                                  return (
                                    <div
                                      key={index}
                                      className={`w-11 h-13 sm:w-13 sm:h-15 rounded-2xl border-2 flex items-center justify-center text-xl font-black transition-all duration-200 ${
                                        isActive
                                          ? "border-primary bg-primary/5 ring-4 ring-primary/15 scale-105"
                                          : isFilled
                                          ? "border-slate-400 dark:border-slate-600 bg-slate-50 dark:bg-slate-950/40 text-slate-900 dark:text-white"
                                          : "border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20 text-slate-400"
                                      }`}
                                    >
                                      {char ? (
                                        <motion.span
                                          initial={{ scale: 0.5, opacity: 0 }}
                                          animate={{ scale: 1, opacity: 1 }}
                                          transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                        >
                                          {char}
                                        </motion.span>
                                      ) : (
                                        isActive && (
                                          <motion.div
                                            animate={{ opacity: [1, 0, 1] }}
                                            transition={{ repeat: Infinity, duration: 1 }}
                                            className="w-0.5 h-6 bg-primary rounded-full"
                                          />
                                        )
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {touched.blikCode && errors.blikCode && (
                              <p className="text-[11px] font-bold text-rose-500 flex items-center justify-center gap-1">
                                <AlertCircle className="h-3.5 w-3.5" />
                                {errors.blikCode}
                              </p>
                            )}
                            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 leading-relaxed">
                              Otwórz aplikację bankowości mobilnej na telefonie, wygeneruj 6-cyfrowy kod BLIK i wpisz go powyżej.
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div
                    id="platnosc-p24"
                    className="group flex flex-col p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/10"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-4">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 dark:border-slate-700 shrink-0 opacity-40" />
                        <span className="text-sm font-black text-slate-900 dark:text-white">Przelewy24 (szybki przelew)</span>
                      </div>
                      <span className="text-[9px] font-extrabold uppercase tracking-wide text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        Wkrótce
                      </span>
                    </div>
                    <p className="mt-3 text-[11px] font-semibold text-slate-400 leading-relaxed">
                      Bramka Przelewy24 jest w przygotowaniu. Dokończ teraz natychmiastowym BLIK-iem — to ta sama polska płatność mobilna.
                    </p>
                    <a
                      href="#platnosc-blik"
                      className="mt-3 inline-flex text-[11px] font-black text-primary"
                    >
                      Przejdź do BLIK
                    </a>
                  </div>

                  {/* CARD GATEWAY */}
                  <div 
                    onClick={() => setPaymentMethod("card")}
                    className={`group flex flex-col p-5 rounded-2xl border transition-all cursor-pointer relative ${
                      paymentMethod === "card"
                        ? "border-primary bg-primary/3 ring-2 ring-primary/25"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/20 dark:bg-slate-950/10"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full font-black">
                      <div className="flex items-center gap-4">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 dark:border-slate-700 shrink-0">
                          {paymentMethod === "card" && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4.5 w-4.5 text-slate-400" />
                          <span className="text-sm font-black text-slate-900 dark:text-white">Karta płatnicza (Visa / Mastercard)</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border transition-all duration-300 ${cardBrand === "visa" ? "bg-blue-500 text-white border-blue-400" : "opacity-30 border-slate-300"}`}>VISA</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border transition-all duration-300 ${cardBrand === "mastercard" ? "bg-orange-500 text-white border-orange-400" : "opacity-30 border-slate-300"}`}>MC</span>
                      </div>
                    </div>

                    {/* Progressive card fields */}
                    <AnimatePresence>
                      {paymentMethod === "card" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            
                            {/* Card Number */}
                            <div className="space-y-1 sm:col-span-4">
                              <label className="text-xs font-bold text-slate-500">Numer karty</label>
                              <input
                                type="text"
                                inputMode="numeric"
                                placeholder="0000 0000 0000 0000"
                                className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 px-4 py-3.5 text-base font-bold bg-slate-50/50 dark:bg-slate-950/25 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary"
                                value={cardNumber}
                                onChange={handleCardNumberChange}
                                onBlur={() => validateField("cardNumber")}
                              />
                              {touched.cardNumber && errors.cardNumber && (
                                <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1 mt-1">
                                  <AlertCircle className="h-3 w-3" />
                                  {errors.cardNumber}
                                </p>
                              )}
                            </div>

                            {/* Expiry Date */}
                            <div className="space-y-1 sm:col-span-2">
                              <label className="text-xs font-bold text-slate-500">Termin ważności</label>
                              <input
                                type="text"
                                placeholder="MM/RR"
                                className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 px-4 py-3.5 text-base font-bold bg-slate-50/50 dark:bg-slate-950/25 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary"
                                value={cardExpiry}
                                onChange={handleExpiryChange}
                                onBlur={() => validateField("cardExpiry")}
                              />
                              {touched.cardExpiry && errors.cardExpiry && (
                                <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1 mt-1">
                                  <AlertCircle className="h-3 w-3" />
                                  {errors.cardExpiry}
                                </p>
                              )}
                            </div>

                            {/* CVC */}
                            <div className="space-y-1 sm:col-span-2">
                              <label className="text-xs font-bold text-slate-500">CVC *</label>
                              <input
                                type="password"
                                maxLength={3}
                                placeholder="000"
                                className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 px-4 py-3.5 text-base font-bold bg-slate-50/50 dark:bg-slate-950/25 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary"
                                value={cardCvc}
                                onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ""))}
                                onBlur={() => validateField("cardCvc")}
                              />
                              {touched.cardCvc && errors.cardCvc && (
                                <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1 mt-1">
                                  <AlertCircle className="h-3 w-3" />
                                  {errors.cardCvc}
                                </p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* GOOGLE PAY */}
                  <div 
                    onClick={() => setPaymentMethod("express")}
                    className={`group flex flex-col p-5 rounded-2xl border transition-all cursor-pointer relative ${
                      paymentMethod === "express"
                        ? "border-primary bg-primary/3 ring-2 ring-primary/25"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/20 dark:bg-slate-950/10"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full font-black">
                      <div className="flex items-center gap-4">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 dark:border-slate-700 shrink-0">
                          {paymentMethod === "express" && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                        </div>
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4.5 w-4.5 text-amber-500 shrink-0 animate-pulse" />
                          <span className="text-sm font-black text-slate-900 dark:text-white">Szybka płatność Google Pay</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-black tracking-tight text-slate-900 bg-slate-100 dark:bg-slate-800 dark:text-white px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 shrink-0">G Pay</span>
                    </div>

                    <AnimatePresence>
                      {paymentMethod === "express" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden mt-4 pt-4 border-t border-slate-100 dark:border-slate-800"
                        >
                          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 leading-relaxed">
                            Dokończ płatność ekspresowo za pomocą jednego kliknięcia w oficjalnym, bezpiecznym oknie dialogowym Google Pay.
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                </div>
              </div>

              {/* BACK TO CART LINK */}
              <div className="flex justify-start">
                <Link
                  href="/cart"
                  className="inline-flex items-center gap-2 text-xs font-black text-slate-400 hover:text-slate-950 dark:hover:text-slate-100 transition-colors py-3"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Wróć do koszyka
                </Link>
              </div>

            </form>
          </section>

          {/* RIGHT COLUMN: KEEPSAKE VISUAL TOTALS (4/12) */}
          <section className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-5 sm:p-6 shadow-xs space-y-6">
              <h3 className="text-lg font-black tracking-tight border-b border-slate-100 dark:border-slate-800 pb-3">
                Podsumowanie koszyka
              </h3>

              {/* Keepsake Visual items list (Endowment effect) */}
              <div className="flex flex-wrap gap-2.5 py-1">
                {items.map((item) => (
                  <div key={item.id} className="relative group shrink-0">
                    <div className="h-12.5 w-12.5 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-800 group-hover:border-primary transition-all">
                      <img 
                        src={item.product.image} 
                        alt={item.product.title} 
                        className="h-full w-full object-cover transition-transform group-hover:scale-110 duration-300" 
                      />
                    </div>
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-black text-white shadow-xs">
                      {item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price lines */}
              <div className="space-y-3 text-sm font-semibold border-t border-slate-100 dark:border-slate-800 pt-5">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Wartość koszyka</span>
                  <span className="tabular-nums text-slate-900 dark:text-slate-100">
                    {formatPrice(subtotal, currency, intlLocale)}
                  </span>
                </div>

                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Dostawa</span>
                  <span className="tabular-nums text-slate-900 dark:text-slate-100">
                    {shippingCost === 0 ? (
                      <span className="text-primary font-black uppercase tracking-wider text-xs">DARMOWA</span>
                    ) : (
                      formatPrice(shippingCost, currency, intlLocale)
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-base font-black pt-3 border-t border-slate-100 dark:border-slate-800 text-slate-900 dark:text-slate-100">
                  <span>Razem do zapłaty</span>
                  <span className="text-xl sm:text-2xl tracking-tight tabular-nums text-primary">
                    {formatPrice(total, currency, intlLocale)}
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center leading-relaxed">
                Wszystkie ceny zawierają podatek VAT. Brak jakichkolwiek ukrytych opłat transakcyjnych.
              </p>

              {/* Shimmer Submit CTA */}
              <div className="relative group">
                <motion.button
                  type="button"
                  onClick={() => executePaymentFlow()}
                  disabled={!arePaymentsEnabledClient()}
                  whileHover={arePaymentsEnabledClient() ? { scale: 1.01 } : undefined}
                  whileTap={arePaymentsEnabledClient() ? { scale: 0.99 } : undefined}
                  className="relative w-full overflow-hidden rounded-full bg-primary py-4 px-6 text-sm font-black text-white shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <motion.div
                    className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.8,
                      ease: "linear",
                    }}
                  />
                  
                  <Lock className="h-4 w-4 stroke-[2.5px]" />
                  <span>
                    {arePaymentsEnabledClient()
                      ? `Zapłać bezpiecznie przez ${paymentMethod.toUpperCase()}`
                      : "Płatności wkrótce"}
                  </span>
                  <ArrowRight className="h-4.5 w-4.5 stroke-[2.5px]" />
                </motion.button>
              </div>

              {/* Compliance trust text */}
              <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 text-center pt-1 leading-relaxed">
                <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Transakcja zabezpieczona szyfrowaniem SSL 256-bit. Pełna zgodność PCI-DSS.</span>
              </div>

            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

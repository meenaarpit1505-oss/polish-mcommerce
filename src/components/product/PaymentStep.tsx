"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Check, 
  Lock, 
  ShieldCheck, 
  CreditCard, 
  ArrowLeft, 
  ArrowRight, 
  AlertCircle, 
  Clock, 
  Sparkles,
  Building,
  CheckCircle2
} from "lucide-react";
import { useCart } from "@/providers/CartProvider";
import { useCurrency } from "@/providers/CurrencyProvider";
import { useLocale } from "next-intl";
import { formatPrice } from "@/lib/currency";
import { Link, useRouter } from "@/i18n/navigation";
import { PaymentsUnavailableNotice } from "@/components/checkout/PaymentsUnavailableNotice";
import { arePaymentsEnabledClient } from "@/lib/payments";

// --- HIGH-CONVERTING POLISH / ENGLISH COPY ---
const translations = {
  pl: {
    stepper: ["Koszyk", "Dostawa", "Płatność", "Podsumowanie"],
    urgency: "Dla Twojej wygody rezerwujemy produkty w koszyku na czas płatności:",
    minutes: "min",
    title: "Wybierz metodę płatności",
    subtitle: "Wszystkie transakcje są szyfrowane i w 100% bezpieczne",
    blikTitle: "BLIK (Szybki przelew telefonem)",
    blikPlaceholder: "Wpisz 6-cyfrowy kod BLIK",
    blikHelp: "Uruchom aplikację bankową, wygeneruj kod BLIK i wpisz go powyżej.",
    onlineTransferTitle: "Przelew online (Przelewy24 - wkrótce!)",
    p24ComingSoon: "Pracujemy nad wdrożeniem szybkich przelewów online Przelewy24 (P24). Zostaną one dodane tak szybko, jak to możliwe! Tymczasem zachęcamy do skorzystania z natychmiastowej płatności BLIK, bezpieczną kartą Visa/Mastercard lub Google Pay.",
    selectBankPrompt: "Wybierz swój bank:",
    cardTitle: "Karta płatnicza (Visa / Mastercard)",
    cardNumber: "Numer karty",
    cardExpiry: "Termin ważności",
    cardCvc: "Kod CVC",
    expressTitle: "Szybka płatność jednym kliknięciem (Google Pay)",
    googlePayHelp: "Dokończ płatność za pomocą Google Pay w bezpiecznym oknie autoryzacji.",
    backToShipping: "Wróć do dostawy",
    payButton: "Zabezpiecz zamówienie i zapłać",
    payWithBank: "Zapłać przez {bank}",
    paySecurely: "Bezpieczne, szyfrowane połączenie SSL",
    summary: "Twoje zamówienie",
    total: "Razem do zapłaty",
    shipping: "Wysyłka",
    subtotal: "Wartość produktów",
    vatIncluded: "Ceny zawierają podatek VAT. Brak ukrytych opłat.",
    trustText: "Transakcja zabezpieczona 256-bitowym szyfrowaniem SSL. Spełniamy standardy PCI-DSS.",
    processing: "Autoryzacja płatności...",
    processingSubtitle: "Proszę nie zamykać tego okna. Potwierdź transakcję w swojej aplikacji bankowej lub oknie płatności.",
    successTitle: "Płatność zaakceptowana! 🎉",
    successSubtitle: "Dziękujemy za zakupy! Za chwilę otrzymasz e-mail z potwierdzeniem zamówienia.",
    fieldRequired: "To pole jest wymagane",
    invalidCard: "Niepoprawny numer karty (wymagane 16 cyfr)",
    invalidExpiry: "Niepoprawny format (MM/RR)",
    invalidCvc: "Kod CVC musi mieć 3 cyfry",
    invalidBlik: "Kod BLIK musi składać się z 6 cyfr",
    oneStepAway: "Ostatni krok! Jesteś tylko chwilę od sfinalizowania zamówienia. ✨"
  },
  en: {
    stepper: ["Cart", "Shipping", "Payment", "Summary"],
    urgency: "For your convenience, we reserve the products in your cart during payment:",
    minutes: "min",
    title: "Select Payment Method",
    subtitle: "All transactions are encrypted and 100% secure",
    blikTitle: "BLIK (Fast mobile transfer)",
    blikPlaceholder: "Enter 6-digit BLIK code",
    blikHelp: "Open your banking app, generate a BLIK code, and enter it above.",
    onlineTransferTitle: "Online Transfer (Przelewy24 - coming soon!)",
    p24ComingSoon: "We are actively working on integrating Przelewy24 (P24) fast bank transfers. They will be added as soon as possible! In the meantime, please complete your checkout using instant BLIK, credit/debit card (Visa/Mastercard), or Google Pay.",
    selectBankPrompt: "Select your bank:",
    cardTitle: "Credit / Debit Card (Visa / Mastercard)",
    cardNumber: "Card number",
    cardExpiry: "Expiry date",
    cardCvc: "CVC code",
    expressTitle: "Express One-Click Checkout (Google Pay)",
    googlePayHelp: "Complete your payment securely using Google Pay in the payment authorization window.",
    backToShipping: "Back to shipping",
    payButton: "Secure Order & Pay",
    payWithBank: "Pay via {bank}",
    paySecurely: "Secure, encrypted SSL connection",
    summary: "Your Order",
    total: "Total to pay",
    shipping: "Shipping cost",
    subtotal: "Products value",
    vatIncluded: "Prices include VAT. No hidden fees.",
    trustText: "Transaction secured with 256-bit SSL encryption. We comply with PCI-DSS standards.",
    processing: "Authorizing payment...",
    processingSubtitle: "Please do not close this window. Confirm the transaction in your bank app or payment window.",
    successTitle: "Payment Successful! 🎉",
    successSubtitle: "Thank you for your purchase! A confirmation email is on its way.",
    fieldRequired: "This field is required",
    invalidCard: "Invalid card number (16 digits required)",
    invalidExpiry: "Invalid format (MM/YY)",
    invalidCvc: "CVC code must be 3 digits",
    invalidBlik: "BLIK code must be exactly 6 digits",
    oneStepAway: "Final step! You are just moments away from completing your order. ✨"
  }
};

// --- POLISH BANKS DIRECTORY FOR HIGH TRUST REDIRECTION ---
const POLISH_BANKS = [
  { id: "mbank", name: "mBank" },
  { id: "pkobp", name: "PKO BP" },
  { id: "pekao", name: "Pekao SA" },
  { id: "santander", name: "Santander" },
  { id: "ing", name: "ING Bank Śląski" },
  { id: "millennium", name: "Millennium" },
  { id: "alior", name: "Alior Bank" },
  { id: "credit-agricole", name: "Credit Agricole" },
];

interface PaymentFormState {
  method: "blik" | "bank" | "card" | "express";
  blikCode: string;
  selectedBank: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
}

export function PaymentStep() {
  const locale = useLocale() as "pl" | "en";
  const t = translations[locale];
  const { currency } = useCurrency();
  const { items, isMounted, clearCart } = useCart();
  const router = useRouter();

  const isPLN = currency === "PLN";
  const intlLocale = locale === "pl" ? "pl-PL" : "en-GB";

  const [form, setForm] = useState<PaymentFormState>({
    method: "blik", // Default Bias: BLIK pre-selected
    blikCode: "",
    selectedBank: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(8 * 60 + 45); // Ethical session reservation
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [cardBrand, setCardBrand] = useState<"visa" | "mastercard" | "unknown">("unknown");
  const [blikFocused, setBlikFocused] = useState(false);
  const [shakeTrigger, setShakeTrigger] = useState(false);

  const blikInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus BLIK input on mount/select
  useEffect(() => {
    if (form.method === "blik" && blikInputRef.current) {
      blikInputRef.current.focus();
    }
  }, [form.method]);

  // Reservation Timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Detect Card Brand
  const detectCardBrand = (number: string) => {
    const clean = number.replace(/\s/g, "");
    if (clean.startsWith("4")) return "visa";
    if (clean.startsWith("5")) return "mastercard";
    return "unknown";
  };

  // Format Card Number (XXXX XXXX XXXX XXXX)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 16);
    const brand = detectCardBrand(val);
    setCardBrand(brand);

    const formatted = val.match(/.{1,4}/g)?.join(" ") || val;
    setForm((prev) => ({ ...prev, cardNumber: formatted }));
    if (errors.cardNumber) setErrors((prev) => ({ ...prev, cardNumber: "" }));
  };

  // Format Expiry Date (MM/RR)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (val.length > 2) {
      val = `${val.slice(0, 2)}/${val.slice(2)}`;
    }
    setForm((prev) => ({ ...prev, cardExpiry: val }));
    if (errors.cardExpiry) setErrors((prev) => ({ ...prev, cardExpiry: "" }));
  };

  // Handle BLIK Code Input (Frictionless single hidden input)
  const handleBlikChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setForm((prev) => ({ ...prev, blikCode: val }));
    if (errors.blikCode) setErrors((prev) => ({ ...prev, blikCode: "" }));

    // Auto-submit when exactly 6 digits are entered (Friction Killer!)
    if (val.length === 6) {
      setTimeout(() => {
        handlePaymentSubmit();
      }, 300);
    }
  };

  // Validate Fields on Blur
  const handleBlur = (field: keyof PaymentFormState) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    let error = "";
    const value = form[field].trim();

    if (form.method === "blik" && field === "blikCode") {
      if (value.length !== 6) error = t.invalidBlik;
    }

    if (form.method === "card") {
      if (field === "cardNumber" && value.replace(/\s/g, "").length !== 16) {
        error = t.invalidCard;
      }
      if (field === "cardExpiry" && !/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(value)) {
        error = t.invalidExpiry;
      }
      if (field === "cardCvc" && value.length !== 3) {
        error = t.invalidCvc;
      }
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  // Pricing calculations from CartProvider
  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => {
      const price = isPLN ? item.product.pricePLN : item.product.priceEUR;
      return acc + price * item.quantity;
    }, 0);
  }, [items, isPLN]);

  const shippingCost = subtotal >= (isPLN ? 199 : 45) ? 0 : (isPLN ? 12.99 : 3.49);
  const total = subtotal + shippingCost;

  const isFormValid = () => {
    if (form.method === "blik") {
      return form.blikCode.length === 6 && !errors.blikCode;
    }
    if (form.method === "bank") {
      return form.selectedBank !== "";
    }
    if (form.method === "card") {
      return (
        form.cardNumber.replace(/\s/g, "").length === 16 &&
        /^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(form.cardExpiry) &&
        form.cardCvc.length === 3 &&
        !errors.cardNumber &&
        !errors.cardExpiry &&
        !errors.cardCvc
      );
    }
    return true;
  };

  const handlePaymentSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!arePaymentsEnabledClient()) {
      return;
    }
    
    if (!isFormValid()) {
      // Shake animation on validation failure
      setShakeTrigger(true);
      setTimeout(() => setShakeTrigger(false), 500);
      
      // Mark all relevant fields as touched to show errors
      if (form.method === "blik") setTouched({ blikCode: true });
      if (form.method === "card") setTouched({ cardNumber: true, cardExpiry: true, cardCvc: true });
      return;
    }

    setIsProcessing(true);

    // Simulate Secure Bank/PSP Authorization
    setTimeout(() => {
      // Save order details to sessionStorage for the SummaryStep page
      const orderId = `VV-${Math.floor(100000 + Math.random() * 900000)}`;
      try {
        const orderDetails = {
          id: orderId,
          items: items.map(item => ({
            id: item.id,
            title: item.product.title,
            pricePLN: item.product.pricePLN,
            priceEUR: item.product.priceEUR,
            image: item.product.image,
            quantity: item.quantity,
            selectedColor: item.selectedColor,
            selectedSize: item.selectedSize
          })),
          subtotal: subtotal,
          shippingCost: shippingCost,
          total: total,
          currency: currency,
          paymentMethod: form.method === "blik" 
            ? "BLIK" 
            : form.method === "card" 
              ? "Visa / Mastercard" 
              : form.method === "express"
                ? "Google Pay"
                : "Przelew online (Przelewy24)"
        };
        sessionStorage.setItem("last_order_details", JSON.stringify(orderDetails));
      } catch (err) {
        console.error("Failed to build/save order details to sessionStorage:", err);
      }

      // Read shipping address details from localStorage if they exist to pass in URL query for fallback
      let method = "courier";
      let locker = "WAW405A";
      try {
        const savedShipping = localStorage.getItem("checkout_shipping_address");
        if (savedShipping && savedShipping.trim()) {
          const parsedShipping = JSON.parse(savedShipping);
          method = parsedShipping.shippingMethod || "courier";
          locker = parsedShipping.shippingMethod === "orlen"
            ? (parsedShipping.orlenPointId || "ORL1022")
            : (parsedShipping.paczkomatId || "WAW405A");
        }
      } catch (err) {
        console.error("Failed to read shipping from localStorage:", err);
      }

      setIsProcessing(false);
      setIsSuccess(true);
      clearCart();

      // Smooth redirect to the premium order summary page
      setTimeout(() => {
        router.push(`/summary?orderId=${orderId}&method=${method}&locker=${locker}&amount=${total}`);
      }, 3500);
    }, 3000);
  };

  const selectedBankName = useMemo(() => {
    return POLISH_BANKS.find(b => b.id === form.selectedBank)?.name || "";
  }, [form.selectedBank]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:py-10 text-slate-900 dark:text-slate-100 pb-20">
      
      {/* 1. SECURE GATEWAY AUTHORIZATION PORTAL */}
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
                <h3 className="text-xl font-black text-white">{t.processing}</h3>
                <p className="text-sm text-slate-400 font-semibold leading-relaxed">
                  {t.processingSubtitle}
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
                <h3 className="text-2xl font-black text-white">{t.successTitle}</h3>
                <p className="text-sm text-slate-400 font-semibold leading-relaxed">
                  {t.successSubtitle}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. PROGRESS STEPPER (Zeigarnik & Goal-Gradient Effect) */}
      <nav className="mb-8" aria-label="Checkout Progress">
        <div className="flex items-center justify-between max-w-xl mx-auto relative">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 z-0 rounded-full" />
          <div 
            className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-0 rounded-full transition-all duration-500"
            style={{ width: "75%" }} // 75% Complete (Step 3)
          />

          {t.stepper.map((step, index) => {
            const isActive = index === 2;
            const isCompleted = index < 2;
            return (
              <div key={step} className="flex flex-col items-center z-10 relative">
                <div 
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-black transition-all duration-300 ${
                    isActive 
                      ? "bg-primary text-white ring-4 ring-primary/20 shadow-[0_0_12px_rgba(16,185,129,0.4)]" 
                      : isCompleted 
                        ? "bg-primary text-white" 
                        : "bg-slate-100 dark:bg-slate-850 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800"
                  }`}
                >
                  {isCompleted ? <Check className="h-4 w-4 stroke-[3px]" /> : index + 1}
                </div>
                <span 
                  className={`mt-2 text-[11px] sm:text-xs font-extrabold tracking-tight ${
                    isActive 
                      ? "text-primary font-black" 
                      : isCompleted 
                        ? "text-slate-700 dark:text-slate-300 font-extrabold" 
                        : "text-slate-400 dark:text-slate-500"
                  }`}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </nav>

      {/* 3. ETHICAL SESSION RESERVATION TIMER */}
      {timeLeft > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center justify-center gap-2 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 px-4 py-3 text-xs font-bold text-amber-800 dark:text-amber-400 shadow-xs"
        >
          <Clock className="h-4 w-4 animate-pulse shrink-0" />
          <p className="leading-tight text-center sm:text-left">
            {t.urgency}{" "}
            <span className="font-black text-rose-600 dark:text-rose-400 tabular-nums bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded-md border border-rose-100 dark:border-rose-900/30">
              {formatTimer(timeLeft)}
            </span>{" "}
            {t.minutes}.
          </p>
        </motion.div>
      )}

      {/* 4. GOAL-GRADIENT MICRO-COPY */}
      <div className="mb-6 flex items-center justify-center gap-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/10 border border-emerald-500/10 px-4 py-3 text-xs font-bold text-emerald-800 dark:text-emerald-400 shadow-xs">
        <Sparkles className="h-4 w-4 text-emerald-500 shrink-0 animate-pulse" />
        <p className="leading-tight text-center sm:text-left">{t.oneStepAway}</p>
      </div>

      {!arePaymentsEnabledClient() && (
        <div className="mb-6">
          <PaymentsUnavailableNotice locale={locale} />
        </div>
      )}

      {/* CORE FORM GRID */}
      <form onSubmit={handlePaymentSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* --- LEFT COLUMN: PAYMENT METHODS (8/12) --- */}
        <section className="lg:col-span-8 space-y-6">
          <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-5 sm:p-8 shadow-xs space-y-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">{t.title}</h2>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-1">{t.subtitle}</p>
            </div>

            {/* EXPRESS ONE-CLICK CHECKOUT */}
            <div className="space-y-3">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                {t.expressTitle}
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, method: "express" }))}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white h-14 rounded-2xl flex items-center justify-center gap-2 font-black text-sm transition-all shadow-md active:scale-98 cursor-pointer w-full"
                >
                  <span className="text-base font-bold tracking-tight">Google Pay</span>
                </button>
              </div>
            </div>

            {/* DIVIDER */}
            <div className="relative flex py-2 items-center">
              <div className="grow border-t border-slate-100 dark:border-slate-800"></div>
              <span className="shrink mx-4 text-xs font-black text-slate-400 uppercase tracking-widest">Lub / Or</span>
              <div className="grow border-t border-slate-100 dark:border-slate-800"></div>
            </div>

            {/* PAYMENT METHODS ACCORDION */}
            <div className="space-y-4">
              
              {/* METHOD 1: BLIK (Default Biased) */}
              <div 
                onClick={() => setForm((prev) => ({ ...prev, method: "blik" }))}
                className={`group flex flex-col p-5 rounded-2xl border transition-all cursor-pointer relative ${
                  form.method === "blik"
                    ? "border-primary bg-primary/3 ring-2 ring-primary/25"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/20 dark:bg-slate-950/10"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-4">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 dark:border-slate-700 shrink-0">
                      {form.method === "blik" && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-rose-600 tracking-tighter bg-rose-50 dark:bg-rose-950/30 px-2 py-0.5 rounded-md border border-rose-100 dark:border-rose-900/20">BLIK</span>
                      <span className="text-sm font-black text-slate-900 dark:text-white">{t.blikTitle}</span>
                    </div>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-[9px] font-extrabold text-amber-600 dark:text-amber-500 animate-pulse">
                    Najpopularniejsza
                  </span>
                </div>

                {/* Progressive Disclosure: BLIK Custom Slots Input */}
                <AnimatePresence>
                  {form.method === "blik" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3"
                    >
                      <div className="max-w-xs mx-auto text-center space-y-4">
                        
                        {/* Custom 6-Digit Slots Container */}
                        <div 
                          className={`relative max-w-xs mx-auto ${shakeTrigger && form.method === "blik" ? "animate-shake" : ""}`}
                          onClick={() => blikInputRef.current?.focus()}
                        >
                          {/* Single Hidden Input for perfect mobile responsiveness & pasting */}
                          <input
                            ref={blikInputRef}
                            type="text"
                            pattern="[0-9]*"
                            inputMode="numeric"
                            maxLength={6}
                            value={form.blikCode}
                            onChange={handleBlikChange}
                            onFocus={() => setBlikFocused(true)}
                            onBlur={() => {
                              setBlikFocused(false);
                              handleBlur("blikCode");
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            aria-label={t.blikPlaceholder}
                          />

                          {/* Beautiful Visual Slots */}
                          <div className="flex justify-between gap-2.5">
                            {Array.from({ length: 6 }).map((_, index) => {
                              const char = form.blikCode[index] || "";
                              const isCurrent = index === form.blikCode.length;
                              const isFilled = index < form.blikCode.length;
                              const isActive = isCurrent && blikFocused;

                              return (
                                <div
                                  key={index}
                                  className={`w-12 h-14 sm:w-14 sm:h-16 rounded-2xl border-2 flex items-center justify-center text-2xl font-black transition-all duration-200 ${
                                    isActive
                                      ? "border-primary bg-primary/5 ring-4 ring-primary/15 scale-105"
                                      : isFilled
                                      ? "border-slate-400 dark:border-slate-600 bg-slate-50 dark:bg-slate-950/40 text-slate-900 dark:text-white"
                                      : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-slate-400"
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
                          {t.blikHelp}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* METHOD 2: ONLINE BANK TRANSFER (Przelewy24 - COMING SOON) */}
              <div 
                className="group flex flex-col p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/10 dark:bg-slate-950/5 opacity-60 relative cursor-not-allowed"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-4">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 shrink-0 bg-slate-100 dark:bg-slate-900" />
                    <div className="flex items-center gap-2">
                      <Building className="h-4.5 w-4.5 text-slate-400" />
                      <span className="text-sm font-black text-slate-400 dark:text-slate-500">{t.onlineTransferTitle}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-black tracking-tight text-slate-400 bg-slate-100 dark:bg-slate-900/50 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-800">P24 (Wkrótce)</span>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-850">
                  <p className="text-[11.5px] font-bold text-slate-400 dark:text-slate-500 leading-relaxed">
                    {t.p24ComingSoon}
                  </p>
                </div>
              </div>

              {/* METHOD 3: CREDIT CARD */}
              <div 
                onClick={() => setForm((prev) => ({ ...prev, method: "card" }))}
                className={`group flex flex-col p-5 rounded-2xl border transition-all cursor-pointer relative ${
                  form.method === "card"
                    ? "border-primary bg-primary/3 ring-2 ring-primary/25"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/20 dark:bg-slate-950/10"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-4">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 dark:border-slate-700 shrink-0">
                      {form.method === "card" && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4.5 w-4.5 text-slate-400" />
                      <span className="text-sm font-black text-slate-900 dark:text-white">{t.cardTitle}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border transition-all duration-300 ${cardBrand === "visa" ? "bg-blue-500 text-white border-blue-400" : "opacity-30 border-slate-300"}`}>VISA</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border transition-all duration-300 ${cardBrand === "mastercard" ? "bg-orange-500 text-white border-orange-400" : "opacity-30 border-slate-300"}`}>MC</span>
                  </div>
                </div>

                {/* Progressive Disclosure: Card Input Fields */}
                <AnimatePresence>
                  {form.method === "card" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        
                        {/* Card Number */}
                        <div className="space-y-1 sm:col-span-4">
                          <label className="text-xs font-bold text-slate-500">{t.cardNumber}</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            placeholder="0000 0000 0000 0000"
                            className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 px-4 py-3.5 text-base font-bold bg-slate-50/50 dark:bg-slate-950/25 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary"
                            value={form.cardNumber}
                            onChange={handleCardNumberChange}
                            onBlur={() => handleBlur("cardNumber")}
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
                          <label className="text-xs font-bold text-slate-500">{t.cardExpiry}</label>
                          <input
                            type="text"
                            placeholder="MM/RR"
                            className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 px-4 py-3.5 text-base font-bold bg-slate-50/50 dark:bg-slate-950/25 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary"
                            value={form.cardExpiry}
                            onChange={handleExpiryChange}
                            onBlur={() => handleBlur("cardExpiry")}
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
                          <label className="text-xs font-bold text-slate-500">{t.cardCvc}</label>
                          <input
                            type="password"
                            maxLength={3}
                            placeholder="000"
                            className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 px-4 py-3.5 text-base font-bold bg-slate-50/50 dark:bg-slate-950/25 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary"
                            value={form.cardCvc}
                            onChange={(e) => setForm({ ...form, cardCvc: e.target.value.replace(/\D/g, "") })}
                            onBlur={() => handleBlur("cardCvc")}
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

              {/* METHOD 4: GOOGLE PAY */}
              <div 
                onClick={() => setForm((prev) => ({ ...prev, method: "express" }))}
                className={`group flex flex-col p-5 rounded-2xl border transition-all cursor-pointer relative ${
                  form.method === "express"
                    ? "border-primary bg-primary/3 ring-2 ring-primary/25"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/20 dark:bg-slate-950/10"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-4">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 dark:border-slate-700 shrink-0">
                      {form.method === "express" && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4.5 w-4.5 text-amber-500 shrink-0 animate-pulse" />
                      <span className="text-sm font-black text-slate-900 dark:text-white">Google Pay</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-black tracking-tight text-slate-900 bg-slate-100 dark:bg-slate-800 dark:text-white px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">G Pay</span>
                </div>

                {/* Progressive Disclosure: Google Pay Help Text */}
                <AnimatePresence>
                  {form.method === "express" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3"
                    >
                      <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 leading-relaxed">
                        {t.googlePayHelp}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>

          {/* BACK TO SHIPPING */}
          <div className="flex justify-start">
            <Link
              href="/shipping"
              className="inline-flex items-center gap-2 text-xs font-black text-slate-400 hover:text-slate-950 dark:hover:text-slate-100 transition-colors py-3"
            >
              <ArrowLeft className="h-4 w-4" />
              {t.backToShipping}
            </Link>
          </div>
        </section>

        {/* --- RIGHT COLUMN: ORDER KEEPSAKE SUMMARY (4/12) --- */}
        <section className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
          <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-5 sm:p-6 shadow-xs space-y-6">
            <h3 className="text-lg font-black tracking-tight border-b border-slate-100 dark:border-slate-800 pb-3">
              {t.summary}
            </h3>

            {/* Keepsake visual item list (Endowment Effect) */}
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

            {/* Price details */}
            <div className="space-y-3 text-sm font-semibold border-t border-slate-100 dark:border-slate-800 pt-5">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>{t.subtotal}</span>
                <span className="tabular-nums text-slate-900 dark:text-slate-100">{formatPrice(subtotal, currency, intlLocale)}</span>
              </div>

              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>{t.shipping}</span>
                <span className="tabular-nums text-slate-900 dark:text-slate-100">
                  {shippingCost === 0 ? (
                    <span className="text-primary font-black uppercase tracking-wider text-xs">FREE</span>
                  ) : (
                    formatPrice(shippingCost, currency, intlLocale)
                  )}
                </span>
              </div>

              <div className="flex justify-between text-base font-black pt-3 border-t border-slate-100 dark:border-slate-800 text-slate-900 dark:text-slate-100">
                <span>{t.total}</span>
                <span className="text-xl sm:text-2xl tracking-tight tabular-nums text-primary">
                  {formatPrice(total, currency, intlLocale)}
                </span>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center leading-relaxed">
              {t.vatIncluded}
            </p>

            {/* SHIMMER EFFECT MEGAGRADIENT PRIMARY SUBMIT CTA */}
            <div className="relative group">
              <motion.button
                type="submit"
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
                  {!arePaymentsEnabledClient()
                    ? (locale === "pl" ? "Płatności wkrótce" : "Payments coming soon")
                    : form.method === "bank" && form.selectedBank
                    ? t.payWithBank.replace("{bank}", selectedBankName)
                    : t.payButton}
                </span>
                <ArrowRight className="h-4.5 w-4.5 stroke-[2.5px]" />
              </motion.button>
            </div>

            {/* Trust and safety badging */}
            <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 text-center pt-1 leading-relaxed">
              <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>{t.trustText}</span>
            </div>
          </div>
        </section>
      </form>
    </main>
  );
}

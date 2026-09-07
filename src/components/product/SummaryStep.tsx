"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Check, 
  Truck, 
  MapPin, 
  Lock, 
  Sparkles,
  ArrowRight,
  Gift,
  CreditCard,
  ShieldCheck,
  ShoppingBag,
  ExternalLink,
  QrCode,
  Calendar,
  Box,
  Copy
} from "lucide-react";
import { useLocale } from "next-intl";
import { useCurrency } from "@/providers/CurrencyProvider";
import { formatPrice } from "@/lib/currency";
import { Link } from "@/i18n/navigation";

// --- TRANSLATION OBJECT ---
const translations = {
  pl: {
    stepper: ["Koszyk", "Dostawa", "Płatność", "Podsumowanie"],
    heroTag: "Zamówienie pomyślnie złożone! 🎉",
    title: "Dziękujemy za zamówienie!",
    subtitle: "Dziękujemy za zakupy w naszym sklepie. Potwierdzenie zamówienia oraz faktura proforma zostały przesłane na podany adres e-mail.",
    orderNumber: "Numer zamówienia",
    date: "Data zamówienia",
    deliveryStatusTitle: "Śledzenie przesyłki na żywo",
    deliveryTomorrow: "Dostawa jutro rano!",
    stepPaid: "Zamówienie opłacone",
    stepPaidDesc: "Transakcja została pomyślnie autoryzowana",
    stepPacking: "Kompletowanie przesyłki",
    stepPackingDesc: "Zabezpieczamy produkty w dedykowanym kartonie",
    stepCourier: "Przekazano kurierowi",
    stepCourierDesc: "Kurier odbiera paczkę z naszego magazynu",
    inpostTitle: "Odbiór w Paczkomacie InPost",
    inpostDesc: "Przesyłka zostanie dostarczona do Twojego wybranego automatu Paczkowego 24/7.",
    inpostCta: "Śledź w aplikacji InPost Mobile",
    lockerCode: "Kod Paczkomatu",
    orlenTitle: "Odbiór w punkcie ORLEN Paczka",
    orlenDesc: "Przesyłka zostanie dostarczona do wybranego punktu lub automatu ORLEN Paczka.",
    orlenCta: "Śledź przesyłkę ORLEN Paczka",
    pointCode: "Kod punktu",
    accountTitle: "Zarejestruj się jednym kliknięciem 🔒",
    accountDesc: "Podaj hasło, aby utworzyć konto z zapisanymi danymi dostawy i śledzić wszystkie przesyłki na żywo.",
    passwordPlaceholder: "Hasło (min. 6 znaków)...",
    accountCta: "Zarejestruj konto",
    accountSuccess: "Konto utworzone pomyślnie! Witamy w VistulaVogue Club! 🚀",
    referralTitle: "Zyskaj 30 PLN na kolejne zakupy 🎁",
    referralDesc: "Poleć nas znajomemu! Twój znajomy otrzyma darmową dostawę, a Ty dostaniesz 30 PLN po jego pierwszym zakupie.",
    referralCta: "Skopiuj link polecający",
    referralCopied: "Skopiowano link!",
    detailsTitle: "Podsumowanie kosztów (Faktura proforma)",
    summaryItems: "Zamówione produkty",
    summarySubtotal: "Wartość koszyka (netto)",
    summaryVat: "Podatek VAT (23%)",
    summaryShipping: "Koszt dostawy",
    summaryTotal: "Suma brutto (opłacona)",
    detailsRecipient: "Adres doręczenia",
    detailsPayment: "Metoda płatności",
    free: "DARMOWA",
    backToHome: "Kontynuuj zakupy"
  },
  en: {
    stepper: ["Cart", "Shipping", "Payment", "Summary"],
    heroTag: "Order successfully secured! 🎉",
    title: "Thank you for your order!",
    subtitle: "Thank you for shopping with us. A confirmation email and proforma invoice have been sent to your email address.",
    orderNumber: "Order ID",
    date: "Order date",
    deliveryStatusTitle: "Live order tracking",
    deliveryTomorrow: "Delivery tomorrow morning!",
    stepPaid: "Order Paid",
    stepPaidDesc: "Your transaction has been authorized successfully",
    stepPacking: "Packaging parcel",
    stepPackingDesc: "Securing your items in custom box packaging",
    stepCourier: "Handed over to courier",
    stepCourierDesc: "The courier is picking up the parcel from our warehouse",
    inpostTitle: "InPost Paczkomat Pickup",
    inpostDesc: "Your parcel will be delivered to your chosen automated locker 24/7.",
    inpostCta: "Track in InPost Mobile app",
    lockerCode: "Locker ID",
    orlenTitle: "ORLEN Paczka Point Pickup",
    orlenDesc: "Your parcel will be delivered to your chosen ORLEN Paczka pickup point or locker.",
    orlenCta: "Track ORLEN Paczka shipment",
    pointCode: "Point ID",
    accountTitle: "Register account with 1-click 🔒",
    accountDesc: "Enter a password to save your details for future checkouts and track this parcel live.",
    passwordPlaceholder: "Password (min. 6 characters)...",
    accountCta: "Create My Account",
    accountSuccess: "Account successfully secured! Welcome to VistulaVogue Club! 🚀",
    referralTitle: "Get 10 EUR off your next order 🎁",
    referralDesc: "Share the style! Your friend gets free shipping, and you earn 10 EUR after their first purchase.",
    referralCta: "Copy referral link",
    referralCopied: "Link copied!",
    detailsTitle: "Billing breakdown (Proforma Invoice)",
    summaryItems: "Purchased products",
    summarySubtotal: "Net value",
    summaryVat: "VAT tax (23%)",
    summaryShipping: "Shipping cost",
    summaryTotal: "Gross total (paid)",
    detailsRecipient: "Shipping Address",
    detailsPayment: "Payment method",
    free: "FREE",
    backToHome: "Continue shopping"
  }
};

// --- ANIMATION SCHEMAS FOR DELIGHTFUL EXPERIENCE ---
const circleVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.8, ease: "easeInOut" as const }
  }
};

const checkmarkVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { delay: 0.6, duration: 0.4, ease: "easeOut" as const }
  }
};

interface OrderDetailItem {
  id: string;
  title: string;
  pricePLN: number;
  priceEUR: number;
  image: string;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

interface OrderDetails {
  id: string;
  items: OrderDetailItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  currency: string;
  paymentMethod: string;
}

function SummaryContent() {
  const locale = useLocale() as "pl" | "en";
  const t = translations[locale];
  const { currency } = useCurrency();
  const searchParams = useSearchParams();

  // Local component states
  const [copied, setCopied] = useState(false);
  const [password, setPassword] = useState("");
  const [accountCreated, setAccountCreated] = useState(false);
  const [order, setOrder] = useState<OrderDetails | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [shippingAddress, setShippingAddress] = useState<any | null>(null);

  useEffect(() => {
    // 1. Attempt to load real order details from sessionStorage
    try {
      const stored = sessionStorage.getItem("last_order_details");
      if (stored && stored.trim()) {
        const parsed = JSON.parse(stored);
        setTimeout(() => setOrder(parsed), 0);
      }
    } catch (e) {
      console.error("Failed to load last_order_details from sessionStorage:", e);
    }

    // 2. Attempt to load real shipping address from localStorage
    try {
      const savedAddress = localStorage.getItem("checkout_shipping_address");
      if (savedAddress && savedAddress.trim()) {
        const parsedAddress = JSON.parse(savedAddress);
        setTimeout(() => setShippingAddress(parsedAddress), 0);
      }
    } catch (e) {
      console.error("Failed to load checkout_shipping_address from localStorage:", e);
    }
  }, []);

  // 3. Fallback dynamics for robust rendering if storage is not set
  const fallbackOrderId = searchParams.get("orderId") || order?.id || "VV-2026-98104";
  const fallbackTotal = parseFloat(searchParams.get("amount") || order?.total?.toString() || "311.99");
  const fallbackMethod = searchParams.get("method") || shippingAddress?.shippingMethod || "paczkomat";
  const fallbackLocker = searchParams.get("locker") || 
    (fallbackMethod === "orlen" ? shippingAddress?.orlenPointId : shippingAddress?.paczkomatId) || 
    (fallbackMethod === "orlen" ? "ORL1022" : "WAW405A");

  const isPLN = currency === "PLN";
  const intlLocale = locale === "pl" ? "pl-PL" : "en-GB";

  // Re-calculate tax details dynamically based on Polish standard accounting (VAT 23%)
  const finalShipping = order ? order.shippingCost : (fallbackTotal >= (isPLN ? 199 : 45) ? 0 : (isPLN ? 12.99 : 3.49));
  const finalTotal = order ? order.total : fallbackTotal;
  const finalProductsGross = finalTotal - finalShipping;
  const finalProductsNet = finalProductsGross / 1.23;
  const finalVatAmount = finalProductsGross - finalProductsNet;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://vistulavogue.pl/ref?code=${fallbackOrderId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length >= 6) {
      setAccountCreated(true);
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:py-16 text-slate-900 dark:text-slate-100 pb-28">
      
      {/* STEPER (100% Completed status) */}
      <nav className="mb-10 sm:mb-16" aria-label="Checkout Progress">
        <div className="flex items-center justify-between max-w-xl mx-auto relative">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-primary -translate-y-1/2 z-0 rounded-full" />
          {t.stepper.map((step) => (
            <div key={step} className="flex flex-col items-center z-10 relative">
              <div className="flex h-8.5 w-8.5 items-center justify-center rounded-full text-xs font-black bg-primary text-white ring-4 ring-primary/10 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                <Check className="h-4.5 w-4.5 stroke-[3px]" />
              </div>
              <span className="mt-2 text-[10px] sm:text-xs font-black tracking-tight text-primary">
                {step}
              </span>
            </div>
          ))}
        </div>
      </nav>

      {/* CORE TWO-COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* --- LEFT SIDE: HERO, TRACKER, DEEP LINKS, AND GUEST SIGNUP (7/12) --- */}
        <section className="lg:col-span-7 space-y-6">
          
          {/* HIGH IMPACT CELEBRATIVE HEADER */}
          <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-6 sm:p-10 text-center space-y-5 shadow-xs">
            <div className="flex justify-center">
              <div className="relative">
                <motion.svg
                  width="72"
                  height="72"
                  viewBox="0 0 72 72"
                  initial="hidden"
                  animate="visible"
                  className="text-primary"
                >
                  <motion.circle
                    cx="36"
                    cy="36"
                    r="33"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    fill="transparent"
                    variants={circleVariants}
                  />
                  <motion.path
                    d="M22 36 L31 45 L50 26"
                    stroke="currentColor"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="transparent"
                    variants={checkmarkVariants}
                  />
                </motion.svg>
                
                <motion.div 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 1.2, 1], opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.3 }}
                  className="absolute -top-1 -right-2 text-amber-500"
                >
                  <Sparkles className="h-5 w-5 animate-pulse" />
                </motion.div>
              </div>
            </div>

            <div className="space-y-3">
              <span className="inline-block text-[10px] font-black tracking-widest text-primary uppercase bg-primary/10 px-3 py-1 rounded-full">
                {t.heroTag}
              </span>
              <h1 className="text-2xl sm:text-3.5xl font-black tracking-tight leading-none text-slate-900 dark:text-white">
                {t.title}
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 leading-relaxed max-w-lg mx-auto">
                {t.subtitle}
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs font-bold text-slate-400">
              <span className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 px-3.5 py-2.5 rounded-2xl">
                {t.orderNumber}: <strong className="text-slate-800 dark:text-slate-200">{fallbackOrderId}</strong>
              </span>
              <span className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 px-3.5 py-2.5 rounded-2xl">
                {t.date}: <strong className="text-slate-800 dark:text-slate-200">23.08.2026</strong>
              </span>
            </div>
          </div>

          {/* REALTIME TIMELINE SHIPMENT TRACKER */}
          <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                {t.deliveryStatusTitle}
              </h3>
              <span className="text-[10px] font-black text-primary bg-primary/10 px-2.5 py-1 rounded-md uppercase tracking-wider animate-pulse">
                {t.deliveryTomorrow}
              </span>
            </div>

            <div className="space-y-6 relative before:absolute before:left-3.5 sm:before:left-4.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-850">
              
              {/* Step 1: Paid (Completed) */}
              <div className="flex gap-4 sm:gap-6 relative z-10 items-start">
                <div className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-primary text-white shadow-[0_0_8px_rgba(16,185,129,0.3)] shrink-0">
                  <Check className="h-4 w-4 stroke-[3px]" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-sm font-black text-slate-900 dark:text-white block">
                    {t.stepPaid}
                  </span>
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                    {t.stepPaidDesc}
                  </p>
                </div>
              </div>

              {/* Step 2: Packing (In Progress) */}
              <div className="flex gap-4 sm:gap-6 relative z-10 items-start">
                <div className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-amber-500 text-white ring-4 ring-amber-500/10 animate-pulse shrink-0">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                  >
                    <Sparkles className="h-4 w-4" />
                  </motion.div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-sm font-black text-amber-600 dark:text-amber-500 block">
                    {t.stepPacking}
                  </span>
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                    {t.stepPackingDesc}
                  </p>
                </div>
              </div>

              {/* Step 3: Courier Delivery (Planned) */}
              <div className="flex gap-4 sm:gap-6 relative z-10 items-start">
                <div className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 shrink-0">
                  <Truck className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-sm font-black text-slate-400 block">
                    {t.stepCourier}
                  </span>
                  <p className="text-xs font-semibold text-slate-500">
                    {t.stepCourierDesc}
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* POLISH ACCENTS LOCALIZATION: INPOST APP INTEGRATION */}
          {fallbackMethod === "paczkomat" && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-6 sm:p-8 space-y-5 shadow-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-[#FFCC00] flex flex-col items-center justify-center text-black shrink-0 font-black text-[10px] tracking-tighter leading-none shadow-md shadow-[#FFCC00]/10">
                    <span>In</span>
                    <span>Post</span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
                      {t.inpostTitle}
                    </h3>
                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 leading-relaxed max-w-sm">
                      {t.inpostDesc}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 px-4 py-2.5 rounded-2xl shrink-0 text-center sm:text-left self-start sm:self-center">
                  <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">{t.lockerCode}</span>
                  <strong className="text-sm font-black text-slate-800 dark:text-slate-200">{fallbackLocker}</strong>
                </div>
              </div>

              <a
                href={`https://inpost.pl/sledz-przesylke?number=${fallbackOrderId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#FFCC00] hover:bg-[#E6B800] text-black h-13.5 rounded-2xl font-black text-xs sm:text-sm tracking-tight transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-[#FFCC00]/10"
              >
                <QrCode className="h-5 w-5" />
                <span>{t.inpostCta}</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </motion.div>
          )}

          {/* ORLEN PACZKA INTEGRATION */}
          {fallbackMethod === "orlen" && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-6 sm:p-8 space-y-5 shadow-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-red-600 flex flex-col items-center justify-center text-white shrink-0 font-black text-[10px] tracking-tighter leading-none shadow-md shadow-red-600/10">
                    <span className="text-[8px] font-black tracking-tighter leading-none">ORLEN</span>
                    <span className="text-[8px] font-black tracking-tighter leading-none">Paczka</span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
                      {t.orlenTitle}
                    </h3>
                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 leading-relaxed max-w-sm">
                      {t.orlenDesc}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 px-4 py-2.5 rounded-2xl shrink-0 text-center sm:text-left self-start sm:self-center">
                  <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">{t.pointCode}</span>
                  <strong className="text-sm font-black text-slate-800 dark:text-slate-200">{fallbackLocker}</strong>
                </div>
              </div>

              <a
                href={`https://www.orlenpaczka.pl/sledz-paczke/?numer=${fallbackOrderId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-red-600 hover:bg-red-700 text-white h-13.5 rounded-2xl font-black text-xs sm:text-sm tracking-tight transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-red-600/10"
              >
                <QrCode className="h-5 w-5" />
                <span>{t.orlenCta}</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </motion.div>
          )}

          {/* BEN FRANKLIN EFFECT / ZEIGARNIK: 1-CLICK GUEST TO ACC SIGNUP */}
          <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-6 sm:p-8 space-y-5 shadow-xs">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
                <Lock className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-black tracking-tight">{t.accountTitle}</h3>
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 leading-relaxed">
                  {t.accountDesc}
                </p>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {!accountCreated ? (
                <motion.form 
                  key="signup-form"
                  onSubmit={handleCreateAccount} 
                  className="flex flex-col sm:flex-row gap-3 pt-2"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <input
                    type="password"
                    required
                    placeholder={t.passwordPlaceholder}
                    className="grow rounded-2xl border border-slate-200 dark:border-slate-800 px-4 py-3.5 text-sm font-bold bg-slate-50/50 dark:bg-slate-950/20 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary placeholder:text-slate-400"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="bg-primary hover:bg-primary-dark text-white rounded-2xl px-6 py-3.5 text-xs font-black shadow-md transition-all shrink-0 hover:shadow-primary/20 active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {t.accountCta}
                  </button>
                </motion.form>
              ) : (
                <motion.div 
                  key="signup-success"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/30 text-center text-emerald-800 dark:text-emerald-400 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2"
                >
                  <Sparkles className="h-4.5 w-4.5 animate-pulse text-emerald-500" />
                  <span>{t.accountSuccess}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </section>

        {/* --- RIGHT SIDE: INVOICE BREAKDOWN & LOYALTY SHARING (5/12) --- */}
        <section className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">

          {/* POLISH TAX LEDGER & FINANCIAL breakdown (Invoice proforma) */}
          <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-5 sm:p-7 space-y-6 shadow-xs">
            <h3 className="text-base sm:text-lg font-black tracking-tight border-b border-slate-100 dark:border-slate-800 pb-3">
              {t.detailsTitle}
            </h3>

            {/* Purchased Items Visual representation */}
            <div className="space-y-4">
              {order ? (
                order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center bg-slate-50/50 dark:bg-slate-950/20 p-3 rounded-2xl border border-slate-100/50 dark:border-slate-850">
                    <div className="h-14 w-14 rounded-xl overflow-hidden border border-slate-150 dark:border-slate-800 shrink-0 relative">
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className="h-full w-full object-cover" 
                      />
                      <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[9px] font-black h-5 w-5 flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="grow min-w-0">
                      <h4 className="text-xs font-black text-slate-850 dark:text-slate-200 truncate">
                        {item.title}
                      </h4>
                      {item.selectedSize && (
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">Size: {item.selectedSize}</p>
                      )}
                    </div>
                    <span className="text-xs font-black text-slate-900 dark:text-white shrink-0">
                      {formatPrice(isPLN ? item.pricePLN * item.quantity : item.priceEUR * item.quantity, currency, intlLocale)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex gap-4 items-center bg-slate-50/50 dark:bg-slate-950/20 p-3 rounded-2xl border border-slate-100/50 dark:border-slate-850">
                  <div className="h-14 w-14 rounded-xl overflow-hidden border border-slate-150 dark:border-slate-800 shrink-0 relative">
                    <img 
                      src="https://images.unsplash.com/photo-1574169208507-84376144848b?w=200&q=80" 
                      alt="Premium Sweater" 
                      className="h-full w-full object-cover" 
                    />
                    <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[9px] font-black h-5 w-5 flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900">
                      1
                    </span>
                  </div>
                  <div className="grow min-w-0">
                    <h4 className="text-xs font-black text-slate-850 dark:text-slate-200 truncate">
                      Premium Cashmere Sweater
                    </h4>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">VistulaVogue Edition</p>
                  </div>
                  <span className="text-xs font-black text-slate-900 dark:text-white shrink-0">
                    {formatPrice(finalProductsGross, currency, intlLocale)}
                  </span>
                </div>
              )}
            </div>

            {/* Cost Summary structure */}
            <div className="space-y-3.5 text-xs font-semibold pt-4 border-t border-slate-100 dark:border-slate-800">
              
              <div className="flex justify-between text-slate-400">
                <span>{t.summarySubtotal}</span>
                <span className="tabular-nums text-slate-855 dark:text-slate-250">
                  {formatPrice(finalProductsNet, currency, intlLocale)}
                </span>
              </div>

              <div className="flex justify-between text-slate-400">
                <span>{t.summaryVat}</span>
                <span className="tabular-nums text-slate-855 dark:text-slate-250">
                  {formatPrice(finalVatAmount, currency, intlLocale)}
                </span>
              </div>

              <div className="flex justify-between text-slate-400">
                <span>{t.summaryShipping}</span>
                <span className="tabular-nums text-slate-855 dark:text-slate-250">
                  {finalShipping === 0 ? (
                    <span className="text-primary font-black uppercase text-[10px] tracking-widest">{t.free}</span>
                  ) : (
                    formatPrice(finalShipping, currency, intlLocale)
                  )}
                </span>
              </div>

              <div className="flex justify-between text-sm font-black pt-3.5 border-t border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white">
                <span>{t.summaryTotal}</span>
                <span className="text-lg tracking-tight tabular-nums text-primary">
                  {formatPrice(finalTotal, currency, intlLocale)}
                </span>
              </div>
            </div>

            {/* Recipient Details display */}
            <div className="space-y-2.5 pt-5 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold">
              <span className="text-[10px] text-slate-400 block uppercase tracking-wider">{t.detailsRecipient}</span>
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4.5 w-4.5 text-slate-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-slate-850 dark:text-slate-200 block">
                    {shippingAddress?.fullName || "Jan Kowalski"}
                  </span>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    {fallbackMethod === "paczkomat" 
                      ? `${fallbackLocker} - Paczkomat InPost`
                      : fallbackMethod === "orlen"
                        ? `${fallbackLocker} - ORLEN Paczka`
                        : shippingAddress?.street 
                          ? `${shippingAddress.street}, ${shippingAddress.zipCode} ${shippingAddress.city}`
                          : "Marszałkowska 104/12, 00-001 Warszawa"}
                  </p>
                </div>
              </div>
            </div>

            {/* Secure Badge */}
            <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 pt-2 text-center leading-relaxed">
              <ShieldCheck className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
              <span>Szyfrowanie SSL 256-bit | Zgodność PCI-DSS</span>
            </div>
          </div>

          {/* LOYALTY SHARE & REFERRAL CAMPAIGN */}
          <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-linear-to-br from-primary/5 via-transparent to-transparent p-6 space-y-4 shadow-xs">
            <div className="flex gap-3.5">
              <div className="h-10 w-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
                <Gift className="h-5.5 w-5.5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-black tracking-tight">{t.referralTitle}</h4>
                <p className="text-[11px] font-semibold text-slate-450 leading-relaxed">
                  {t.referralDesc}
                </p>
              </div>
            </div>

            <button
              onClick={handleCopyLink}
              className="w-full bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 py-3 rounded-2xl text-[11px] font-black text-slate-800 dark:text-slate-150 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-98"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-500 stroke-[3px]" />
                  <span className="text-emerald-500">{t.referralCopied}</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 text-slate-400" />
                  <span>{t.referralCta}</span>
                </>
              )}
            </button>
          </div>

          {/* BACK TO SHOPPING BUTTON */}
          <div className="text-center pt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-1.5 text-xs font-black text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>{t.backToHome}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

        </section>

      </div>
    </main>
  );
}

export function SummaryStep() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center text-xs font-semibold text-slate-400">Loading Order...</div>}>
      <SummaryContent />
    </Suspense>
  );
}

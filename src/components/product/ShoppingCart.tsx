"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ShieldCheck, 
  Clock, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle, 
  ArrowRight,
  Sparkles,
  ArrowLeft
} from "lucide-react";
import { useCart } from "@/providers/CartProvider";
import { useCurrency } from "@/providers/CurrencyProvider";
import { useLocale } from "next-intl";
import { formatPrice } from "@/lib/currency";
import { Link, useRouter } from "@/i18n/navigation";
import type { ProductDetail } from "@/lib/types";

// --- TRANSLATIONS DICTIONARY ---
const translations = {
  pl: {
    stepper: ["Koszyk", "Dostawa", "Płatność", "Podsumowanie"],
    urgency: "Produkty w Twoim koszyku są zarezerwowane przez",
    minutes: "min",
    emptyTitle: "Twój koszyk jest pusty",
    emptySubtitle: "Wygląda na to, że nie dodałeś jeszcze żadnych produktów do koszyka.",
    continueShopping: "Kontynuuj zakupy",
    goBack: "Wróć do sklepu",
    freeShippingProgress: "Dodaj jeszcze {amount} do darmowej dostawy!",
    freeShippingSuccess: "Kwalifikujesz się do darmowej dostawy!",
    itemsTitle: "Wybrane produkty",
    color: "Kolor",
    size: "Rozmiar",
    omnibus: "Najniższa cena z 30 dni przed obniżką:",
    remove: "Usuń",
    summary: "Podsumowanie zamówienia",
    subtotal: "Suma częściowa",
    shipping: "Wysyłka",
    free: "Darmowa",
    promoCodeLink: "Masz kod rabatowy?",
    promoCodePlaceholder: "Wpisz kod (np. VOGUE10)",
    promoCodeApply: "Zastosuj",
    promoCodeApplied: "Kod zastosowany! (-10%)",
    promoCodeError: "Niepoprawny kod",
    vatIncluded: "Ceny zawierają podatek VAT",
    checkoutBtn: "Przejdź do dostawy",
    trustTitle: "Bezpieczne zakupy z VistulaVogue",
    inpostLocker: "Paczkomaty InPost",
    blikPayment: "Szybki BLIK",
    p24Payment: "Przelewy24",
    maxStockReached: "Osiągnięto limit magazynowy",
    loadDemo: "Załaduj przykładowe produkty",
    total: "Razem",
  },
  en: {
    stepper: ["Cart", "Shipping", "Payment", "Summary"],
    urgency: "Products in your cart are reserved for",
    minutes: "min",
    emptyTitle: "Your cart is empty",
    emptySubtitle: "Looks like you haven't added any products to your cart yet.",
    continueShopping: "Continue Shopping",
    goBack: "Go Back",
    freeShippingProgress: "Add {amount} more for free delivery!",
    freeShippingSuccess: "You qualify for free delivery!",
    itemsTitle: "Selected products",
    color: "Color",
    size: "Size",
    omnibus: "Lowest price within 30 days prior to discount:",
    remove: "Remove",
    summary: "Order Summary",
    subtotal: "Subtotal",
    shipping: "Shipping",
    free: "Free",
    promoCodeLink: "Do you have a promo code?",
    promoCodePlaceholder: "Enter code (e.g. VOGUE10)",
    promoCodeApply: "Apply",
    promoCodeApplied: "Code applied! (-10%)",
    promoCodeError: "Invalid code",
    vatIncluded: "Prices include VAT",
    checkoutBtn: "Proceed to shipping",
    trustTitle: "Secure shopping with VistulaVogue",
    inpostLocker: "InPost Locker",
    blikPayment: "Fast BLIK",
    p24Payment: "Przelewy24",
    maxStockReached: "Stock limit reached",
    loadDemo: "Load demo products",
    total: "Total",
  }
};

// --- MOCK DEMO DATA FOR TESTING ---
const demoProducts: ProductDetail[] = [
  {
    _id: "demo-1",
    title: "Wełniany Płaszcz Oversize",
    slug: "wool-oversize-coat",
    pricePLN: 449,
    priceEUR: 105,
    originalPricePLN: 599,
    originalPriceEUR: 139,
    lowestPrice30DaysPLN: 449,
    lowestPrice30DaysEUR: 105,
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=600&auto=format&fit=crop",
    category: "odziez",
    stockCount: 5,
    isFeatured: true,
  },
  {
    _id: "demo-2",
    title: "Klasyczny Golf z Merino",
    slug: "classic-merino-turtleneck",
    pricePLN: 189,
    priceEUR: 44,
    image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=600&auto=format&fit=crop",
    category: "odziez",
    stockCount: 12,
    isFeatured: false,
    lowestPrice30DaysPLN: 189,
    lowestPrice30DaysEUR: 44,
  }
];

export function ShoppingCart() {
  const locale = useLocale() as "pl" | "en";
  const t = translations[locale];
  const { currency } = useCurrency();
  const { items, removeItem, updateQuantity, addItem, isMounted } = useCart();
  const router = useRouter();

  const isPLN = currency === "PLN";
  const intlLocale = locale === "pl" ? "pl-PL" : "en-GB";

  // --- STATE ---
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15-minute reservation timer
  const [promoOpen, setPromoCodeOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0); // Percentage discount (e.g. 10 for 10%)
  const [promoError, setPromoError] = useState(false);
  const [promoSuccess, setPromoSuccess] = useState(false);

  // --- TIMER EFFECT ---
  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // --- PRICE FORMATTER ---
  const formatLocalPrice = (amount: number) => {
    return formatPrice(amount, currency, intlLocale);
  };

  // --- PROMO CODE HANDLER ---
  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === "VOGUE10") {
      setAppliedDiscount(10); // 10% off
      setPromoSuccess(true);
      setPromoError(false);
    } else {
      setPromoError(true);
      setPromoSuccess(false);
    }
  };

  // --- LOAD DEMO ITEMS ---
  const handleLoadDemo = () => {
    addItem(demoProducts[0], 1, locale === "pl" ? "Oliwkowy" : "Olive Green", "M");
    addItem(demoProducts[1], 2, locale === "pl" ? "Głęboka Czerń" : "Deep Black", "S");
  };

  // --- CALCULATION LOGIC ---
  const freeShippingThreshold = isPLN ? 199 : 45;
  const standardShippingCost = isPLN ? 12.99 : 3.99;

  const subtotal = items.reduce((acc, item) => {
    const price = isPLN ? item.product.pricePLN : item.product.priceEUR;
    return acc + price * item.quantity;
  }, 0);

  const discountAmount = subtotal * (appliedDiscount / 100);
  const discountedSubtotal = subtotal - discountAmount;
  const isFreeShipping = discountedSubtotal >= freeShippingThreshold;
  const shippingCost = items.length === 0 || isFreeShipping ? 0 : standardShippingCost;
  const total = discountedSubtotal + shippingCost;

  const shippingProgressPercentage = Math.min((discountedSubtotal / freeShippingThreshold) * 100, 100);
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - discountedSubtotal);

  const handleCheckoutClick = () => {
    router.push("/shipping");
  };

  if (!isMounted) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:py-10 text-slate-900 dark:text-slate-100">
      
      {/* GO BACK BUTTON */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary transition-colors cursor-pointer group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          {t.goBack}
        </button>
      </div>

      {/* 1. GOAL GRADIENT STEPPER */}
      <nav className="mb-8" aria-label="Checkout Progress">
        <div className="flex items-center justify-between max-w-xl mx-auto relative">
          {/* Background Connector Line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 z-0 rounded-full" />
          
          {/* Active Connector Progress */}
          <div 
            className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-0 rounded-full transition-all duration-500"
            style={{ width: "16.66%" }} // Progress from Step 1 to Step 2
          />

          {t.stepper.map((step, index) => {
            const isActive = index === 0;
            const isCompleted = index < 0;
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

      {/* 2. ETHICAL URGENCY RESERVATION BANNER */}
      {items.length > 0 && timeLeft > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center justify-center gap-2 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 px-4 py-3 text-xs font-bold text-amber-800 dark:text-amber-400 shadow-sm"
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

      {/* EMPTY STATE */}
      <AnimatePresence mode="wait">
        {items.length === 0 ? (
          <motion.div 
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mb-6">
              <ShoppingBag className="h-10 w-10" />
              <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-xs font-extrabold text-white">
                0
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight mb-2">{t.emptyTitle}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-8 leading-relaxed">
              {t.emptySubtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-black text-white hover:bg-primaryDark shadow-md shadow-primary/10 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                {t.continueShopping}
                <ArrowRight className="h-4 w-4" />
              </Link>

              <button 
                onClick={handleLoadDemo}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 bg-surface px-8 py-4 text-sm font-black hover:bg-accent-light/30 transition-all cursor-pointer"
              >
                <Sparkles className="h-4 w-4 text-primary" />
                {t.loadDemo}
              </button>
            </div>
          </motion.div>
        ) : (
          <div key="cart-content" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* --- LEFT COLUMN: CART ITEMS LIST (8/12) --- */}
            <section className="lg:col-span-8 space-y-6">
              
              {/* FREE SHIPPING PROGRESS TRACKER */}
              <div className={`rounded-2xl border p-5 space-y-3 shadow-sm transition-all duration-300 ${
                isFreeShipping 
                  ? "border-primary/10 dark:border-primary/5 bg-primary/3" 
                  : "border-rose-500/10 dark:border-rose-500/5 bg-rose-500/3"
              }`}>
                <div className="flex items-center justify-between text-xs font-black">
                  <span className={`flex items-center gap-1.5 transition-colors duration-300 ${isFreeShipping ? "text-primary" : "text-rose-500"}`}>
                    <ShieldCheck className="h-4 w-4 stroke-[2.5px]" />
                    {isFreeShipping ? t.freeShippingSuccess : t.freeShippingProgress.replace("{amount}", formatLocalPrice(amountToFreeShipping))}
                  </span>
                  <span className="text-slate-400 dark:text-slate-500">
                    {Math.round(shippingProgressPercentage)}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${shippingProgressPercentage}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`h-full rounded-full transition-all duration-300 ${
                      isFreeShipping 
                        ? "bg-primary shadow-[0_0_8px_rgba(16,185,129,0.4)]" 
                        : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]"
                    }`}
                  />
                </div>
              </div>

              {/* CART ITEMS CONTAINER */}
              <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-4 sm:p-6 shadow-sm">
                <h3 className="text-lg font-black tracking-tight mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                  {t.itemsTitle} ({items.reduce((sum, i) => sum + i.quantity, 0)})
                </h3>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  <AnimatePresence initial={false}>
                    {items.map((item) => {
                      const itemPrice = isPLN ? item.product.pricePLN : item.product.priceEUR;
                      const itemOriginalPrice = isPLN ? item.product.originalPricePLN : item.product.originalPriceEUR;
                      const itemLowestPrice = isPLN ? item.product.lowestPrice30DaysPLN : item.product.lowestPrice30DaysEUR;
                      const isDiscounted = !!itemOriginalPrice && itemOriginalPrice > itemPrice;

                      return (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -100 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-6 first:pt-0 last:pb-0"
                        >
                          {/* Product Image */}
                          <div className="relative h-24 w-20 sm:h-28 sm:w-24 shrink-0 overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                            <img 
                              src={item.product.image} 
                              alt={item.product.title} 
                              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                              loading="lazy"
                            />
                          </div>

                          {/* Product Info & Controls */}
                          <div className="flex-1 min-w-0 w-full space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="font-black text-sm sm:text-base tracking-tight leading-tight hover:text-primary transition-colors">
                                  <Link href={`/products/${item.product.slug}`}>{item.product.title}</Link>
                                </h4>
                                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500">
                                  {item.selectedColor && (
                                    <span>{t.color}: <strong className="text-slate-600 dark:text-slate-300">{item.selectedColor}</strong></span>
                                  )}
                                  {item.selectedSize && (
                                    <span>{t.size}: <strong className="text-slate-600 dark:text-slate-300">{item.selectedSize}</strong></span>
                                  )}
                                </div>
                              </div>

                              {/* Desktop Price Display */}
                              <div className="text-right hidden sm:block">
                                <div className="flex items-baseline justify-end gap-2">
                                  {isDiscounted && (
                                    <span className="text-xs text-slate-400 line-through font-medium">
                                      {formatLocalPrice(itemOriginalPrice * item.quantity)}
                                    </span>
                                  )}
                                  <span className="font-black text-sm sm:text-base text-slate-900 dark:text-slate-100">
                                    {formatLocalPrice(itemPrice * item.quantity)}
                                  </span>
                                </div>
                                {isDiscounted && itemLowestPrice && (
                                  <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                                    {t.omnibus} <strong className="font-bold text-slate-500">{formatLocalPrice(itemLowestPrice)}</strong>
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Quantity & Actions Bar */}
                            <div className="flex items-center justify-between pt-2">
                              {/* Quantity Selector */}
                              <div className="flex items-center rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-1">
                                <motion.button
                                  whileTap={{ scale: 0.85 }}
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                  className="flex h-7 w-7 items-center justify-center rounded-full text-slate-500 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-100 transition-all disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                                  aria-label={`Decrease quantity of ${item.product.title}`}
                                >
                                  <Minus className="h-3.5 w-3.5" />
                                </motion.button>
                                
                                <span className="w-8 text-center text-xs font-black tabular-nums">
                                  {item.quantity}
                                </span>

                                <motion.button
                                  whileTap={{ scale: 0.85 }}
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  disabled={item.quantity >= item.product.stockCount}
                                  className="flex h-7 w-7 items-center justify-center rounded-full text-slate-500 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-100 transition-all disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                                  aria-label={`Increase quantity of ${item.product.title}`}
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                </motion.button>
                              </div>

                              {/* Mobile Price & Remove Row */}
                              <div className="flex items-center gap-4">
                                {/* Mobile Price Display */}
                                <div className="text-right sm:hidden">
                                  <div className="flex items-baseline justify-end gap-1.5">
                                    {isDiscounted && (
                                      <span className="text-[10px] text-slate-400 line-through font-medium">
                                        {formatLocalPrice(itemOriginalPrice * item.quantity)}
                                      </span>
                                    )}
                                    <span className="font-black text-sm text-slate-900 dark:text-slate-100">
                                      {formatLocalPrice(itemPrice * item.quantity)}
                                    </span>
                                  </div>
                                </div>

                                {/* Trash Remove Button */}
                                <motion.button
                                  whileHover={{ scale: 1.1, color: "#EF4444" }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => removeItem(item.id)}
                                  className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all cursor-pointer"
                                  title={t.remove}
                                  aria-label={`Remove ${item.product.title} from cart`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </motion.button>
                              </div>
                            </div>

                            {/* Stock warning if quantity is near limit */}
                            {item.quantity === item.product.stockCount && (
                              <p className="text-[10px] font-bold text-amber-600 flex items-center gap-1 mt-1">
                                <AlertCircle className="h-3 w-3" />
                                {t.maxStockReached} ({item.product.stockCount} szt.)
                              </p>
                            )}

                            {/* Mobile Omnibus notice */}
                            {isDiscounted && itemLowestPrice && (
                              <p className="text-[9px] text-slate-400 mt-1 leading-relaxed sm:hidden">
                                {t.omnibus} <strong className="font-bold text-slate-500">{formatLocalPrice(itemLowestPrice)}</strong>
                              </p>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            </section>

            {/* --- RIGHT COLUMN: ORDER SUMMARY CARD (4/12) --- */}
            <section className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
              <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-5 sm:p-6 shadow-sm space-y-5">
                <h3 className="text-lg font-black tracking-tight border-b border-slate-100 dark:border-slate-800 pb-3">
                  {t.summary}
                </h3>

                {/* Pricing Details */}
                <div className="space-y-3 text-sm font-semibold">
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>{t.subtotal}</span>
                    <span className="tabular-nums text-slate-900 dark:text-slate-100">{formatLocalPrice(subtotal)}</span>
                  </div>

                  {appliedDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                      <span>Rabat (-{appliedDiscount}%)</span>
                      <span className="tabular-nums font-bold">-{formatLocalPrice(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>{t.shipping}</span>
                    <span className="tabular-nums text-slate-900 dark:text-slate-100">
                      {shippingCost === 0 ? (
                        <span className="text-primary font-black uppercase tracking-wider text-xs">{t.free}</span>
                      ) : (
                        formatLocalPrice(shippingCost)
                      )}
                    </span>
                  </div>

                  {/* PROGRESSIVE DISCLOSURE PROMO CODE ACCORDION */}
                  <div className="border-t border-b border-slate-100 dark:border-slate-800 py-3">
                    <button
                      type="button"
                      onClick={() => setPromoCodeOpen(!promoOpen)}
                      className="flex w-full items-center justify-between text-xs font-black text-slate-500 hover:text-primary transition-colors focus:outline-none cursor-pointer"
                    >
                      <span className="flex items-center gap-1">
                        {t.promoCodeLink}
                      </span>
                      {promoOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>

                    <motion.div
                      initial={false}
                      animate={{ height: promoOpen ? "auto" : 0, opacity: promoOpen ? 1 : 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <form onSubmit={handleApplyPromo} className="flex gap-2 pt-3">
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          placeholder={t.promoCodePlaceholder}
                          disabled={promoSuccess}
                          className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-bold uppercase tracking-wider outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                        />
                        <button
                          type="submit"
                          disabled={promoSuccess || !promoCode.trim()}
                          className="rounded-xl bg-slate-900 dark:bg-slate-100 px-4 py-2 text-xs font-black text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 transition-all disabled:opacity-30 cursor-pointer"
                        >
                          {t.promoCodeApply}
                        </button>
                      </form>

                      {promoError && (
                        <p className="text-[10px] font-bold text-rose-500 mt-1.5 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {t.promoCodeError}
                        </p>
                      )}

                      {promoSuccess && (
                        <p className="text-[10px] font-bold text-primary mt-1.5 flex items-center gap-1">
                          <Check className="h-3.5 w-3.5 stroke-[3px]" />
                          {t.promoCodeApplied}
                        </p>
                      )}
                    </motion.div>
                  </div>

                  {/* Total Price */}
                  <div className="flex justify-between text-base font-black pt-2 text-slate-900 dark:text-slate-100">
                    <span>{t.total}</span>
                    <span className="text-xl sm:text-2xl tracking-tight tabular-nums text-primary">
                      {formatLocalPrice(total)}
                    </span>
                  </div>
                </div>

                {/* VAT Legal Notice */}
                <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center leading-relaxed">
                  {t.vatIncluded}
                </p>

                {/* PRIMARY CTA CHECKOUT BUTTON WITH SHIMMER GRADIENT */}
                <div className="relative group">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleCheckoutClick}
                    className="relative w-full overflow-hidden rounded-full bg-primary py-4 px-6 text-sm font-black text-white shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 w-1/2 h-full bg-linear-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:animate-shimmer" />
                    
                    <span>{t.checkoutBtn}</span>
                    <ArrowRight className="h-4.5 w-4.5 stroke-[2.5px]" />
                  </motion.button>
                </div>

                {/* LOCALIZED POLISH TRUST BADGES */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-3">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 text-center">
                    {t.trustTitle}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {/* BLIK Badge */}
                    <div className="flex flex-col items-center justify-center p-2 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 hover:border-pink-500/20 transition-colors group">
                      <svg className="h-5 w-10 text-[#E3007B] fill-current group-hover:scale-105 transition-transform" viewBox="0 0 100 50">
                        <text x="50" y="32" fontSize="24" fontWeight="900" textAnchor="middle" fill="#E3007B" letterSpacing="-1">blik</text>
                      </svg>
                      <span className="text-[8px] font-extrabold text-slate-400 dark:text-slate-500 mt-1 text-center leading-none">
                        {t.blikPayment}
                      </span>
                    </div>

                    {/* InPost Paczkomat Badge */}
                    <div className="flex flex-col items-center justify-center p-2 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 hover:border-amber-500/20 transition-colors group">
                      <div className="flex items-center gap-0.5 group-hover:scale-105 transition-transform">
                        <div className="h-4 w-4 bg-[#FFCC00] rounded flex items-center justify-center text-black font-black text-[10px]">
                          in
                        </div>
                        <span className="text-[11px] font-black text-black dark:text-white tracking-tighter">Post</span>
                      </div>
                      <span className="text-[8px] font-extrabold text-slate-400 dark:text-slate-500 mt-1.5 text-center leading-none">
                        {t.inpostLocker}
                      </span>
                    </div>

                    {/* Przelewy24 Badge (Coming Soon) */}
                    <div className="flex flex-col items-center justify-center p-2 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 opacity-50 relative group cursor-not-allowed">
                      <div className="flex items-center gap-0.5">
                        <span className="text-[11px] font-black tracking-tighter text-red-600">P</span>
                        <span className="text-[11px] font-black tracking-tighter text-blue-600">24</span>
                      </div>
                      <span className="text-[8px] font-extrabold text-slate-400 dark:text-slate-500 mt-1.5 text-center leading-none">
                        {t.p24Payment} ({locale === "pl" ? "wkrótce" : "soon"})
                      </span>
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-950 text-[9px] text-white px-2 py-1 rounded-md font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md z-10">
                        {locale === "pl" ? "Szybkie przelewy – już wkrótce!" : "Bank transfers – coming soon!"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </AnimatePresence>

      {/* MOBILE-ONLY STICKY BOTTOM SUMMARY BAR */}
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-100 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-lg px-4 py-3 shadow-2xl sm:hidden flex items-center justify-between gap-4">
          <div className="leading-tight">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t.total}</p>
            <p className="text-lg font-black text-primary tabular-nums">{formatLocalPrice(total)}</p>
          </div>
          
          <button 
            type="button"
            onClick={handleCheckoutClick}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-primary py-3.5 px-6 text-xs font-black text-white shadow-md shadow-primary/20 hover:bg-primaryDark active:scale-95 transition-all cursor-pointer min-h-11"
          >
            <span>{t.checkoutBtn}</span>
            <ArrowRight className="h-4 w-4 stroke-[2.5px]" />
          </button>
        </div>
      )}
    </main>
  );
}

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, FileText, Truck, ShieldAlert } from "lucide-react";
import { useLocale } from "next-intl";
import type { ProductDetail } from "@/lib/types";

export function ProductDetailsAccordion({ product }: { product: ProductDetail }) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const locale = useLocale();

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const accordionItems = [
    {
      id: "details",
      title: locale === "pl" ? "Szczegóły i parametry" : "Product Details",
      icon: FileText,
      specs: product.specifications || [
        { key: locale === "pl" ? "Kraj pochodzenia" : "Origin", value: locale === "pl" ? "Polska" : "Poland" },
        { key: locale === "pl" ? "Certyfikat" : "Certificate", value: "CE, OEKO-TEX" },
        { key: locale === "pl" ? "Gwarancja" : "Warranty", value: locale === "pl" ? "24 miesiące" : "24 Months" }
      ]
    },
    {
      id: "delivery",
      title: locale === "pl" ? "Wysyłka i płatności" : "Shipping & Payments",
      icon: Truck,
      text: locale === "pl" 
        ? "Wszystkie zamówienia wysyłamy w ciągu 24h. Oferujemy dostawę do Paczkomatów InPost, kurierem DHL oraz punkty odbioru Żabka. Bezpieczne płatności BLIK, Apple Pay, Google Pay i szybkie przelewy."
        : "All orders are dispatched within 24 hours. We offer delivery via InPost, DHL, and local pickup points. Secure payments via card, Google Pay, Apple Pay, and BLIK."
    },
    {
      id: "warranty",
      title: locale === "pl" ? "Zwroty i reklamacje" : "Returns & Guarantees",
      icon: ShieldAlert,
      text: locale === "pl"
        ? "Masz prawo do bezproblemowego zwrotu towaru w ciągu 14 dni od otrzymania paczki bez podawania przyczyny. Reklamacje rozpatrujemy w ciągu 48h. Kupuj bez obaw!"
        : "You have the right to a hassle-free return within 14 days of receiving your package, with no questions asked. We resolve warranty issues within 48 hours."
    }
  ];

  return (
    <div className="mt-8 border-t border-accent/10 divide-y divide-accent/10">
      {accordionItems.map(({ id, title, icon: Icon, specs, text }) => {
        const isOpen = !!openSections[id];
        return (
          <div key={id} className="py-4">
            <button
              type="button"
              onClick={() => toggleSection(id)}
              className="flex w-full items-center justify-between text-left font-black text-foreground text-sm cursor-pointer py-1"
            >
              <span className="flex items-center gap-2.5">
                <Icon className="h-4.5 w-4.5 text-primary" />
                {title}
              </span>
              <ChevronDown className={`h-4 w-4 text-muted transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 text-xs leading-relaxed text-muted space-y-2 pb-2">
                    {specs ? (
                      <div className="grid grid-cols-2 gap-y-2 border border-accent/5 p-3.5 rounded-2xl bg-surface shadow-sm">
                        {specs.map((item, index) => (
                          <div key={index} className="contents">
                            <span className="font-extrabold text-foreground">{item.key}</span>
                            <span className="text-right font-semibold text-muted-dark">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="font-semibold text-muted-dark pl-1">
                        {text}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

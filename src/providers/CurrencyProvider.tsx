"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Currency } from "@/lib/types";

const STORAGE_KEY = "vistulavogue-currency";

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

function readStoredCurrency(): Currency {
  if (typeof window === "undefined") return "PLN";
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "EUR" ? "EUR" : "PLN";
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("PLN");

  useEffect(() => {
    setCurrencyState(readStoredCurrency());
  }, []);

  const setCurrency = useCallback((next: Currency) => {
    setCurrencyState(next);
    localStorage.setItem(STORAGE_KEY, next);
    document.cookie = `${STORAGE_KEY}=${next};path=/;max-age=31536000;SameSite=Lax`;
  }, []);

  const value = useMemo(
    () => ({ currency, setCurrency }),
    [currency, setCurrency],
  );

  return (
    <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }
  return context;
}

"use client";

/**
 * Client checkout-phase store.
 * Persists session_token in sessionStorage (operational checkout data, Art. 6(1)(b)).
 * Does not fire marketing pixels — consent lives on the checkout form and API gates.
 */

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  CartItem,
  CheckoutPhase,
  CheckoutSession,
} from "@/lib/cart-recovery-types";

export type { CartItem, CheckoutPhase, CheckoutSession, RecoveryPayload } from "@/lib/cart-recovery-types";

interface CartRecoveryState {
  session: CheckoutSession | null;
  startSession: (cartItems: CartItem[]) => CheckoutSession;
  captureEmail: (email: string, zgodaMarketingowa: boolean) => CheckoutSession | null;
  markAbandoned: () => CheckoutSession | null;
  hydrateFromServer: (session: CheckoutSession) => void;
  reset: () => void;
}

function newToken(): string {
  return crypto.randomUUID();
}

function nowIso(): string {
  return new Date().toISOString();
}

export const useCartRecoveryStore = create<CartRecoveryState>()(
  persist(
    (set, get) => ({
      session: null,

      startSession: (cartItems) => {
        const existing = get().session;
        if (existing?.sessionToken) {
          const next: CheckoutSession = {
            ...existing,
            cartItems,
            phase:
              existing.phase === "recovered" || existing.phase === "abandoned"
                ? existing.phase
                : "started",
            updatedAt: nowIso(),
          };
          set({ session: next });
          return next;
        }

        const created: CheckoutSession = {
          sessionId: newToken(),
          sessionToken: newToken(),
          phase: "started",
          email: null,
          zgodaMarketingowa: false,
          cartItems,
          createdAt: nowIso(),
          updatedAt: nowIso(),
          abandonedAt: null,
          recoveredAt: null,
          offerExpiresAt: null,
          recoveryDiscountPercent: null,
        };
        set({ session: created });
        return created;
      },

      captureEmail: (email, zgodaMarketingowa) => {
        const session = get().session;
        if (!session) return null;
        const next: CheckoutSession = {
          ...session,
          email: email.toLowerCase().trim(),
          zgodaMarketingowa,
          phase: "email_captured",
          updatedAt: nowIso(),
        };
        set({ session: next });
        return next;
      },

      markAbandoned: () => {
        const session = get().session;
        if (!session) return null;
        if (session.phase === "recovered") return session;
        const next: CheckoutSession = {
          ...session,
          phase: "abandoned",
          abandonedAt: nowIso(),
          updatedAt: nowIso(),
        };
        set({ session: next });
        return next;
      },

      hydrateFromServer: (session) => set({ session }),
      reset: () => set({ session: null }),
    }),
    {
      name: "vv-checkout-recovery",
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          try {
            const value = sessionStorage.getItem(name);
            return value && value.trim() ? value : null;
          } catch {
            return null;
          }
        },
        setItem: (name, value) => {
          sessionStorage.setItem(name, value);
        },
        removeItem: (name) => {
          sessionStorage.removeItem(name);
        },
      })),
      partialize: (state) => ({ session: state.session }),
    }
  )
);

export async function persistCheckoutSession(input: {
  sessionId: string;
  sessionToken: string;
  email?: string;
  zgodaMarketingowa?: boolean;
  cartItems?: CartItem[];
  phase?: CheckoutPhase;
}): Promise<void> {
  try {
    await fetch("/api/checkout/recover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      keepalive: true,
    });
  } catch {
    // Keep checkout usable if persistence is unavailable.
  }
}

export function toRecoveryCartItems(
  items: Array<{
    id: string;
    product: { title: string; image: string; pricePLN: number; priceEUR: number };
    quantity: number;
  }>,
  currency: "PLN" | "EUR"
): CartItem[] {
  return items.map((item) => ({
    id: item.id,
    title: item.product.title,
    quantity: item.quantity,
    unitPrice: currency === "PLN" ? item.product.pricePLN : item.product.priceEUR,
    currency,
    image: item.product.image,
  }));
}

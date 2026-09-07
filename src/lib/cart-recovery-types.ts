/**
 * Abandoned-cart recovery contracts.
 * Shared by the client Zustand store and serverless recover/email routes.
 * No `any` — every payload that crosses the network is typed here.
 */

export type CheckoutPhase =
  | "started"
  | "email_captured"
  | "abandoned"
  | "recovered";

/** Line item snapshot used for recovery emails and session resume. */
export interface CartItem {
  id: string;
  title: string;
  quantity: number;
  /** Unit price in major units (PLN/EUR), frozen at capture time. */
  unitPrice: number;
  currency: "PLN" | "EUR";
  image?: string;
}

export interface CheckoutSession {
  sessionId: string;
  /** Opaque local capability token; never log in full. */
  sessionToken: string;
  phase: CheckoutPhase;
  email: string | null;
  /** Art. 6(1)(a) RODO — marketing recovery mail only when true. */
  zgodaMarketingowa: boolean;
  cartItems: CartItem[];
  createdAt: string;
  updatedAt: string;
  abandonedAt: string | null;
  recoveredAt: string | null;
  /** Server-authoritative 15-minute window after first valid link activation. */
  offerExpiresAt: string | null;
  /**
   * Real granted discount percent from commerce, or null.
   * Never invent a 10% “recovery offer” without a priced promotion.
   */
  recoveryDiscountPercent: number | null;
}

export interface RecoveryPayload {
  sessionId: string;
  sessionToken: string;
  email?: string;
  zgodaMarketingowa?: boolean;
  cartItems?: CartItem[];
  phase?: CheckoutPhase;
}

export interface RecoverActivateResponse {
  ok: true;
  session: CheckoutSession;
}

export interface RecoverPersistResponse {
  ok: true;
  sessionId: string;
  phase: CheckoutPhase;
  eligibleForMarketingRecovery: boolean;
}

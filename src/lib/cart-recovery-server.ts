/**
 * Checkout session repository.
 * Prefers Supabase (service role) so Vercel instances share state.
 * Falls back to memory + local .data for `next dev` without an admin key.
 */

import { createHmac, timingSafeEqual } from "crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import {
  createAdminClient,
  isSupabaseAdminConfigured,
} from "@/lib/supabase/admin";
import type {
  CheckoutSession,
  RecoveryPayload,
} from "@/lib/cart-recovery-types";

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "checkout-sessions.json");

const memoryCache = new Map<string, CheckoutSession>();

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

type SessionRow = {
  session_id: string;
  session_token: string;
  phase: CheckoutSession["phase"];
  email: string | null;
  consent_gdpr: boolean;
  cart_items: CheckoutSession["cartItems"];
  offer_expires_at: string | null;
  recovery_discount_percent: number | null;
  abandoned_at: string | null;
  recovered_at: string | null;
  created_at: string;
  updated_at: string;
};

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

export function getRecoverySecret(): string | null {
  const fromEnv = process.env.CHECKOUT_RECOVERY_SECRET;
  if (fromEnv && fromEnv.length >= 16) {
    return fromEnv;
  }
  if (process.env.NODE_ENV === "production") {
    return null;
  }
  return "dev-checkout-recovery-secret-do-not-use-in-production";
}

export function signSessionLink(sessionId: string, sessionToken: string): string {
  const secret = getRecoverySecret();
  if (!secret) {
    throw new Error("CHECKOUT_RECOVERY_SECRET must be set in production (min 16 chars).");
  }
  return createHmac("sha256", secret)
    .update(`${sessionId}.${sessionToken}`)
    .digest("hex");
}

export function verifySignedLink(
  sessionId: string,
  sessionToken: string,
  signature: string
): boolean {
  if (!sessionId || !sessionToken || !signature) return false;
  if (!getRecoverySecret()) return false;
  const expected = signSessionLink(sessionId, sessionToken);
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function rowToSession(row: SessionRow): CheckoutSession {
  return {
    sessionId: row.session_id,
    sessionToken: row.session_token,
    phase: row.phase,
    email: row.email,
    zgodaMarketingowa: row.consent_gdpr,
    cartItems: Array.isArray(row.cart_items) ? row.cart_items : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    abandonedAt: row.abandoned_at,
    recoveredAt: row.recovered_at,
    offerExpiresAt: row.offer_expires_at,
    recoveryDiscountPercent: row.recovery_discount_percent,
  };
}

function sessionToRow(session: CheckoutSession): SessionRow {
  return {
    session_id: session.sessionId,
    session_token: session.sessionToken,
    phase: session.phase,
    email: session.email,
    consent_gdpr: session.zgodaMarketingowa,
    cart_items: session.cartItems,
    offer_expires_at: session.offerExpiresAt,
    recovery_discount_percent: session.recoveryDiscountPercent,
    abandoned_at: session.abandonedAt,
    recovered_at: session.recoveredAt,
    created_at: session.createdAt,
    updated_at: session.updatedAt,
  };
}

function loadFromDisk(): void {
  if (!existsSync(DATA_FILE)) return;
  try {
    const raw = readFileSync(DATA_FILE, "utf8");
    if (!raw.trim()) return;
    const parsed = JSON.parse(raw) as Record<string, CheckoutSession>;
    for (const [id, session] of Object.entries(parsed)) {
      memoryCache.set(id, session);
    }
  } catch {
    // Corrupt file must not take down checkout — start empty.
  }
}

function persistToDisk(): void {
  try {
    if (!existsSync(DATA_DIR)) {
      mkdirSync(DATA_DIR, { recursive: true });
    }
    const serialized: Record<string, CheckoutSession> = {};
    for (const [id, session] of memoryCache.entries()) {
      serialized[id] = session;
    }
    writeFileSync(DATA_FILE, JSON.stringify(serialized, null, 2), "utf8");
  } catch {
    // Disk may be read-only on some hosts; memory still serves this instance.
  }
}

let hydrated = false;
function ensureHydrated(): void {
  if (hydrated) return;
  loadFromDisk();
  hydrated = true;
}

function mergeSession(
  existing: CheckoutSession | undefined,
  payload: RecoveryPayload
): CheckoutSession {
  const now = new Date().toISOString();
  const zgoda =
    payload.zgodaMarketingowa === undefined
      ? (existing?.zgodaMarketingowa ?? false)
      : payload.zgodaMarketingowa === true;
  const emailRaw = payload.email?.toLowerCase().trim();
  const email =
    emailRaw && isValidEmail(emailRaw) ? emailRaw : (existing?.email ?? null);

  return {
    sessionId: payload.sessionId,
    sessionToken: payload.sessionToken,
    phase: payload.phase ?? existing?.phase ?? "started",
    email,
    zgodaMarketingowa: zgoda,
    cartItems: payload.cartItems ?? existing?.cartItems ?? [],
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    abandonedAt:
      payload.phase === "abandoned" ? now : (existing?.abandonedAt ?? null),
    recoveredAt: existing?.recoveredAt ?? null,
    offerExpiresAt: existing?.offerExpiresAt ?? null,
    recoveryDiscountPercent: existing?.recoveryDiscountPercent ?? null,
  };
}

export async function getSession(
  sessionId: string
): Promise<CheckoutSession | undefined> {
  if (isSupabaseAdminConfigured()) {
    const supabase = createAdminClient();
    if (!supabase) return undefined;
    const { data, error } = await supabase
      .from("checkout_sessions")
      .select("*")
      .eq("session_id", sessionId)
      .maybeSingle();
    if (error || !data) return undefined;
    return rowToSession(data as SessionRow);
  }

  ensureHydrated();
  return memoryCache.get(sessionId);
}

export async function upsertSession(
  payload: RecoveryPayload
): Promise<CheckoutSession> {
  const existing = await getSession(payload.sessionId);
  if (existing && existing.sessionToken !== payload.sessionToken) {
    throw new Error("SESSION_TOKEN_MISMATCH");
  }

  const next = mergeSession(existing, payload);

  if (isSupabaseAdminConfigured()) {
    const supabase = createAdminClient();
    if (!supabase) {
      throw new Error("SUPABASE_ADMIN_UNAVAILABLE");
    }
    const { data, error } = await supabase
      .from("checkout_sessions")
      .upsert(sessionToRow(next), { onConflict: "session_id" })
      .select()
      .single();
    if (error || !data) {
      throw new Error(error?.message || "CHECKOUT_SESSION_UPSERT_FAILED");
    }
    return rowToSession(data as SessionRow);
  }

  ensureHydrated();
  memoryCache.set(next.sessionId, next);
  persistToDisk();
  return next;
}

const RECOVERY_WINDOW_MS = 15 * 60 * 1000;

/** First valid click starts the 15-minute hold; later clicks keep the same expiry. */
export async function activateRecovery(
  sessionId: string
): Promise<CheckoutSession | null> {
  const session = await getSession(sessionId);
  if (!session) return null;

  const now = Date.now();
  const existingExpiry = session.offerExpiresAt
    ? Date.parse(session.offerExpiresAt)
    : NaN;

  const offerExpiresAt =
    Number.isFinite(existingExpiry) && existingExpiry > now
      ? session.offerExpiresAt
      : new Date(now + RECOVERY_WINDOW_MS).toISOString();

  const recovered: CheckoutSession = {
    ...session,
    phase: "recovered",
    recoveredAt: session.recoveredAt ?? new Date(now).toISOString(),
    offerExpiresAt,
    updatedAt: new Date(now).toISOString(),
  };

  if (isSupabaseAdminConfigured()) {
    const supabase = createAdminClient();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("checkout_sessions")
      .update({
        phase: recovered.phase,
        recovered_at: recovered.recoveredAt,
        offer_expires_at: recovered.offerExpiresAt,
        updated_at: recovered.updatedAt,
      })
      .eq("session_id", sessionId)
      .select()
      .single();
    if (error || !data) return null;
    return rowToSession(data as SessionRow);
  }

  ensureHydrated();
  memoryCache.set(sessionId, recovered);
  persistToDisk();
  return recovered;
}

export function buildRecoveryUrl(
  origin: string,
  locale: string,
  session: CheckoutSession
): string {
  const sig = signSessionLink(session.sessionId, session.sessionToken);
  const params = new URLSearchParams({
    recover: session.sessionId,
    t: session.sessionToken,
    s: sig,
  });
  const prefix = locale.replace(/^\//, "");
  return `${origin.replace(/\/$/, "")}/${prefix}/checkout?${params.toString()}`;
}

export function originFromRequest(request: Request): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env.replace(/\/$/, "");
  const proto = request.headers.get("x-forwarded-proto") ?? "http";
  const host =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    "localhost:3000";
  return `${proto}://${host}`;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

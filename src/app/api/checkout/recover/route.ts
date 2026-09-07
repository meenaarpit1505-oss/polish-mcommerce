import { NextRequest, NextResponse } from "next/server";
import type { RecoveryPayload } from "@/lib/cart-recovery-types";
import {
  activateRecovery,
  getSession,
  isValidEmail,
  upsertSession,
  verifySignedLink,
} from "@/lib/cart-recovery-server";

function isRecoveryPayload(value: unknown): value is RecoveryPayload {
  if (typeof value !== "object" || value === null) return false;
  const body = value as Record<string, unknown>;
  return typeof body.sessionId === "string" && typeof body.sessionToken === "string";
}

/**
 * Persist checkout progression from the client.
 * Email may be stored as pre-contract data (Art. 6(1)(b)).
 * zgoda_marketingowa is the only switch for marketing eligibility.
 */
export async function POST(request: NextRequest) {
  try {
    const json: unknown = await request.json();
    if (!isRecoveryPayload(json)) {
      return NextResponse.json(
        { error: "Brak identyfikatora sesji." },
        { status: 400 }
      );
    }

    if (json.email && !isValidEmail(json.email)) {
      return NextResponse.json(
        { error: "Nieprawidłowy adres e-mail." },
        { status: 400 }
      );
    }

    const zgoda = json.zgodaMarketingowa === true;
    const session = await upsertSession({
      ...json,
      zgodaMarketingowa: zgoda,
      phase: json.phase ?? (json.email ? "email_captured" : "started"),
    });

    return NextResponse.json({
      ok: true,
      sessionId: session.sessionId,
      phase: session.phase,
      eligibleForMarketingRecovery: session.zgodaMarketingowa === true,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "SESSION_TOKEN_MISMATCH") {
      return NextResponse.json(
        { error: "Nieprawidłowy token sesji." },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { error: "Nie udało się zapisać sesji kasy." },
      { status: 500 }
    );
  }
}

/**
 * Webhook entry when the shopper opens /checkout?recover=session_id&t=...&s=...
 * Query aliases: session_id or recover.
 */
export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const sessionId = params.get("session_id") ?? params.get("recover");
    const token = params.get("t");
    const sig = params.get("s");

    if (!sessionId || !token || !sig || !verifySignedLink(sessionId, token, sig)) {
      return NextResponse.json(
        { error: "Nieprawidłowy lub wygasły link odzyskania koszyka." },
        { status: 400 }
      );
    }

    const existing = await getSession(sessionId);
    if (!existing || existing.sessionToken !== token) {
      return NextResponse.json(
        { error: "Sesja kasy nie istnieje." },
        { status: 404 }
      );
    }

    const activated = await activateRecovery(sessionId);
    if (!activated) {
      return NextResponse.json(
        { error: "Nie udało się wznowić sesji." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, session: activated });
  } catch {
    return NextResponse.json(
      { error: "Błąd weryfikacji linku odzyskania." },
      { status: 500 }
    );
  }
}

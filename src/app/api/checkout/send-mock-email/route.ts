import { NextRequest, NextResponse } from "next/server";
import {
  buildRecoveryUrl,
  escapeHtml,
  getSession,
  originFromRequest,
  upsertSession,
} from "@/lib/cart-recovery-server";
import type { CartItem, CheckoutSession } from "@/lib/cart-recovery-types";

interface SendMockEmailBody {
  sessionId?: string;
}

function formatPln(amount: number): string {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(amount);
}

function lineItemsHtml(items: CartItem[]): string {
  if (items.length === 0) {
    return `<p style="margin:0;color:#64748b;font-size:14px;">Twoje pozycje z kasy czekają w sklepie.</p>`;
  }
  return items
    .map((item) => {
      const title = escapeHtml(item.title);
      const qty = escapeHtml(String(item.quantity));
      const price = escapeHtml(formatPln(item.unitPrice * item.quantity));
      return `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:14px;color:#0f172a;">${title} × ${qty}</td>
        <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:14px;color:#0f172a;text-align:right;">${price}</td>
      </tr>`;
    })
    .join("");
}

function wrapEmail(inner: string, privacyUrl: string): string {
  const privacy = escapeHtml(privacyUrl);
  return `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Dokończ zamówienie</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Georgia,'Times New Roman',serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #e2e8f0;">
          <tr>
            <td style="background:#0f172a;padding:28px 32px;">
              <p style="margin:0;color:#94a3b8;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;font-family:system-ui,sans-serif;">Vistula Vogue</p>
              <h1 style="margin:8px 0 0;color:#ffffff;font-size:22px;line-height:1.3;">Twój koszyk czeka</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              ${inner}
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 28px;font-family:system-ui,sans-serif;font-size:11px;line-height:1.6;color:#94a3b8;">
              Masz prawo wycofać zgodę na marketing w każdej chwili. Szczegóły:
              <a href="${privacy}" style="color:#0f172a;">Polityka prywatności</a>.
              To wiadomość związana z niedokończonym zamówieniem, nie newsletter.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function transactionalHtml(session: CheckoutSession, recoveryUrl: string, privacyUrl: string): string {
  const url = escapeHtml(recoveryUrl);
  return wrapEmail(`
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#334155;">
      Zauważyliśmy, że nie dokończyłeś zamówienia. Nic nie przepadło — wróć do kasy i sfinalizuj płatność BLIK-iem lub kartą.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;">
      ${lineItemsHtml(session.cartItems)}
    </table>
    <p style="margin:0 0 24px;">
      <a href="${url}" style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;padding:14px 22px;border-radius:999px;font-family:system-ui,sans-serif;font-size:14px;font-weight:700;">
        Wróć do zamówienia
      </a>
    </p>
    <p style="margin:0;font-size:13px;line-height:1.6;color:#64748b;font-family:system-ui,sans-serif;">
      Ta wiadomość nie zawiera oferty promocyjnej. Wysłaliśmy ją, ponieważ rozpocząłeś proces zakupu.
    </p>
  `, privacyUrl);
}

function marketingHtml(session: CheckoutSession, recoveryUrl: string, privacyUrl: string): string {
  const url = escapeHtml(recoveryUrl);
  const discount =
    session.recoveryDiscountPercent != null && session.recoveryDiscountPercent > 0
      ? `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#0f172a;">
           Przyznany rabat ${escapeHtml(String(session.recoveryDiscountPercent))}% jest już uwzględniony w Twoim koszyku — zgodnie z ceną sprzed obniżki (dyrektywa Omnibus).
         </p>`
      : "";

  return wrapEmail(`
    <p style="margin:0 0 16px;font-size:16px;line-height:1.65;color:#334155;">
      Dokończ swoje zamówienie. Twój koszyk został zapisany — wróć jednym kliknięciem i zapłać BLIK-iem w aplikacji banku.
    </p>
    ${discount}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;">
      ${lineItemsHtml(session.cartItems)}
    </table>
    <p style="margin:0 0 24px;">
      <a href="${url}" style="display:inline-block;background:#be123c;color:#ffffff;text-decoration:none;padding:14px 22px;border-radius:999px;font-family:system-ui,sans-serif;font-size:14px;font-weight:700;">
        Dokończ zamówienie (BLIK)
      </a>
    </p>
    <p style="margin:0;font-size:13px;line-height:1.6;color:#64748b;font-family:system-ui,sans-serif;">
      Otrzymujesz tę wiadomość, ponieważ zaznaczyłeś zgodę marketingową przy kasie. Link jest unikalny i nie udostępniaj go osobom trzecim.
    </p>
  `, privacyUrl);
}

/**
 * Local stand-in for a 1-hour abandoned-cart cron.
 * Marketing HTML is returned only when zgoda_marketingowa is true.
 */
export async function POST(request: NextRequest) {
  try {
    const json = (await request.json()) as SendMockEmailBody;
    const sessionId = json.sessionId?.trim();
    if (!sessionId) {
      return NextResponse.json({ error: "Brak sessionId." }, { status: 400 });
    }

    const existing = await getSession(sessionId);
    if (!existing) {
      return NextResponse.json({ error: "Sesja nie istnieje." }, { status: 404 });
    }
    if (!existing.email) {
      return NextResponse.json(
        { error: "Brak adresu e-mail w sesji kasy." },
        { status: 400 }
      );
    }

    const abandoned = await upsertSession({
      sessionId: existing.sessionId,
      sessionToken: existing.sessionToken,
      email: existing.email,
      zgodaMarketingowa: existing.zgodaMarketingowa,
      cartItems: existing.cartItems,
      phase: "abandoned",
    });

    const origin = originFromRequest(request);
    const recoveryUrl = buildRecoveryUrl(origin, "pl", abandoned);
    const privacyUrl = `${origin}/pl/polityka-prywatnosci`;
    const template = abandoned.zgodaMarketingowa ? "marketing" : "transactional";
    const html =
      template === "marketing"
        ? marketingHtml(abandoned, recoveryUrl, privacyUrl)
        : transactionalHtml(abandoned, recoveryUrl, privacyUrl);

    return NextResponse.json({
      ok: true,
      template,
      to: abandoned.email,
      recoveryUrl,
      html,
      note:
        template === "marketing"
          ? "Szablon marketingowy — zgoda zgoda_marketingowa = true."
          : "Szablon transakcyjny — brak zgody marketingowej; bez oferty promocyjnej.",
    });
  } catch {
    return NextResponse.json(
      { error: "Nie udało się wygenerować wiadomości." },
      { status: 500 }
    );
  }
}

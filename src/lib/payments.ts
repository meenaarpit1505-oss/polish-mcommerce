/**
 * Payment gateway gate.
 * Fake BLIK/card authorization must never run in production.
 * Flip NEXT_PUBLIC_PAYMENTS_ENABLED=true only after a licensed PSP is wired
 * and the matching server secrets below are present.
 */

export function isPaymentGatewayConfigured(): boolean {
  const stripe = Boolean(process.env.STRIPE_SECRET_KEY);
  const payu = Boolean(process.env.PAYU_CLIENT_ID && process.env.PAYU_CLIENT_SECRET);
  const p24 = Boolean(process.env.P24_MERCHANT_ID && process.env.P24_CRC);
  return stripe || payu || p24;
}

export function arePaymentsEnabled(): boolean {
  return (
    process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === "true" &&
    isPaymentGatewayConfigured()
  );
}

export function arePaymentsEnabledClient(): boolean {
  return process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === "true";
}

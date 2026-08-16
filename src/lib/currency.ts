import type { Currency, Product } from "./types";

export function formatPrice(
  amount: number,
  currency: Currency,
  locale = "pl-PL",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: currency === "PLN" ? 0 : 2,
    maximumFractionDigits: currency === "PLN" ? 0 : 2,
  }).format(amount);
}

export function getProductPrice(product: Product, currency: Currency): number {
  return currency === "PLN" ? product.pricePLN : product.priceEUR;
}

export function getProductOriginalPrice(
  product: Product,
  currency: Currency,
): number | undefined {
  return currency === "PLN"
    ? product.originalPricePLN
    : product.originalPriceEUR;
}

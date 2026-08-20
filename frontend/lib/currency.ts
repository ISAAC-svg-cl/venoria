/**
 * Global currency utilities for Venoria
 * Primary: USD ($) & FC (Franc Congolais)
 */

export type CurrencyCode = "USD" | "FC";

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  USD: "$",
  FC: "FC",
};

export const CURRENCY_LABELS: Record<CurrencyCode, string> = {
  USD: "Dollar ($)",
  FC: "Franc Congolais (FC)",
};

/**
 * Format a cent-amount to display string using the chosen currency
 */
export function formatAmount(cents: number, currency: CurrencyCode = "USD"): string {
  const amount = cents / 100;

  if (currency === "FC") {
    return `${new Intl.NumberFormat("fr-CD", { maximumFractionDigits: 0 }).format(amount)} FC`;
  }

  // Default USD ($)
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(amount);
}

/**
 * Get the symbol for a given currency code
 */
export function getCurrencySymbol(currency: CurrencyCode = "USD"): string {
  return CURRENCY_SYMBOLS[currency] ?? "$";
}

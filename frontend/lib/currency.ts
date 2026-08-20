/**
 * Global currency utilities for Venoria
 * Supports: FC (Franc Congolais), USD ($), EUR (€), GBP (£), CHF
 */

export type CurrencyCode = "FC" | "USD" | "EUR" | "GBP" | "CHF";

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  FC: "FC",
  USD: "$",
  EUR: "€",
  GBP: "£",
  CHF: "CHF",
};

export const CURRENCY_LABELS: Record<CurrencyCode, string> = {
  FC: "Franc Congolais (FC)",
  USD: "Dollar US ($)",
  EUR: "Euro (€)",
  GBP: "Livre Sterling (£)",
  CHF: "Franc Suisse (CHF)",
};

/**
 * Format a cent-amount to display string using the chosen currency
 * FC and CHF use locale "fr-CD" / "fr-CH" without decimal for round amounts
 */
export function formatAmount(cents: number, currency: CurrencyCode = "FC"): string {
  const amount = cents / 100;

  if (currency === "FC") {
    // FC doesn't use decimals for large amounts
    return `${new Intl.NumberFormat("fr-CD", { maximumFractionDigits: 0 }).format(amount)} FC`;
  }

  if (currency === "USD") {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(amount);
  }

  if (currency === "EUR") {
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(amount);
  }

  if (currency === "GBP") {
    return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 2 }).format(amount);
  }

  if (currency === "CHF") {
    return new Intl.NumberFormat("fr-CH", { style: "currency", currency: "CHF", maximumFractionDigits: 2 }).format(amount);
  }

  return `${amount} ${currency}`;
}

/**
 * Get the symbol for a given currency code
 */
export function getCurrencySymbol(currency: CurrencyCode): string {
  return CURRENCY_SYMBOLS[currency] ?? currency;
}

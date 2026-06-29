import { Decimal } from "decimal.js";

export type CurrencyCode = "PKR" | "USD" | "EUR" | "GBP" | "AED" | "INR";

const SYMBOLS: Record<string, string> = {
  PKR: "Rs ",
  USD: "$",
  EUR: "€",
  GBP: "£",
  AED: "AED ",
  INR: "₹",
};

export function currencySymbol(code: string): string {
  return SYMBOLS[code] ?? `${code} `;
}

export function toNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  if (value instanceof Decimal) return value.toNumber();
  if (typeof (value as { toNumber?: () => number }).toNumber === "function") {
    return (value as { toNumber: () => number }).toNumber();
  }
  return Number(value);
}

export function formatCurrencyValue(
  value: unknown,
  currency: string = "PKR",
  options: { compact?: boolean; signed?: boolean } = {},
): string {
  const n = toNumber(value);
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : options.signed && n > 0 ? "+" : "";
  const symbol = currencySymbol(currency);
  if (options.compact && abs >= 1000) {
    if (abs >= 1_000_000) return `${sign}${symbol}${(abs / 1_000_000).toFixed(1)}M`;
    if (abs >= 1_000) return `${sign}${symbol}${(abs / 1_000).toFixed(1)}K`;
  }
  return `${sign}${symbol}${abs.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function percent(value: number, fractionDigits = 1): string {
  if (!Number.isFinite(value)) return "-";
  return `${value.toFixed(fractionDigits)}%`;
}

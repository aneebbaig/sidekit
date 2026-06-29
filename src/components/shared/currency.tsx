import { cn } from "@/lib/utils";
import { formatCurrencyValue, toNumber } from "@/lib/currency";

interface CurrencyProps {
  value: unknown;
  currency?: string;
  className?: string;
  compact?: boolean;
  signed?: boolean;
  tone?: "default" | "positive" | "negative" | "auto" | "muted";
}

export function Currency({
  value,
  currency = "PKR",
  className,
  compact,
  signed,
  tone = "default",
}: CurrencyProps) {
  const formatted = formatCurrencyValue(value, currency, { compact, signed });
  const num = toNumber(value);
  const toneClass =
    tone === "positive"
      ? "text-emerald-300"
      : tone === "negative"
      ? "text-rose-300"
      : tone === "muted"
      ? "text-muted-foreground"
      : tone === "auto"
      ? num > 0
        ? "text-emerald-300"
        : num < 0
        ? "text-rose-300"
        : "text-foreground"
      : "text-foreground";

  return (
    <span data-money className={cn("font-mono tabular-nums", toneClass, className)}>
      {formatted}
    </span>
  );
}

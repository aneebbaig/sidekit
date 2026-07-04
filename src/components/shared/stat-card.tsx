import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Variant = "default" | "success" | "warning" | "danger" | "primary";

interface TrendInfo {
  value: number;
  label?: string;
  invert?: boolean;
}

interface StatCardProps {
  label: string;
  value: ReactNode;
  subtext?: ReactNode;
  icon?: ReactNode;
  variant?: Variant;
  trend?: TrendInfo;
  className?: string;
}

const variantBorder: Record<Variant, string> = {
  default: "border-border",
  success: "border-success/30",
  warning: "border-warning/30",
  danger: "border-destructive/30",
  primary: "border-primary/40",
};

const variantIconTone: Record<Variant, string> = {
  default: "bg-muted text-muted-foreground",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-destructive/10 text-destructive",
  primary: "bg-primary/10 text-primary",
};

export function StatCard({ label, value, subtext, icon, variant = "default", trend, className }: StatCardProps) {
  return (
    <Card className={cn("relative overflow-hidden", variantBorder[variant], className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          {icon ? (
            <div className={cn("flex h-7 w-7 items-center justify-center rounded-md [&>svg]:h-4 [&>svg]:w-4", variantIconTone[variant])}>
              {icon}
            </div>
          ) : null}
        </div>
        <div className="mt-3 flex items-baseline gap-2 text-2xl font-mono font-medium tabular-nums">
          {value}
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs">
          {trend ? <TrendBadge trend={trend} /> : null}
          {subtext ? <span className="text-muted-foreground">{subtext}</span> : null}
        </div>
      </CardContent>
    </Card>
  );
}

function TrendBadge({ trend }: { trend: TrendInfo }) {
  const v = trend.value;
  const positive = trend.invert ? v < 0 : v > 0;
  const negative = trend.invert ? v > 0 : v < 0;
  const tone = positive ? "text-success" : negative ? "text-destructive" : "text-muted-foreground";
  const Icon = v > 0 ? ArrowUp : v < 0 ? ArrowDown : Minus;
  const sign = v > 0 ? "+" : "";
  return (
    <span className={cn("inline-flex items-center gap-1 font-mono tabular-nums", tone)}>
      <Icon className="h-3 w-3" />
      {sign}
      {v.toFixed(1)}%{trend.label ? <span className="text-muted-foreground ml-1">{trend.label}</span> : null}
    </span>
  );
}

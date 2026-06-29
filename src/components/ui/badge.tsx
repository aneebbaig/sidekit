import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-border bg-muted text-foreground",
        outline: "border-border text-foreground",
        primary: "border-primary/40 bg-primary/10 text-primary",
        success: "border-emerald-700/50 bg-emerald-500/10 text-emerald-300",
        warning: "border-amber-700/50 bg-amber-500/10 text-amber-300",
        danger: "border-rose-700/50 bg-rose-500/10 text-rose-300",
        info: "border-sky-700/50 bg-sky-500/10 text-sky-300",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

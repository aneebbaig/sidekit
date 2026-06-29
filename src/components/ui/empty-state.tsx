import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-card/30 px-6 py-12 text-center",
        className,
      )}
    >
      {icon ? <div className="text-muted-foreground [&>svg]:h-8 [&>svg]:w-8">{icon}</div> : null}
      <div className="space-y-1">
        <p className="text-sm font-semibold">{title}</p>
        {description ? <p className="text-sm text-muted-foreground max-w-sm">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

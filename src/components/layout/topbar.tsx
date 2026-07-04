import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export function Topbar({ children }: { children?: ReactNode }) {
  return (
    <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/70 px-6 backdrop-blur">
      <div className="flex-1 min-w-0 flex items-center gap-3">{children}</div>
      <ThemeToggle />
    </div>
  );
}

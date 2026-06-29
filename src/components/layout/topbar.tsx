import type { ReactNode } from "react";

export function Topbar({ children }: { children?: ReactNode }) {
  return (
    <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/70 px-6 backdrop-blur">
      {children}
    </div>
  );
}

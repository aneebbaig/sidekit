"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface Props {
  hustleId: string;
}

const TABS = [
  { key: "", label: "Overview" },
  { key: "research", label: "Research" },
  { key: "products", label: "Products" },
  { key: "cost-sheet", label: "Cost Sheet" },
  { key: "suppliers", label: "Suppliers" },
  { key: "inventory", label: "Inventory" },
  { key: "orders", label: "Orders" },
  { key: "customers", label: "Customers" },
  { key: "financials", label: "Financials" },
  { key: "tasks", label: "Tasks" },
  { key: "settings", label: "Settings" },
];

export function HustleSubnav({ hustleId }: Props) {
  const pathname = usePathname() ?? "";
  const base = `/hustles/${hustleId}`;

  return (
    <div className="sticky top-14 z-20 border-b border-border bg-background/80 backdrop-blur">
      <div className="flex items-center gap-1 overflow-x-auto px-6">
        {TABS.map((t) => {
          const href = t.key ? `${base}/${t.key}` : base;
          const active =
            t.key === "" ? pathname === base : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={t.key || "overview"}
              href={href}
              className={cn(
                "relative whitespace-nowrap px-3 py-3 text-sm transition-colors",
                active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
              {active ? (
                <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-t bg-primary" />
              ) : null}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

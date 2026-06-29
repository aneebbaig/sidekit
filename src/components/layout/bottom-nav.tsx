"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Briefcase, ChartLine, UserCog } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/hustles", label: "Hustles", icon: Briefcase },
  { href: "/financials", label: "Financials", icon: ChartLine },
  { href: "/account", label: "Account", icon: UserCog },
];

export function BottomNav() {
  const pathname = usePathname() ?? "/";
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/90 backdrop-blur md:hidden">
      <div className="flex h-16 items-center justify-around px-1 pb-safe">
        {NAV.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-lg py-2 text-[10px] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

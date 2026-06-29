"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  ChartLine,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  UserCog,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/actions/auth-actions";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/hustles", label: "Hustles", icon: Briefcase },
  { href: "/financials", label: "Consolidated", icon: ChartLine },
  { href: "/account", label: "Account", icon: UserCog },
];

interface SidebarProps {
  user: { name: string | null; email: string | null };
}

function getInitials(name: string | null, email: string | null): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0][0].toUpperCase();
  }
  return email ? email[0].toUpperCase() : "?";
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname() ?? "/";
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggle = useUiStore((s) => s.toggleSidebar);
  const initials = getInitials(user.name, user.email);

  return (
    <aside
      className={cn(
        "sticky top-0 z-40 h-screen shrink-0 border-r border-border bg-card/80 backdrop-blur transition-[width] hidden md:flex md:flex-col",
        collapsed ? "w-[64px]" : "w-[224px]",
      )}
    >
      {/* Brand header */}
      <div className="flex h-14 items-center gap-2 border-b border-border px-3 shrink-0">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-primary font-bold">
          H
        </div>
        {!collapsed ? (
          <div className="flex-1 truncate">
            <p className="text-sm font-semibold tracking-tight">Sidekit</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Operator</p>
          </div>
        ) : null}
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggle}>
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </Button>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 p-2 flex-1">
        <TooltipProvider delayDuration={50}>
          {NAV.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const link = (
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  collapsed && "justify-center",
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed ? <span className="truncate">{item.label}</span> : null}
              </Link>
            );
            return collapsed ? (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            ) : (
              <div key={item.href}>{link}</div>
            );
          })}
        </TooltipProvider>
      </nav>

      {/* User footer */}
      <div className="shrink-0 border-t border-border p-2">
        <TooltipProvider delayDuration={50}>
          {collapsed ? (
            <div className="flex flex-col items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-semibold cursor-default select-none">
                    {initials}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p className="font-medium">{user.name ?? user.email}</p>
                  {user.name && user.email ? (
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  ) : null}
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => logoutAction()}
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Sign out</TooltipContent>
              </Tooltip>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-md px-1 py-1">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-semibold select-none">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate leading-tight">{user.name ?? user.email}</p>
                {user.name && user.email ? (
                  <p className="text-[11px] text-muted-foreground truncate leading-tight">{user.email}</p>
                ) : null}
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    onClick={() => logoutAction()}
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Sign out</TooltipContent>
              </Tooltip>
            </div>
          )}
        </TooltipProvider>
      </div>
    </aside>
  );
}

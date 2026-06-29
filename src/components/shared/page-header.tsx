import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Crumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Crumb[];
  action?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, breadcrumbs, action, className }: PageHeaderProps) {
  return (
    <header className={cn("flex flex-col gap-3 border-b border-border pb-5", className)}>
      {breadcrumbs && breadcrumbs.length > 0 ? (
        <nav className="flex items-center gap-1 text-xs text-muted-foreground">
          {breadcrumbs.map((c, i) => (
            <span key={`${c.label}-${i}`} className="flex items-center gap-1">
              {c.href ? (
                <Link href={c.href} className="hover:text-foreground transition-colors">
                  {c.label}
                </Link>
              ) : (
                <span>{c.label}</span>
              )}
              {i < breadcrumbs.length - 1 ? <ChevronRight className="h-3 w-3" /> : null}
            </span>
          ))}
        </nav>
      ) : null}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description ? <p className="text-sm text-muted-foreground max-w-2xl">{description}</p> : null}
        </div>
        {action ? <div className="flex items-center gap-2">{action}</div> : null}
      </div>
    </header>
  );
}

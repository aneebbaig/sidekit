"use client";

import { useOptimistic } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Briefcase } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { HustleStatus } from "@/generated/prisma/client";
import { HustleStatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/format";
import { HustleCreateButton } from "./hustle-create-button";
import { HustleAiWizardButton } from "./hustle-ai-wizard-button";
import { HustleFilters } from "./hustle-filters";
import type { CreatedHustle } from "./hustle-form";

type HustleRow = {
  id: string;
  name: string;
  color: string;
  description: string | null;
  currency: string;
  status: HustleStatus;
  createdAt: Date;
};

interface Props {
  initialHustles: HustleRow[];
  statusFilter?: string;
  sortFilter?: string;
}

export function HustleList({ initialHustles, statusFilter, sortFilter }: Props) {
  const router = useRouter();
  const [optimisticHustles, addOptimistic] = useOptimistic(
    initialHustles,
    (state: HustleRow[], newHustle: HustleRow) => [...state, newHustle],
  );

  function handleCreated(hustle: CreatedHustle) {
    addOptimistic(hustle);
    router.refresh();
  }

  const filtered = statusFilter
    ? optimisticHustles.filter((h) => h.status === statusFilter)
    : optimisticHustles;

  const sorted = [...filtered].sort((a, b) => {
    if (sortFilter === "name") return a.name.localeCompare(b.name);
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end gap-2">
        <HustleAiWizardButton onCreated={handleCreated} />
        <HustleCreateButton onCreated={handleCreated} />
      </div>

      <HustleFilters />

      {sorted.length === 0 ? (
        <EmptyState
          icon={<Briefcase />}
          title="No hustles match"
          description="Try clearing filters or create a new hustle."
          action={<HustleCreateButton onCreated={handleCreated} />}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((h) => (
            <Link key={h.id} href={`/hustles/${h.id}`} className="block group">
              <Card className="transition-colors group-hover:border-primary/40 h-full">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="h-10 w-10 rounded-full shrink-0"
                        style={{ backgroundColor: h.color }}
                      />
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{h.name}</p>
                        <p className="text-xs text-muted-foreground">{h.currency}</p>
                      </div>
                    </div>
                    <HustleStatusBadge status={h.status} />
                  </div>
                  {h.description ? (
                    <p className="text-sm text-muted-foreground line-clamp-2">{h.description}</p>
                  ) : null}
                  <p className="text-xs text-muted-foreground">Created {formatDate(h.createdAt)}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

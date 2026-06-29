"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { Hustle, HustleStatus } from "@/generated/prisma/client";
import { ChevronLeft, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Topbar } from "@/components/layout/topbar";
import {
  HUSTLE_STATUSES,
  HUSTLE_STATUS_LABELS,
} from "@/lib/constants";
import { updateHustleStatusAction } from "@/actions/hustle-actions";
import { toast } from "sonner";

export function HustleHeader({ hustle }: { hustle: Hustle }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function changeStatus(next: string) {
    startTransition(async () => {
      const res = await updateHustleStatusAction(hustle.id, next as HustleStatus);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("Status updated.");
      router.refresh();
    });
  }

  return (
    <Topbar>
      <Button variant="ghost" size="icon" asChild className="-ml-2">
        <Link href="/hustles">
          <ChevronLeft className="h-4 w-4" />
        </Link>
      </Button>
      <span
        className="h-7 w-7 rounded-full shrink-0"
        style={{ backgroundColor: hustle.color }}
      />
      <div className="min-w-0 flex-1">
        <p className="font-semibold leading-none truncate">{hustle.name}</p>
        <p className="text-xs text-muted-foreground">{hustle.currency}</p>
      </div>
      <div className="w-40">
        <Select value={hustle.status} onValueChange={changeStatus} disabled={pending}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {HUSTLE_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {HUSTLE_STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button variant="outline" size="icon" asChild>
        <Link href={`/hustles/${hustle.id}/settings`}>
          <Settings className="h-4 w-4" />
        </Link>
      </Button>
    </Topbar>
  );
}

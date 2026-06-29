"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Props {
  from: string;
  to: string;
}

export function DateRangeBar({ from, to }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const pathname = usePathname() ?? "";

  function apply(f: string, t: string) {
    const p = new URLSearchParams(sp?.toString() ?? "");
    p.set("from", f);
    p.set("to", t);
    router.replace(`${pathname}?${p.toString()}`);
  }

  function preset(name: "thisMonth" | "lastMonth" | "ytd" | "lastYear") {
    const now = new Date();
    if (name === "thisMonth") {
      apply(iso(startOfMonth(now)), iso(endOfMonth(now)));
    } else if (name === "lastMonth") {
      const d = subMonths(now, 1);
      apply(iso(startOfMonth(d)), iso(endOfMonth(d)));
    } else if (name === "ytd") {
      apply(iso(startOfYear(now)), iso(now));
    } else {
      const d = subMonths(now, 12);
      apply(iso(startOfYear(d)), iso(endOfYear(d)));
    }
  }

  function iso(d: Date) {
    return d.toISOString().slice(0, 10);
  }

  return (
    <Card>
      <CardContent className="flex items-center gap-3 flex-wrap p-5">
        <div className="space-y-1">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">From</Label>
          <Input type="date" value={from} onChange={(e) => apply(e.target.value, to)} className="w-44" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">To</Label>
          <Input type="date" value={to} onChange={(e) => apply(from, e.target.value)} className="w-44" />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Button variant="outline" size="sm" onClick={() => preset("thisMonth")}>This month</Button>
          <Button variant="outline" size="sm" onClick={() => preset("lastMonth")}>Last month</Button>
          <Button variant="outline" size="sm" onClick={() => preset("ytd")}>YTD</Button>
          <Button variant="outline" size="sm" onClick={() => preset("lastYear")}>Last year</Button>
        </div>
      </CardContent>
    </Card>
  );
}

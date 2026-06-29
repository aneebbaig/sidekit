"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HUSTLE_STATUSES, HUSTLE_STATUS_LABELS } from "@/lib/constants";

export function HustleFilters() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname() ?? "/hustles";

  function setParam(key: string, value: string | null) {
    const p = new URLSearchParams(sp?.toString() ?? "");
    if (!value) p.delete(key);
    else p.set(key, value);
    router.replace(`${pathname}?${p.toString()}`);
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="w-44">
        <Select
          value={sp?.get("status") ?? "ALL"}
          onValueChange={(v) => setParam("status", v === "ALL" ? null : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            {HUSTLE_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {HUSTLE_STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="w-44">
        <Select
          value={sp?.get("sort") ?? "newest"}
          onValueChange={(v) => setParam("sort", v === "newest" ? null : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="name">Name A-Z</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

import {
  endOfMonth,
  startOfMonth,
  subMonths,
  startOfDay,
  endOfDay,
} from "date-fns";

export function monthRange(date: Date) {
  return { from: startOfMonth(date), to: endOfMonth(date) };
}

export function previousMonthRange(date: Date) {
  const prev = subMonths(date, 1);
  return { from: startOfMonth(prev), to: endOfMonth(prev) };
}

export function lastNMonths(n: number, anchor: Date = new Date()) {
  const out: { from: Date; to: Date; label: string; key: string }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = subMonths(anchor, i);
    out.push({
      from: startOfMonth(d),
      to: endOfMonth(d),
      label: d.toLocaleDateString("en-US", { month: "short" }),
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
    });
  }
  return out;
}

export function dayRange(date: Date) {
  return { from: startOfDay(date), to: endOfDay(date) };
}

"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrencyValue } from "@/lib/currency";

interface SeriesDef {
  key: string;
  label: string;
  color: string;
}

interface Props {
  data: Array<Record<string, string | number>>;
  series: SeriesDef[];
  currency?: string;
  xKey?: string;
  height?: number;
}

export function GroupedBarChart({ data, series, currency = "PKR", xKey = "label", height = 260 }: Props) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey={xKey} stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis
            stroke="var(--color-muted-foreground)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => formatCurrencyValue(v, currency, { compact: true })}
          />
          <Tooltip
            contentStyle={{
              background: "var(--color-popover)",
              border: "1px solid var(--color-border)",
              borderRadius: 6,
              fontSize: 12,
              color: "var(--color-popover-foreground)",
            }}
            itemStyle={{ color: "var(--color-popover-foreground)" }}
            labelStyle={{ color: "var(--color-popover-foreground)" }}
            formatter={(value) => typeof value === 'number' ? formatCurrencyValue(value, currency) : String(value ?? '')}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {series.map((s) => (
            <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color} radius={[2, 2, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

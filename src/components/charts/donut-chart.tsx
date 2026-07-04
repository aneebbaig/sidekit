"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrencyValue } from "@/lib/currency";
import { SERIES_PALETTE } from "./palette";

const PALETTE = SERIES_PALETTE;

interface Props {
  data: Array<{ name: string; value: number }>;
  currency?: string;
  height?: number;
}

export function DonutChartCard({ data, currency = "PKR", height = 260 }: Props) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="55%"
            outerRadius="85%"
            paddingAngle={2}
            strokeWidth={0}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
            ))}
          </Pie>
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
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export const DONUT_PALETTE = PALETTE;

"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrencyValue } from "@/lib/currency";

const PALETTE = ["#c8a560", "#38bdf8", "#a78bfa", "#f97316", "#10b981", "#ec4899", "#f43f5e", "#22d3ee"];

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
            contentStyle={{ background: "#111113", border: "1px solid #27272a", borderRadius: 6, fontSize: 12 }}
            formatter={(value) => typeof value === 'number' ? formatCurrencyValue(value, currency) : String(value ?? '')}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export const DONUT_PALETTE = PALETTE;

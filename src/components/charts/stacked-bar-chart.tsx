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

interface StackedBarChartProps {
  data: Array<Record<string, string | number>>;
  series: SeriesDef[];
  currency?: string;
  xKey?: string;
  height?: number;
}

export function StackedBarChartCard({
  data,
  series,
  currency = "PKR",
  xKey = "label",
  height = 280,
}: StackedBarChartProps) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey={xKey} stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis
            stroke="#71717a"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => formatCurrencyValue(v, currency, { compact: true })}
          />
          <Tooltip
            contentStyle={{
              background: "#111113",
              border: "1px solid #27272a",
              borderRadius: 6,
              fontSize: 12,
            }}
            formatter={(value) => typeof value === 'number' ? formatCurrencyValue(value, currency) : String(value ?? '')}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {series.map((s) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.label}
              stackId="a"
              fill={s.color}
              radius={[2, 2, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

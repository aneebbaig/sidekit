import Link from "next/link";
import { Briefcase, DollarSign, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Currency } from "@/components/shared/currency";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { HustleStatusBadge } from "@/components/shared/status-badge";
import { StackedBarChartCard } from "@/components/charts/stacked-bar-chart";
import { colorAt } from "@/components/charts/palette";
import { analyticsService } from "@/services/analytics-service";
import { activityRepository } from "@/repositories/activity-repository";
import { formatRelative } from "@/lib/format";
import { Button } from "@/components/ui/button";

function pctDelta(curr: number, prev: number): number {
  if (prev === 0) return curr > 0 ? 100 : 0;
  return ((curr - prev) / Math.abs(prev)) * 100;
}

export default async function DashboardPage() {
  const data = await analyticsService.globalDashboard();
  const recent = await activityRepository.recent(10);

  const stacked = data.monthly.map((m) => {
    const row: Record<string, string | number> = { label: m.label };
    data.hustles.forEach((h) => {
      row[h.id] = m.perHustle[h.id] ?? 0;
    });
    return row;
  });

  const series = data.hustles.map((h, i) => ({
    key: h.id,
    label: h.name,
    color: colorAt(i),
  }));

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Operator dashboard"
        description="Cross-hustle financial and operational overview for the current month."
        action={
          <Button asChild>
            <Link href="/hustles">View hustles</Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Revenue"
          icon={<TrendingUp />}
          value={<Currency value={data.current.income} compact />}
          trend={{ value: pctDelta(data.current.income, data.prev.income), label: "vs last month" }}
        />
        <StatCard
          label="Expenses"
          icon={<TrendingDown />}
          value={<Currency value={data.current.expenses} compact />}
          trend={{
            value: pctDelta(data.current.expenses, data.prev.expenses),
            label: "vs last month",
            invert: true,
          }}
        />
        <StatCard
          label="Net Profit"
          icon={<DollarSign />}
          value={
            <Currency
              value={data.current.profit}
              compact
              tone={data.current.profit >= 0 ? "positive" : "negative"}
            />
          }
          subtext={`${data.current.margin.toFixed(1)}% margin`}
        />
        <StatCard
          label="Pending Orders"
          icon={<Wallet />}
          value={<span className="font-mono">{data.current.pendingOrders}</span>}
          subtext={`${data.current.orderCount} total this month`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly revenue by hustle</CardTitle>
          </CardHeader>
          <CardContent>
            {series.length === 0 ? (
              <EmptyState title="No hustles yet" description="Create a hustle to start tracking revenue." />
            ) : (
              <StackedBarChartCard data={stacked} series={series} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity yet.</p>
            ) : (
              <ul className="space-y-3">
                {recent.map((a) => (
                  <li key={a.id} className="flex items-start gap-2 text-sm">
                    <span
                      className="mt-1 h-5 w-5 rounded-full shrink-0"
                      style={{ backgroundColor: a.hustle.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="truncate">{a.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {a.hustle.name} • {formatRelative(a.createdAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold tracking-tight">Hustles</h2>
          <Badge variant="outline">{data.hustles.length} total</Badge>
        </div>
        {data.hustles.length === 0 ? (
          <EmptyState
            icon={<Briefcase />}
            title="No hustles yet"
            description="Create your first hustle to start managing it."
            action={
              <Button asChild>
                <Link href="/hustles">Create hustle</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.hustles.map((h) => (
              <Link key={h.id} href={`/hustles/${h.id}`} className="block group">
                <Card className="transition-colors group-hover:border-primary/40">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="h-8 w-8 rounded-full shrink-0"
                          style={{ backgroundColor: h.color }}
                        />
                        <p className="font-semibold truncate">{h.name}</p>
                      </div>
                      <HustleStatusBadge status={h.status} />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <Stat label="Revenue" value={<Currency value={h.monthlyRevenue} currency={h.currency} compact />} />
                      <Stat label="Pending" value={<span className="font-mono">{h.pendingOrders}</span>} />
                      <Stat label="Overdue" value={<span className="font-mono">{h.overdueTasks}</span>} />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  );
}

import Link from "next/link";
import {
  TriangleAlert,
  Calendar,
  CircleCheckBig,
  DollarSign,
  Package,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Currency } from "@/components/shared/currency";
import {
  OrderStatusBadge,
  TaskPriorityBadge,
  TaskStatusBadge,
} from "@/components/shared/status-badge";
import { GroupedBarChart } from "@/components/charts/grouped-bar-chart";
import { analyticsService } from "@/services/analytics-service";
import { hustleService } from "@/services/hustle-service";
import { orderRepository } from "@/repositories/order-repository";
import { taskRepository } from "@/repositories/task-repository";
import { inventoryRepository } from "@/repositories/inventory-repository";
import { monthRange, previousMonthRange } from "@/services/dates";
import { addDays, isAfter } from "date-fns";
import { formatDate } from "@/lib/format";
import { ORDER_STATUSES } from "@/lib/constants";

function pctDelta(curr: number, prev: number): number {
  if (prev === 0) return curr > 0 ? 100 : 0;
  return ((curr - prev) / Math.abs(prev)) * 100;
}

export default async function HustleOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const hustle = await hustleService.getById(id);
  if (!hustle) return null;

  const today = new Date();
  const cur = monthRange(today);
  const prev = previousMonthRange(today);

  const [totalsCur, totalsPrev, ordersData, ordersByStatus, tasks, lowStock, monthly] =
    await Promise.all([
      analyticsService.hustleTotals(id, cur.from, cur.to),
      analyticsService.hustleTotals(id, prev.from, prev.to),
      orderRepository.list(id),
      orderRepository.countByStatus(id),
      taskRepository.list(id),
      inventoryRepository.lowStock(id),
      analyticsService.revenueByMonth(id, 6, today),
    ]);

  const upcomingTasks = tasks
    .filter((t) => t.status === "TODO" || t.status === "IN_PROGRESS")
    .filter((t) => t.dueDate && isAfter(addDays(today, 7), t.dueDate))
    .slice(0, 6);
  const tasksDueThisWeek = tasks.filter(
    (t) =>
      (t.status === "TODO" || t.status === "IN_PROGRESS") &&
      t.dueDate &&
      isAfter(addDays(today, 7), t.dueDate),
  ).length;

  const recentOrders = ordersData.slice(0, 5);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader title="Overview" description={`${hustle.name} • This month performance.`} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Revenue"
          icon={<TrendingUp />}
          value={<Currency value={totalsCur.income} currency={hustle.currency} compact />}
          trend={{ value: pctDelta(totalsCur.income, totalsPrev.income), label: "vs last month" }}
        />
        <StatCard
          label="Expenses"
          icon={<TrendingDown />}
          value={<Currency value={totalsCur.expenses} currency={hustle.currency} compact />}
          trend={{
            value: pctDelta(totalsCur.expenses, totalsPrev.expenses),
            label: "vs last month",
            invert: true,
          }}
        />
        <StatCard
          label="Net Profit"
          icon={<DollarSign />}
          value={
            <Currency
              value={totalsCur.profit}
              currency={hustle.currency}
              compact
              tone={totalsCur.profit >= 0 ? "positive" : "negative"}
            />
          }
          subtext={`${totalsCur.margin.toFixed(1)}% margin`}
        />
        <StatCard
          label="Orders"
          icon={<Package />}
          value={<span className="font-mono">{totalsCur.ordersThisMonth}</span>}
          subtext={`${totalsCur.pendingOrders} pending`}
        />
        <StatCard
          label="Tasks This Week"
          icon={<Calendar />}
          value={<span className="font-mono">{tasksDueThisWeek}</span>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Income vs Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <GroupedBarChart
              data={monthly}
              currency={hustle.currency}
              series={[
                { key: "income", label: "Income", color: "var(--color-success)" },
                { key: "expenses", label: "Expenses", color: "var(--color-destructive)" },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Order pipeline</CardTitle>
            <Button asChild size="sm" variant="ghost">
              <Link href={`/hustles/${id}/orders`}>View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {ORDER_STATUSES.filter((s) => s !== "CANCELLED").map((s) => {
                const count = ordersByStatus[s] ?? 0;
                return (
                  <div key={s} className="flex items-center justify-between text-sm">
                    <OrderStatusBadge status={s} />
                    <span className="font-mono">{count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Recent orders</CardTitle>
            <Button asChild size="sm" variant="ghost">
              <Link href={`/hustles/${id}/orders`}>View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <EmptyState title="No orders yet" description="Orders will appear here once created." />
            ) : (
              <ul className="space-y-2">
                {recentOrders.map((o) => (
                  <li
                    key={o.id}
                    className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{o.orderNumber} • {o.customerName}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(o.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <OrderStatusBadge status={o.status} />
                      <Currency value={o.total} currency={hustle.currency} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Upcoming tasks</CardTitle>
            <Button asChild size="sm" variant="ghost">
              <Link href={`/hustles/${id}/tasks`}>View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {upcomingTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tasks due this week.</p>
            ) : (
              <ul className="space-y-2">
                {upcomingTasks.map((t) => (
                  <li key={t.id} className="flex items-start gap-2 text-sm">
                    {t.status === "DONE" ? (
                      <CircleCheckBig className="h-4 w-4 text-success mt-0.5" />
                    ) : (
                      <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="truncate">{t.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {t.dueDate ? <span>{formatDate(t.dueDate)}</span> : null}
                        <TaskPriorityBadge priority={t.priority} />
                        <TaskStatusBadge status={t.status} />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {lowStock.length > 0 ? (
        <Card className="border-warning/40">
          <CardHeader className="flex flex-row items-center gap-2">
            <TriangleAlert className="h-4 w-4 text-warning" />
            <CardTitle>Low stock alerts</CardTitle>
            <Badge variant="warning">{lowStock.length}</Badge>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {lowStock.map((i) => (
                <li
                  key={i.id}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
                >
                  <span className="truncate">{i.name}</span>
                  <span className="font-mono text-xs text-warning">
                    {i.quantity.toString()} {i.unit}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

export const dynamic = "force-dynamic";

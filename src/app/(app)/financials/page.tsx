import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/shared/stat-card";
import { Currency } from "@/components/shared/currency";
import { EmptyState } from "@/components/ui/empty-state";
import { DonutChartCard, DONUT_PALETTE } from "@/components/charts/donut-chart";
import { MultiLineChart } from "@/components/charts/line-chart";
import { hustleService } from "@/services/hustle-service";
import { analyticsService } from "@/services/analytics-service";
import { transactionService } from "@/services/transaction-service";
import { monthRange, lastNMonths } from "@/services/dates";
import { toNumber } from "@/lib/currency";
import { ConsolidatedTable } from "./consolidated-table";
import { ConsolidatedTransactionsTable } from "./consolidated-transactions-table";
import { DateRangeBar } from "./date-range-bar";
import { colorAt } from "@/components/charts/palette";

interface SearchParams {
  from?: string;
  to?: string;
}

export default async function ConsolidatedFinancialsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const today = new Date();
  const cur = monthRange(today);
  const from = sp.from ? new Date(sp.from) : cur.from;
  const to = sp.to ? new Date(sp.to) : cur.to;

  const hustles = await hustleService.list();
  const perHustleTotals = await Promise.all(
    hustles.map(async (h) => {
      const t = await analyticsService.hustleTotals(h.id, from, to);
      return { hustle: h, totals: t };
    }),
  );

  const totals = perHustleTotals.reduce(
    (acc, h) => {
      acc.income += h.totals.income;
      acc.expenses += h.totals.expenses;
      return acc;
    },
    { income: 0, expenses: 0 },
  );
  const profit = totals.income - totals.expenses;
  const margin = totals.income > 0 ? (profit / totals.income) * 100 : 0;

  const months = lastNMonths(6, today);
  const lineData = await Promise.all(
    months.map(async (m) => {
      const row: Record<string, string | number> = { label: m.label };
      for (const h of hustles) {
        const t = await analyticsService.hustleTotals(h.id, m.from, m.to);
        row[h.id] = t.profit;
      }
      return row;
    }),
  );
  const lineSeries = hustles.map((h, i) => ({
    key: h.id,
    label: h.name,
    color: colorAt(i),
  }));

  const expensesAll = await analyticsService.expenseBreakdown({ from, to });
  const allTransactions = await transactionService.list({ from, to });

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Consolidated financials"
        description="Combined view across all hustles."
      />

      <DateRangeBar from={from.toISOString().slice(0, 10)} to={to.toISOString().slice(0, 10)} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total income" value={<Currency value={totals.income} compact />} />
        <StatCard label="Total expenses" value={<Currency value={totals.expenses} compact />} />
        <StatCard
          label="Net profit"
          value={
            <Currency
              value={profit}
              compact
              tone={profit >= 0 ? "positive" : "negative"}
            />
          }
        />
        <StatCard label="Margin" value={<span className="font-mono">{margin.toFixed(1)}%</span>} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Per-hustle breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <ConsolidatedTable
            rows={perHustleTotals.map((h) => ({
              id: h.hustle.id,
              name: h.hustle.name,
              color: h.hustle.color,
              currency: h.hustle.currency,
              income: h.totals.income,
              expenses: h.totals.expenses,
              profit: h.totals.profit,
              margin: h.totals.margin,
              orderCount: h.totals.ordersThisMonth,
              outstanding: h.totals.outstanding,
            }))}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Net profit by hustle</CardTitle>
          </CardHeader>
          <CardContent>
            {hustles.length === 0 ? (
              <EmptyState title="No hustles" />
            ) : (
              <MultiLineChart data={lineData} series={lineSeries} />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Expenses by category</CardTitle>
          </CardHeader>
          <CardContent>
            {expensesAll.length === 0 ? (
              <EmptyState title="No expenses in range" />
            ) : (
              <>
                <DonutChartCard
                  data={expensesAll.map((b) => ({ name: b.category, value: b.total }))}
                />
                <ul className="mt-3 space-y-1 text-xs">
                  {expensesAll.slice(0, 6).map((b, i) => (
                    <li key={b.category} className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: DONUT_PALETTE[i % DONUT_PALETTE.length] }}
                      />
                      <span className="flex-1 truncate">{b.category}</span>
                      <Currency value={b.total} className="text-xs" />
                    </li>
                  ))}
                </ul>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <ConsolidatedTransactionsTable
            transactions={allTransactions.map((t) => ({
              id: t.id,
              hustleId: t.hustleId,
              hustleName: t.hustle?.name ?? "",
              hustleColor: t.hustle?.color ?? "#6366f1",
              currency: t.hustle?.currency ?? "PKR",
              type: t.type,
              category: t.category,
              description: t.description,
              amount: toNumber(t.amount),
              date: t.date.toISOString(),
            }))}
            range={{ from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) }}
          />
        </CardContent>
      </Card>
    </div>
  );
}

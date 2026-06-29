import { PageHeader } from "@/components/shared/page-header";
import { hustleService } from "@/services/hustle-service";
import { transactionService } from "@/services/transaction-service";
import { analyticsService } from "@/services/analytics-service";
import { orderRepository } from "@/repositories/order-repository";
import { monthRange } from "@/services/dates";
import { toNumber } from "@/lib/currency";
import { FinancialsBoard } from "./financials-board";
import { TransactionFormButton } from "./transaction-form-button";

interface SearchParams {
  from?: string;
  to?: string;
}

export default async function FinancialsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const hustle = await hustleService.getById(id);
  if (!hustle) return null;

  const today = new Date();
  const cur = monthRange(today);
  const from = sp.from ? new Date(sp.from) : cur.from;
  const to = sp.to ? new Date(sp.to) : cur.to;

  const [transactions, totals, monthly, breakdown, orders] = await Promise.all([
    transactionService.list({ hustleId: id, from, to }),
    analyticsService.hustleTotals(id, from, to),
    analyticsService.revenueByMonth(id, 6, today),
    analyticsService.expenseBreakdown({ hustleId: id, from, to }),
    orderRepository.list(id),
  ]);

  const outstanding = orders.reduce(
    (s, o) => s + Math.max(0, toNumber(o.total) - toNumber(o.amountPaid)),
    0,
  );

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Financials"
        description="Ledger and analytics for this hustle."
        action={<TransactionFormButton hustleId={id} />}
      />
      <FinancialsBoard
        hustleId={id}
        currency={hustle.currency}
        from={from.toISOString().slice(0, 10)}
        to={to.toISOString().slice(0, 10)}
        totals={{ ...totals, outstanding }}
        monthly={monthly}
        breakdown={breakdown}
        transactions={transactions.map((t) => ({
          id: t.id,
          type: t.type,
          category: t.category,
          description: t.description,
          amount: toNumber(t.amount),
          date: t.date.toISOString(),
          reference: t.reference,
        }))}
      />
    </div>
  );
}

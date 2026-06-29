import type { OrderStatus, TransactionType } from "@/generated/prisma/client";
import { toNumber } from "@/lib/currency";
import { lastNMonths, monthRange, previousMonthRange } from "./dates";
import { transactionRepository } from "@/repositories/transaction-repository";
import { analyticsRepository } from "@/repositories/analytics-repository";

interface TxRow {
  type: TransactionType;
  amount: unknown;
}

interface OrderRow {
  total: unknown;
  amountPaid?: unknown;
  status: OrderStatus;
  paymentStatus?: unknown;
}

export interface KpiTotals {
  income: number;
  expenses: number;
  profit: number;
  margin: number;
  outstanding: number;
  averageOrder: number;
  pendingOrders: number;
  ordersThisMonth: number;
}

function sumIncome(txs: TxRow[]): number {
  return txs.filter((t) => t.type === "INCOME").reduce((s, t) => s + toNumber(t.amount), 0);
}

function sumExpenses(txs: TxRow[]): number {
  return txs.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + toNumber(t.amount), 0);
}

function isPending(o: OrderRow): boolean {
  return o.status !== "DELIVERED" && o.status !== "CANCELLED";
}

export const analyticsService = {
  async hustleTotals(hustleId: string, from: Date, to: Date): Promise<KpiTotals> {
    const [txs, orders] = await Promise.all([
      transactionRepository.list({ hustleId, from, to }),
      analyticsRepository.ordersForPeriod({ hustleId, from, to }),
    ]);

    const income = sumIncome(txs);
    const expenses = sumExpenses(txs);
    const profit = income - expenses;
    const margin = income > 0 ? (profit / income) * 100 : 0;
    const orderTotal = orders.reduce((s: number, o: OrderRow) => s + toNumber(o.total), 0);
    const orderPaid = orders.reduce((s: number, o: OrderRow) => s + toNumber(o.amountPaid), 0);
    const outstanding = Math.max(0, orderTotal - orderPaid);
    const averageOrder = orders.length > 0 ? orderTotal / orders.length : 0;
    const pendingOrders = orders.filter((o: OrderRow) => isPending(o)).length;

    return {
      income,
      expenses,
      profit,
      margin,
      outstanding,
      averageOrder,
      pendingOrders,
      ordersThisMonth: orders.length,
    };
  },

  async globalTotals(from: Date, to: Date) {
    const [txs, orders] = await Promise.all([
      transactionRepository.list({ from, to }),
      analyticsRepository.ordersForPeriod({ from, to }),
    ]);
    const income = sumIncome(txs);
    const expenses = sumExpenses(txs);
    const profit = income - expenses;
    const margin = income > 0 ? (profit / income) * 100 : 0;
    const pendingOrders = orders.filter((o: OrderRow) => isPending(o)).length;
    return { income, expenses, profit, margin, pendingOrders, orderCount: orders.length };
  },

  async globalDashboard(today: Date = new Date()) {
    const thisMonth = monthRange(today);
    const lastMonth = previousMonthRange(today);
    const [current, prev, hustles] = await Promise.all([
      this.globalTotals(thisMonth.from, thisMonth.to),
      this.globalTotals(lastMonth.from, lastMonth.to),
      analyticsRepository.hustlesWithMonthlyData(thisMonth.from, thisMonth.to, today),
    ]);

    const months = lastNMonths(6, today);
    const monthly = await Promise.all(
      months.map(async (m) => {
        const rows = await analyticsRepository.revenueGroupedByHustle(m.from, m.to);
        const perHustle: Record<string, number> = {};
        rows.forEach((r: { hustleId: string; _sum: { amount: unknown } }) => {
          perHustle[r.hustleId] = toNumber(r._sum.amount ?? 0);
        });
        return { label: m.label, key: m.key, perHustle };
      }),
    );

    interface HustleAgg {
      id: string;
      name: string;
      color: string;
      status: import("@/generated/prisma/client").HustleStatus;
      currency: string;
      orders: OrderRow[];
      tasks: { id: string }[];
      transactions: { amount: unknown }[];
    }

    return {
      current,
      prev,
      hustles: (hustles as unknown as HustleAgg[]).map((h) => {
        const monthlyRevenue = h.transactions.reduce(
          (s: number, t: { amount: unknown }) => s + toNumber(t.amount),
          0,
        );
        const pendingOrders = h.orders.filter((o) => isPending(o)).length;
        return {
          id: h.id,
          name: h.name,
          color: h.color,
          status: h.status,
          currency: h.currency,
          monthlyRevenue,
          pendingOrders,
          overdueTasks: h.tasks.length,
        };
      }),
      monthly,
    };
  },

  async revenueByMonth(hustleId: string, months: number = 6, anchor: Date = new Date()) {
    const ranges = lastNMonths(months, anchor);
    return Promise.all(
      ranges.map(async (m) => {
        const txs = await transactionRepository.list({ hustleId, from: m.from, to: m.to });
        const income = sumIncome(txs);
        const expenses = sumExpenses(txs);
        return { label: m.label, key: m.key, income, expenses, profit: income - expenses };
      }),
    );
  },

  async expenseBreakdown(filters: { hustleId?: string; from?: Date; to?: Date }) {
    const rows = await analyticsRepository.expensesGroupedByCategory(filters);
    return rows.map((r: { category: string; _sum: { amount: unknown } }) => ({
      category: r.category,
      total: toNumber(r._sum.amount ?? 0),
    }));
  },
};

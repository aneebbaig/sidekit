import type { TaskStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export const analyticsRepository = {
  async ordersForPeriod(args: { hustleId?: string; from: Date; to: Date }) {
    return prisma.order.findMany({
      where: {
        hustleId: args.hustleId,
        createdAt: { gte: args.from, lte: args.to },
      },
      select: { total: true, amountPaid: true, status: true, paymentStatus: true },
    });
  },

  async hustlesWithMonthlyData(from: Date, to: Date, today: Date) {
    return prisma.hustle.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        orders: {
          where: { createdAt: { gte: from, lte: to } },
          select: { total: true, status: true },
        },
        tasks: {
          where: {
            status: { in: ["TODO", "IN_PROGRESS"] as TaskStatus[] },
            dueDate: { lt: today },
          },
          select: { id: true },
        },
        transactions: {
          where: { date: { gte: from, lte: to }, type: "INCOME" },
          select: { amount: true },
        },
      },
    });
  },

  async revenueGroupedByHustle(from: Date, to: Date) {
    return prisma.transaction.groupBy({
      by: ["hustleId"],
      where: { type: "INCOME", date: { gte: from, lte: to } },
      _sum: { amount: true },
    });
  },

  async expensesGroupedByCategory(args: { hustleId?: string; from?: Date; to?: Date }) {
    return prisma.transaction.groupBy({
      by: ["category"],
      where: {
        type: "EXPENSE",
        hustleId: args.hustleId,
        date: { gte: args.from, lte: args.to },
      },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
    });
  },
};

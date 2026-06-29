import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export const transactionRepository = {
  async list(filters: { hustleId?: string; from?: Date; to?: Date }) {
    return prisma.transaction.findMany({
      where: {
        hustleId: filters.hustleId,
        date: {
          gte: filters.from,
          lte: filters.to,
        },
      },
      include: { hustle: { select: { id: true, name: true, currency: true, color: true } } },
      orderBy: { date: "desc" },
    });
  },
  async create(data: Prisma.TransactionCreateInput) {
    return prisma.transaction.create({ data });
  },
  async update(id: string, data: Prisma.TransactionUpdateInput) {
    return prisma.transaction.update({ where: { id }, data });
  },
  async delete(id: string) {
    return prisma.transaction.delete({ where: { id } });
  },
};

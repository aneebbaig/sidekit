import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export const costRepository = {
  async list(hustleId: string) {
    return prisma.costItem.findMany({
      where: { hustleId },
      include: { supplier: true },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });
  },
  async create(data: Prisma.CostItemCreateInput) {
    return prisma.costItem.create({ data });
  },
  async update(id: string, data: Prisma.CostItemUpdateInput) {
    return prisma.costItem.update({ where: { id }, data });
  },
  async delete(id: string) {
    return prisma.costItem.delete({ where: { id } });
  },
};

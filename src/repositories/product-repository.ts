import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export const productRepository = {
  async list(hustleId: string) {
    return prisma.product.findMany({
      where: { hustleId },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
  },
  async listWithCounts(hustleId: string) {
    return prisma.product.findMany({
      where: { hustleId },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      include: {
        _count: { select: { costItems: true, inspirations: true } },
        inspirations: { take: 1, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }], select: { imageUrl: true } },
      },
    });
  },
  async reorder(updates: { id: string; sortOrder: number }[]) {
    await prisma.$transaction(
      updates.map(({ id, sortOrder }) =>
        prisma.product.update({ where: { id }, data: { sortOrder } })
      )
    );
  },
  async create(data: Prisma.ProductCreateInput) {
    return prisma.product.create({ data });
  },
  async update(id: string, data: Prisma.ProductUpdateInput) {
    return prisma.product.update({ where: { id }, data });
  },
  async delete(id: string) {
    return prisma.product.delete({ where: { id } });
  },
};

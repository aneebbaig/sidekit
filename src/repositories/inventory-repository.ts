import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export const inventoryRepository = {
  async list(hustleId: string) {
    return prisma.inventoryItem.findMany({
      where: { hustleId },
      orderBy: { name: "asc" },
    });
  },
  async findById(id: string) {
    return prisma.inventoryItem.findUnique({ where: { id } });
  },
  async create(data: Prisma.InventoryItemCreateInput) {
    return prisma.inventoryItem.create({ data });
  },
  async update(id: string, data: Prisma.InventoryItemUpdateInput) {
    return prisma.inventoryItem.update({ where: { id }, data });
  },
  async delete(id: string) {
    return prisma.inventoryItem.delete({ where: { id } });
  },
  async adjust(itemId: string, delta: number, reason: string) {
    return prisma.$transaction([
      prisma.inventoryItem.update({
        where: { id: itemId },
        data: { quantity: { increment: delta } },
      }),
      prisma.inventoryAdjustment.create({
        data: { itemId, delta, reason },
      }),
    ]);
  },
  async lowStock(hustleId: string) {
    const items = await prisma.inventoryItem.findMany({ where: { hustleId } });
    return items.filter((i) => i.quantity.lessThanOrEqualTo(i.reorderAt));
  },
};

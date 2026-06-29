import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export const customerRepository = {
  async list(hustleId: string) {
    return prisma.customer.findMany({
      where: { hustleId },
      orderBy: { name: "asc" },
      include: { _count: { select: { orders: true } } },
    });
  },
  async findById(id: string) {
    return prisma.customer.findUnique({
      where: { id },
      include: { orders: { orderBy: { createdAt: "desc" } } },
    });
  },
  async create(data: Prisma.CustomerCreateInput) {
    return prisma.customer.create({ data });
  },
  async update(id: string, data: Prisma.CustomerUpdateInput) {
    return prisma.customer.update({ where: { id }, data });
  },
  async delete(id: string) {
    return prisma.customer.delete({ where: { id } });
  },
};

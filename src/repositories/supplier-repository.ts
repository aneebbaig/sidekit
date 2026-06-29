import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export const supplierRepository = {
  async list(hustleId: string) {
    return prisma.supplier.findMany({
      where: { hustleId },
      orderBy: [{ preferred: "desc" }, { name: "asc" }],
    });
  },
  async findById(id: string) {
    return prisma.supplier.findUnique({
      where: { id },
      include: { costItems: true },
    });
  },
  async create(data: Prisma.SupplierCreateInput) {
    return prisma.supplier.create({ data });
  },
  async update(id: string, data: Prisma.SupplierUpdateInput) {
    return prisma.supplier.update({ where: { id }, data });
  },
  async delete(id: string) {
    return prisma.supplier.delete({ where: { id } });
  },
};

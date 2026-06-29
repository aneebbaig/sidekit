import { prisma } from "@/lib/prisma";

export const productInspirationRepository = {
  async list(productId: string) {
    return prisma.productInspiration.findMany({
      where: { productId },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
  },
  async create(productId: string, data: { imageUrl: string; title: string | null; notes: string | null }) {
    return prisma.productInspiration.create({
      data: { product: { connect: { id: productId } }, ...data },
    });
  },
  async delete(id: string) {
    return prisma.productInspiration.delete({ where: { id } });
  },
};

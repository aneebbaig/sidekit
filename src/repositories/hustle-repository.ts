import type { HustleStatus, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export const hustleRepository = {
  async list() {
    return prisma.hustle.findMany({
      orderBy: { createdAt: "desc" },
    });
  },
  async findById(id: string) {
    return prisma.hustle.findUnique({ where: { id } });
  },
  async create(data: Prisma.HustleCreateInput) {
    return prisma.hustle.create({ data });
  },
  async update(id: string, data: Prisma.HustleUpdateInput) {
    return prisma.hustle.update({ where: { id }, data });
  },
  async updateStatus(id: string, status: HustleStatus) {
    return prisma.hustle.update({ where: { id }, data: { status } });
  },
  async delete(id: string) {
    return prisma.hustle.delete({ where: { id } });
  },
  async findByApiKey(key: string) {
    return prisma.hustle.findUnique({ where: { apiKey: key } });
  },
  async setApiKey(id: string, key: string) {
    return prisma.hustle.update({ where: { id }, data: { apiKey: key } });
  },
};

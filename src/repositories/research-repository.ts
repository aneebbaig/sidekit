import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export const researchRepository = {
  async list(hustleId: string) {
    return prisma.researchNote.findMany({
      where: { hustleId },
      orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
    });
  },
  async create(data: Prisma.ResearchNoteCreateInput) {
    return prisma.researchNote.create({ data });
  },
  async update(id: string, data: Prisma.ResearchNoteUpdateInput) {
    return prisma.researchNote.update({ where: { id }, data });
  },
  async delete(id: string) {
    return prisma.researchNote.delete({ where: { id } });
  },
  async togglePin(id: string, pinned: boolean) {
    return prisma.researchNote.update({ where: { id }, data: { pinned } });
  },
};

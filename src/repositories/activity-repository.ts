import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export const activityRepository = {
  async log(data: Prisma.ActivityLogUncheckedCreateInput) {
    return prisma.activityLog.create({ data });
  },
  async recent(limit = 10, hustleId?: string) {
    return prisma.activityLog.findMany({
      where: hustleId ? { hustleId } : {},
      include: { hustle: { select: { id: true, name: true, color: true } } },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  },
};

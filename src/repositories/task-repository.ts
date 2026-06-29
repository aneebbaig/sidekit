import type { Prisma, TaskStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export const taskRepository = {
  async list(hustleId: string) {
    return prisma.task.findMany({
      where: { hustleId },
      orderBy: [{ status: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
    });
  },
  async findById(id: string) {
    return prisma.task.findUnique({ where: { id } });
  },
  async create(data: Prisma.TaskCreateInput) {
    return prisma.task.create({ data });
  },
  async createMany(data: Prisma.TaskCreateManyInput[]) {
    return prisma.task.createMany({ data });
  },
  async update(id: string, data: Prisma.TaskUpdateInput) {
    return prisma.task.update({ where: { id }, data });
  },
  async setStatus(id: string, status: TaskStatus) {
    return prisma.task.update({ where: { id }, data: { status } });
  },
  async delete(id: string) {
    return prisma.task.delete({ where: { id } });
  },
};

import { prisma } from "@/lib/prisma";

export const userRepository = {
  async count(): Promise<number> {
    return prisma.user.count();
  },
  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },
  async create(data: { email: string; name: string; passwordHash: string }) {
    return prisma.user.create({ data });
  },
  async updatePassword(id: string, passwordHash: string) {
    return prisma.user.update({ where: { id }, data: { passwordHash } });
  },
};

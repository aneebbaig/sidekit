import { prisma } from "@/lib/prisma";
import type { AiProvider } from "@/generated/prisma/client";

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
  async updateAiSettings(
    id: string,
    data: {
      aiProvider: AiProvider;
      aiApiKeyEncrypted: string;
      aiModel: string | null;
      aiBaseUrl: string | null;
    },
  ) {
    return prisma.user.update({ where: { id }, data });
  },
};

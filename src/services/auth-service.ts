import { userRepository } from "@/repositories/user-repository";

// Auth credentials are handled by better-auth (see lib/auth.ts + auth-actions).
// This service keeps only the app-level reads the UI needs.
export const authService = {
  async needsSetup(): Promise<boolean> {
    const count = await userRepository.count();
    return count === 0;
  },

  async getCurrentUser(userId: string) {
    return userRepository.findById(userId);
  },
};

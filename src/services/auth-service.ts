import bcrypt from "bcryptjs";
import { userRepository } from "@/repositories/user-repository";
import {
  changePasswordSchema,
  setupSchema,
  type ChangePasswordInput,
  type SetupInput,
} from "@/schemas/auth";
import { fail, ok, type ActionResult } from "@/lib/result";
import { logError, toErrorMessage } from "@/lib/errors";

const BCRYPT_ROUNDS = 12;

export const authService = {
  async setupOwner(input: SetupInput): Promise<ActionResult<{ id: string }>> {
    try {
      const parsed = setupSchema.parse(input);
      const count = await userRepository.count();
      if (count > 0) return fail("Setup has already been completed.");
      const passwordHash = await bcrypt.hash(parsed.password, BCRYPT_ROUNDS);
      const user = await userRepository.create({
        email: parsed.email.toLowerCase(),
        name: parsed.name,
        passwordHash,
      });
      return ok({ id: user.id });
    } catch (err) {
      logError("auth-service.setupOwner", err);
      return fail(toErrorMessage(err));
    }
  },

  async needsSetup(): Promise<boolean> {
    const count = await userRepository.count();
    return count === 0;
  },

  async changePassword(
    userId: string,
    input: ChangePasswordInput,
  ): Promise<ActionResult<{ id: string }>> {
    try {
      const parsed = changePasswordSchema.parse(input);
      const user = await userRepository.findById(userId);
      if (!user) return fail("User not found.");
      const valid = await bcrypt.compare(parsed.currentPassword, user.passwordHash);
      if (!valid) return fail("Current password is incorrect.");
      const passwordHash = await bcrypt.hash(parsed.newPassword, BCRYPT_ROUNDS);
      await userRepository.updatePassword(userId, passwordHash);
      return ok({ id: userId });
    } catch (err) {
      logError("auth-service.changePassword", err);
      return fail(toErrorMessage(err));
    }
  },

  async getCurrentUser(userId: string) {
    return userRepository.findById(userId);
  },
};

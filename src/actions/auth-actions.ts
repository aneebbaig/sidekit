"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { authService } from "@/services/auth-service";
import { fail, ok, type ActionResult } from "@/lib/result";
import { logError, toErrorMessage } from "@/lib/errors";
import type { ChangePasswordInput, LoginInput, SetupInput } from "@/schemas/auth";
import { requireUser } from "./_helpers";

export async function setupOwnerAction(input: SetupInput): Promise<ActionResult<{ id: string }>> {
  return authService.setupOwner(input);
}

export async function loginAction(input: LoginInput): Promise<ActionResult<null>> {
  try {
    await signIn("credentials", {
      email: input.email,
      password: input.password,
      redirect: false,
    });
    return ok(null);
  } catch (err) {
    if (err instanceof AuthError) {
      if (err.type === "CredentialsSignin") return fail("Invalid email or password.");
      return fail("Unable to sign in.");
    }
    logError("auth-actions.loginAction", err);
    return fail(toErrorMessage(err));
  }
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: "/login" });
}

export async function changePasswordAction(
  input: ChangePasswordInput,
): Promise<ActionResult<{ id: string }>> {
  const userId = await requireUser();
  if (!userId) return fail("Not authenticated.");
  return authService.changePassword(userId, input);
}

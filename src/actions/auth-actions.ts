"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ok, fail, type ActionResult } from "@/lib/result";
import { logError, toErrorMessage } from "@/lib/errors";
import type { ChangePasswordInput, LoginInput, SetupInput } from "@/schemas/auth";
import { requireUser } from "./_helpers";

// Owner setup (first user only — enforced by the databaseHooks in lib/auth.ts).
// signUpEmail also signs the new user in, so no separate login call is needed.
export async function setupOwnerAction(input: SetupInput): Promise<ActionResult<{ id: string }>> {
  try {
    const res = await auth.api.signUpEmail({
      body: { email: input.email.toLowerCase(), password: input.password, name: input.name },
      headers: await headers(),
    });
    return ok({ id: res.user.id });
  } catch (err) {
    logError("auth-actions.setupOwnerAction", err);
    return fail(toErrorMessage(err));
  }
}

// Password sign-in. If the account has 2FA on, better-auth returns a
// twoFactorRedirect instead of a session; the form then routes to /login/2fa.
export async function loginAction(input: LoginInput): Promise<ActionResult<{ totpRequired?: boolean }>> {
  try {
    const res = await auth.api.signInEmail({
      body: { email: input.email.toLowerCase(), password: input.password },
      headers: await headers(),
    });
    if ((res as { twoFactorRedirect?: boolean })?.twoFactorRedirect) {
      return ok({ totpRequired: true });
    }
    return ok({});
  } catch (err) {
    logError("auth-actions.loginAction", err);
    return fail("Invalid email or password.");
  }
}

export async function logoutAction(): Promise<void> {
  await auth.api.signOut({ headers: await headers() });
  redirect("/login");
}

// Requires the current password (better-auth enforces it) and revokes other
// sessions so a changed password logs out everywhere.
export async function changePasswordAction(
  input: ChangePasswordInput,
): Promise<ActionResult<{ id: string }>> {
  const userId = await requireUser();
  if (!userId) return fail("Not authenticated.");
  try {
    await auth.api.changePassword({
      body: {
        currentPassword: input.currentPassword,
        newPassword: input.newPassword,
        revokeOtherSessions: true,
      },
      headers: await headers(),
    });
    return ok({ id: userId });
  } catch (err) {
    logError("auth-actions.changePasswordAction", err);
    return fail("Current password is incorrect.");
  }
}

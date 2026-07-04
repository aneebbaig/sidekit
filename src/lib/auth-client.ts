"use client";

import { createAuthClient } from "better-auth/react";
import { twoFactorClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [
    twoFactorClient({
      onTwoFactorRedirect() {
        // Password accepted, 2FA required -> go collect the code.
        window.location.href = "/login/2fa";
      },
    }),
  ],
});

export const { signIn, signOut, useSession, twoFactor } = authClient;

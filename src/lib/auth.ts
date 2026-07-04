import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { twoFactor, bearer } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { APIError } from "better-auth/api";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

/**
 * better-auth is the single auth system (see app-starter-skills standard).
 * - emailAndPassword: no social providers; single-owner app.
 * - twoFactor: TOTP + single-use backup codes; secrets encrypted at rest by
 *   better-auth using the app secret.
 * - bearer: token auth for native (Flutter) clients hitting the same backend.
 * - rateLimit: built-in brute-force protection, no hand-rolled lockout.
 * - databaseHooks: enforce SINGLE OWNER — the first sign-up is allowed, every
 *   later one is rejected even if it hits the API directly (no open registration).
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  secret: env.BETTER_AUTH_SECRET ?? env.AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const existing = await prisma.user.count();
          if (existing > 0) {
            throw new APIError("BAD_REQUEST", {
              message: "Registration is closed. This app has a single owner.",
            });
          }
          return { data: user };
        },
      },
    },
  },
  plugins: [twoFactor(), bearer(), nextCookies()],
});

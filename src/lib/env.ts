import { z } from "zod";

/**
 * Centralised, validated environment access. Fail fast at boot with a clear
 * message instead of leaking `undefined` (or non-null `!` assertions) into the
 * data and auth layers at runtime.
 */
const envSchema = z.object({
  DATABASE_URL: z.url("DATABASE_URL must be a valid Postgres connection string"),
  DIRECT_URL: z.url().optional(),
  AUTH_SECRET: z.string().min(1, "AUTH_SECRET is required (generate with: openssl rand -base64 32)").optional(),
  AUTH_TRUST_HOST: z
    .string()
    .optional()
    .transform((v) => v === "true"),
  // better-auth. BETTER_AUTH_SECRET falls back to AUTH_SECRET so a single secret
  // works; BETTER_AUTH_URL is the app's own origin (used for cookies/callbacks).
  BETTER_AUTH_SECRET: z.string().min(1).optional(),
  BETTER_AUTH_URL: z.url().optional(),
  AI_ENCRYPTION_KEY: z.string().min(1).optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

function loadEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Invalid environment variables:\n${issues}`);
  }
  return parsed.data;
}

export const env = loadEnv();

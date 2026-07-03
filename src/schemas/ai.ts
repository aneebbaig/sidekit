import { z } from "zod";

export const AI_PROVIDERS = ["OPENAI", "GEMINI", "OPENAI_COMPATIBLE"] as const;

export const AI_PROVIDER_LABELS: Record<(typeof AI_PROVIDERS)[number], string> = {
  OPENAI: "OpenAI",
  GEMINI: "Google Gemini",
  OPENAI_COMPATIBLE: "OpenAI-compatible (custom)",
};

export const aiSettingsSchema = z.object({
  provider: z.enum(AI_PROVIDERS),
  // Empty string means "keep the currently stored key" on update.
  apiKey: z.string().max(500).optional().or(z.literal("")),
  model: z.string().max(100).optional().or(z.literal("")),
  baseUrl: z
    .string()
    .max(300)
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || /^https?:\/\/.+/i.test(v), "Enter a valid base URL."),
});

export type AiSettingsInput = z.infer<typeof aiSettingsSchema>;

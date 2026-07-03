import { z, type ZodType } from "zod";
import type { LanguageModel } from "ai";
import type { AiProvider } from "@/generated/prisma/client";
import { userRepository } from "@/repositories/user-repository";
import { aiSettingsSchema, type AiSettingsInput } from "@/schemas/ai";
import { hustleDraftSchema, type HustleDraft } from "@/schemas/ai-draft";
import { encryptSecret } from "@/lib/ai/crypto";
import { getAiModel } from "@/lib/ai/client";
import { generateStructured } from "@/lib/ai/generate";
import {
  extractionSystemPrompt,
  tableDraftSystemPrompt,
  hustleDraftSystemPrompt,
} from "@/lib/ai/prompts";
import { fail, ok, type ActionResult } from "@/lib/result";
import { logError, toErrorMessage } from "@/lib/errors";

const pingSchema = z.object({ ok: z.boolean() });

const MAX_EXTRACTION_TEXT_LENGTH = 6000;
const MAX_DRAFT_ROWS = 20;

async function getModelForUser(userId: string): Promise<ActionResult<LanguageModel>> {
  const user = await userRepository.findById(userId);
  if (!user) return fail("User not found.");
  return getAiModel(user);
}

interface ResolvedAiSettings {
  aiProvider: AiProvider;
  aiApiKeyEncrypted: string;
  aiModel: string | null;
  aiBaseUrl: string | null;
}

function resolveSettings(
  parsed: AiSettingsInput,
  current: { aiProvider: string | null; aiApiKeyEncrypted: string | null },
): ActionResult<ResolvedAiSettings> {
  if (parsed.provider !== current.aiProvider && !parsed.apiKey) {
    return fail("Enter your API key for the newly selected provider.");
  }
  const aiApiKeyEncrypted = parsed.apiKey ? encryptSecret(parsed.apiKey) : current.aiApiKeyEncrypted;
  if (!aiApiKeyEncrypted) return fail("An API key is required.");
  return ok({
    aiProvider: parsed.provider,
    aiApiKeyEncrypted,
    aiModel: parsed.model || null,
    aiBaseUrl: parsed.baseUrl || null,
  });
}

export const aiService = {
  async updateSettings(userId: string, input: AiSettingsInput): Promise<ActionResult<null>> {
    try {
      const parsed = aiSettingsSchema.parse(input);
      const current = await userRepository.findById(userId);
      if (!current) return fail("User not found.");

      const resolved = resolveSettings(parsed, current);
      if (!resolved.success) return resolved;

      await userRepository.updateAiSettings(userId, resolved.data);
      return ok(null);
    } catch (err) {
      logError("ai-service.updateSettings", err);
      return fail(toErrorMessage(err));
    }
  },

  async testConnection(userId: string, input: AiSettingsInput): Promise<ActionResult<null>> {
    try {
      const parsed = aiSettingsSchema.parse(input);
      const current = await userRepository.findById(userId);
      if (!current) return fail("User not found.");

      const resolved = resolveSettings(parsed, current);
      if (!resolved.success) return resolved;

      const modelResult = getAiModel(resolved.data);
      if (!modelResult.success) return modelResult;

      const res = await generateStructured({
        model: modelResult.data,
        schema: pingSchema,
        system: 'Respond with exactly the JSON object {"ok": true} and nothing else.',
        prompt: "ping",
      });
      if (!res.success) return res;
      return ok(null);
    } catch (err) {
      logError("ai-service.testConnection", err);
      return fail(toErrorMessage(err));
    }
  },

  async extractFromText<T>(
    userId: string,
    entitySchema: ZodType<T>,
    entityLabel: string,
    rawText: string,
  ): Promise<ActionResult<T[]>> {
    const modelResult = await getModelForUser(userId);
    if (!modelResult.success) return modelResult;

    const trimmed = rawText.trim().slice(0, MAX_EXTRACTION_TEXT_LENGTH);
    if (!trimmed) return fail("Paste some text to extract from first.");

    const wrapped = z.object({ items: z.array(entitySchema).max(10) });
    const res = await generateStructured({
      model: modelResult.data,
      schema: wrapped,
      system: extractionSystemPrompt(entityLabel),
      prompt: trimmed,
    });
    if (!res.success) return res;
    if (res.data.items.length === 0) return fail("AI couldn't find any records in that text.");
    return ok(res.data.items);
  },

  async generateTableDraft<T>(
    userId: string,
    params: {
      entitySchema: ZodType<T>;
      entityLabel: string;
      hustle: { name: string; description: string | null; currency: string; status: string };
      existingRows: unknown[];
      count: number;
      instructions?: string;
    },
  ): Promise<ActionResult<T[]>> {
    const modelResult = await getModelForUser(userId);
    if (!modelResult.success) return modelResult;

    const count = Math.min(Math.max(params.count, 1), MAX_DRAFT_ROWS);
    const wrapped = z.object({ items: z.array(params.entitySchema).max(count) });
    const res = await generateStructured({
      model: modelResult.data,
      schema: wrapped,
      system: tableDraftSystemPrompt({
        entityLabel: params.entityLabel,
        hustle: params.hustle,
        existingRows: params.existingRows,
        instructions: params.instructions,
      }),
      prompt: `Generate ${count} ${params.entityLabel} record(s) for this hustle.`,
    });
    if (!res.success) return res;
    if (res.data.items.length === 0) return fail("AI didn't return any records - try again or add more instructions.");
    return ok(res.data.items);
  },

  async generateHustleDraft(userId: string, prompt: string): Promise<ActionResult<HustleDraft>> {
    const modelResult = await getModelForUser(userId);
    if (!modelResult.success) return modelResult;

    const trimmed = prompt.trim().slice(0, 500);
    if (!trimmed) return fail("Describe the business idea first.");

    return generateStructured({
      model: modelResult.data,
      schema: hustleDraftSchema,
      system: hustleDraftSystemPrompt(),
      prompt: trimmed,
    });
  },
};

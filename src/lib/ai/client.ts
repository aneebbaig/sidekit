import type { LanguageModel } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import type { AiProvider } from "@/generated/prisma/client";
import { decryptSecret } from "./crypto";
import { fail, ok, type ActionResult } from "@/lib/result";

const DEFAULT_MODEL: Record<AiProvider, string | null> = {
  OPENAI: "gpt-4o-mini",
  GEMINI: "gemini-2.5-flash",
  OPENAI_COMPATIBLE: null,
};

export interface AiUserSettings {
  aiProvider: AiProvider | null;
  aiApiKeyEncrypted: string | null;
  aiModel: string | null;
  aiBaseUrl: string | null;
}

export function getAiModel(user: AiUserSettings): ActionResult<LanguageModel> {
  if (!user.aiProvider || !user.aiApiKeyEncrypted) {
    return fail("Add an AI provider key in Account settings first.");
  }

  let apiKey: string;
  try {
    apiKey = decryptSecret(user.aiApiKeyEncrypted);
  } catch {
    return fail("Couldn't read your stored AI key. Re-enter it in Account settings.");
  }

  const modelId = user.aiModel?.trim() || DEFAULT_MODEL[user.aiProvider];
  if (!modelId) {
    return fail("Set a model name for your OpenAI-compatible provider in Account settings.");
  }

  switch (user.aiProvider) {
    case "OPENAI":
      return ok(createOpenAI({ apiKey })(modelId));
    case "GEMINI":
      return ok(createGoogleGenerativeAI({ apiKey })(modelId));
    case "OPENAI_COMPATIBLE": {
      if (!user.aiBaseUrl) {
        return fail("Set a base URL for your OpenAI-compatible provider in Account settings.");
      }
      return ok(
        createOpenAICompatible({ name: "custom", apiKey, baseURL: user.aiBaseUrl })(modelId),
      );
    }
    default:
      return fail("Unknown AI provider.");
  }
}

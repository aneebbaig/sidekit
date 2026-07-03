import { generateObject, NoObjectGeneratedError, type LanguageModel } from "ai";
import type { ZodType } from "zod";
import { fail, ok, type ActionResult } from "@/lib/result";
import { logError } from "@/lib/errors";

interface GenerateStructuredInput<T> {
  model: LanguageModel;
  schema: ZodType<T>;
  system: string;
  prompt: string;
}

export async function generateStructured<T>({
  model,
  schema,
  system,
  prompt,
}: GenerateStructuredInput<T>): Promise<ActionResult<T>> {
  try {
    const result = await generateObject({ model, schema, system, prompt });
    return ok(result.object);
  } catch (err) {
    logError("ai.generateStructured", err);
    if (NoObjectGeneratedError.isInstance(err)) {
      return fail("AI couldn't produce valid data from that input - try rephrasing or adding more detail.");
    }
    if (err instanceof Error) {
      const msg = err.message.toLowerCase();
      if (msg.includes("401") || msg.includes("unauthorized") || msg.includes("api key")) {
        return fail("AI provider rejected the API key. Check it in Account settings.");
      }
      if (msg.includes("429") || msg.includes("rate limit") || msg.includes("quota")) {
        return fail("AI provider rate limit or quota exceeded. Try again shortly.");
      }
    }
    return fail("AI request failed. Check your provider settings and try again.");
  }
}

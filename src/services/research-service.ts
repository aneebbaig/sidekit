import type { ResearchCategory } from "@/generated/prisma/client";
import { researchRepository } from "@/repositories/research-repository";
import { activityRepository } from "@/repositories/activity-repository";
import { researchNoteSchema, type ResearchNoteInput } from "@/schemas/research";
import { fail, ok, type ActionResult } from "@/lib/result";
import { logError, toErrorMessage } from "@/lib/errors";

export const researchService = {
  async list(hustleId: string) {
    return researchRepository.list(hustleId);
  },

  async create(hustleId: string, input: ResearchNoteInput): Promise<ActionResult<{ id: string }>> {
    try {
      const parsed = researchNoteSchema.parse(input);
      const note = await researchRepository.create({
        hustle: { connect: { id: hustleId } },
        title: parsed.title,
        content: parsed.content,
        category: parsed.category as ResearchCategory,
        tags: parsed.tags,
        pinned: parsed.pinned,
      });
      await activityRepository.log({
        hustleId,
        type: "NOTE_CREATED",
        title: `Note “${parsed.title}” added`,
        refId: note.id,
      });
      return ok({ id: note.id });
    } catch (err) {
      logError("research-service.create", err);
      return fail(toErrorMessage(err));
    }
  },

  async update(id: string, input: ResearchNoteInput): Promise<ActionResult<{ id: string }>> {
    try {
      const parsed = researchNoteSchema.parse(input);
      await researchRepository.update(id, {
        title: parsed.title,
        content: parsed.content,
        category: parsed.category as ResearchCategory,
        tags: parsed.tags,
        pinned: parsed.pinned,
      });
      return ok({ id });
    } catch (err) {
      logError("research-service.update", err);
      return fail(toErrorMessage(err));
    }
  },

  async togglePin(id: string, pinned: boolean): Promise<ActionResult<{ id: string }>> {
    try {
      await researchRepository.togglePin(id, pinned);
      return ok({ id });
    } catch (err) {
      logError("research-service.togglePin", err);
      return fail(toErrorMessage(err));
    }
  },

  async delete(id: string): Promise<ActionResult<{ id: string }>> {
    try {
      await researchRepository.delete(id);
      return ok({ id });
    } catch (err) {
      logError("research-service.delete", err);
      return fail(toErrorMessage(err));
    }
  },
};

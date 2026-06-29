import type { HustleStatus } from "@/generated/prisma/client";
import { hustleRepository } from "@/repositories/hustle-repository";
import { activityRepository } from "@/repositories/activity-repository";
import { taskRepository } from "@/repositories/task-repository";
import { DEFAULT_LAUNCH_TASKS } from "@/lib/constants";
import { hustleSchema, type HustleInput } from "@/schemas/hustle";
import { fail, ok, type ActionResult } from "@/lib/result";
import { logError, toErrorMessage } from "@/lib/errors";

export const hustleService = {
  async list() {
    return hustleRepository.list();
  },

  async getById(id: string) {
    return hustleRepository.findById(id);
  },

  async create(input: HustleInput): Promise<ActionResult<{ id: string }>> {
    try {
      const parsed = hustleSchema.parse(input);
      const hustle = await hustleRepository.create({
        name: parsed.name,
        color: parsed.color,
        description: parsed.description || null,
        currency: parsed.currency,
        status: parsed.status as HustleStatus,
        websiteUrl: parsed.websiteUrl || null,
      });
      await taskRepository.createMany(
        DEFAULT_LAUNCH_TASKS.map((t) => ({
          hustleId: hustle.id,
          title: t.title,
          description: t.description,
          priority: t.priority,
          category: t.category,
        })),
      );
      await activityRepository.log({
        hustleId: hustle.id,
        type: "HUSTLE_CREATED",
        title: `Hustle “${hustle.name}” created`,
        refId: hustle.id,
      });
      return ok({ id: hustle.id });
    } catch (err) {
      logError("hustle-service.create", err);
      return fail(toErrorMessage(err));
    }
  },

  async update(id: string, input: HustleInput): Promise<ActionResult<{ id: string }>> {
    try {
      const parsed = hustleSchema.parse(input);
      const current = await hustleRepository.findById(id);
      if (!current) return fail("Hustle not found.");
      await hustleRepository.update(id, {
        name: parsed.name,
        color: parsed.color,
        description: parsed.description || null,
        currency: parsed.currency,
        status: parsed.status as HustleStatus,
        websiteUrl: parsed.websiteUrl || null,
      });
      if (current.status !== parsed.status) {
        await activityRepository.log({
          hustleId: id,
          type: "HUSTLE_STATUS_CHANGED",
          title: `Status changed to ${parsed.status}`,
          refId: id,
        });
      }
      return ok({ id });
    } catch (err) {
      logError("hustle-service.update", err);
      return fail(toErrorMessage(err));
    }
  },

  async updateStatus(id: string, status: HustleStatus): Promise<ActionResult<{ id: string }>> {
    try {
      const current = await hustleRepository.findById(id);
      if (!current) return fail("Hustle not found.");
      await hustleRepository.updateStatus(id, status);
      if (current.status !== status) {
        await activityRepository.log({
          hustleId: id,
          type: "HUSTLE_STATUS_CHANGED",
          title: `Status changed to ${status}`,
          refId: id,
        });
      }
      return ok({ id });
    } catch (err) {
      logError("hustle-service.updateStatus", err);
      return fail(toErrorMessage(err));
    }
  },

  async delete(id: string, confirmation: string): Promise<ActionResult<{ id: string }>> {
    try {
      const hustle = await hustleRepository.findById(id);
      if (!hustle) return fail("Hustle not found.");
      if (confirmation.trim() !== hustle.name.trim()) {
        return fail("Confirmation text does not match hustle name.");
      }
      await hustleRepository.delete(id);
      return ok({ id });
    } catch (err) {
      logError("hustle-service.delete", err);
      return fail(toErrorMessage(err));
    }
  },
};

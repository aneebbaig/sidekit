import type { TaskPriority, TaskStatus } from "@/generated/prisma/client";
import { taskRepository } from "@/repositories/task-repository";
import { activityRepository } from "@/repositories/activity-repository";
import { taskSchema, type TaskInput } from "@/schemas/task";
import { fail, ok, type ActionResult } from "@/lib/result";
import { logError, toErrorMessage } from "@/lib/errors";

export const taskService = {
  async list(hustleId: string) {
    return taskRepository.list(hustleId);
  },

  async create(hustleId: string, input: TaskInput): Promise<ActionResult<{ id: string }>> {
    try {
      const parsed = taskSchema.parse(input);
      const task = await taskRepository.create({
        hustle: { connect: { id: hustleId } },
        title: parsed.title,
        description: parsed.description || null,
        priority: parsed.priority as TaskPriority,
        status: parsed.status as TaskStatus,
        category: parsed.category || null,
        dueDate: parsed.dueDate ? new Date(parsed.dueDate) : null,
      });
      return ok({ id: task.id });
    } catch (err) {
      logError("task-service.create", err);
      return fail(toErrorMessage(err));
    }
  },

  async update(id: string, input: TaskInput): Promise<ActionResult<{ id: string }>> {
    try {
      const parsed = taskSchema.parse(input);
      const existing = await taskRepository.findById(id);
      if (!existing) return fail("Task not found.");
      await taskRepository.update(id, {
        title: parsed.title,
        description: parsed.description || null,
        priority: parsed.priority as TaskPriority,
        status: parsed.status as TaskStatus,
        category: parsed.category || null,
        dueDate: parsed.dueDate ? new Date(parsed.dueDate) : null,
      });
      if (existing.status !== parsed.status && parsed.status === "DONE") {
        await activityRepository.log({
          hustleId: existing.hustleId,
          type: "TASK_COMPLETED",
          title: `Task “${parsed.title}” completed`,
          refId: id,
        });
      }
      return ok({ id });
    } catch (err) {
      logError("task-service.update", err);
      return fail(toErrorMessage(err));
    }
  },

  async setStatus(id: string, status: TaskStatus): Promise<ActionResult<{ id: string }>> {
    try {
      const existing = await taskRepository.findById(id);
      if (!existing) return fail("Task not found.");
      await taskRepository.setStatus(id, status);
      if (existing.status !== status && status === "DONE") {
        await activityRepository.log({
          hustleId: existing.hustleId,
          type: "TASK_COMPLETED",
          title: `Task “${existing.title}” completed`,
          refId: id,
        });
      }
      return ok({ id });
    } catch (err) {
      logError("task-service.setStatus", err);
      return fail(toErrorMessage(err));
    }
  },

  async delete(id: string): Promise<ActionResult<{ id: string }>> {
    try {
      await taskRepository.delete(id);
      return ok({ id });
    } catch (err) {
      logError("task-service.delete", err);
      return fail(toErrorMessage(err));
    }
  },
};

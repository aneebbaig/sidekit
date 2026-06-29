"use server";

import type { TaskStatus } from "@/generated/prisma/client";
import { taskService } from "@/services/task-service";
import { withAuth, revalidateHustle } from "./_helpers";
import type { TaskInput } from "@/schemas/task";

export async function createTaskAction(hustleId: string, input: TaskInput) {
  return withAuth(async () => {
    const res = await taskService.create(hustleId, input);
    if (res.success) revalidateHustle(hustleId, "tasks");
    return res;
  });
}

export async function updateTaskAction(hustleId: string, id: string, input: TaskInput) {
  return withAuth(async () => {
    const res = await taskService.update(id, input);
    if (res.success) revalidateHustle(hustleId, "tasks");
    return res;
  });
}

export async function setTaskStatusAction(hustleId: string, id: string, status: TaskStatus) {
  return withAuth(async () => {
    const res = await taskService.setStatus(id, status);
    if (res.success) revalidateHustle(hustleId, "tasks");
    return res;
  });
}

export async function deleteTaskAction(hustleId: string, id: string) {
  return withAuth(async () => {
    const res = await taskService.delete(id);
    if (res.success) revalidateHustle(hustleId, "tasks");
    return res;
  });
}

import { z } from "zod";
import { TASK_PRIORITIES, TASK_STATUSES } from "@/lib/constants";

export const taskSchema = z.object({
  title: z.string().min(1, "Title required.").max(160),
  description: z.string().max(1000).optional().or(z.literal("")),
  priority: z.enum(TASK_PRIORITIES as [string, ...string[]]).default("MEDIUM"),
  status: z.enum(TASK_STATUSES as [string, ...string[]]).default("TODO"),
  category: z.string().max(60).optional().or(z.literal("")),
  dueDate: z.string().optional().or(z.literal("")),
});

export type TaskInput = z.infer<typeof taskSchema>;

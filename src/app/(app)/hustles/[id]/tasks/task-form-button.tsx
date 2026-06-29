"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { TaskPriority, TaskStatus } from "@/generated/prisma/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
} from "@/lib/constants";
import { taskSchema, type TaskInput } from "@/schemas/task";
import { createTaskAction, updateTaskAction } from "@/actions/task-actions";

export interface TaskData {
  id: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  category: string | null;
  dueDate: string | null;
}

interface Props {
  hustleId: string;
  task?: TaskData;
  trigger?: React.ReactNode;
}

export function TaskFormButton({ hustleId, task, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title ?? "",
      description: task?.description ?? "",
      priority: (task?.priority as TaskInput["priority"]) ?? "MEDIUM",
      status: (task?.status as TaskInput["status"]) ?? "TODO",
      category: task?.category ?? "",
      dueDate: task?.dueDate ? task.dueDate.slice(0, 10) : "",
    },
  });

  const priority = watch("priority");
  const status = watch("status");

  async function onSubmit(values: TaskInput) {
    setPending(true);
    const res = task
      ? await updateTaskAction(hustleId, task.id, values)
      : await createTaskAction(hustleId, values);
    setPending(false);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success(task ? "Task updated." : "Task added.");
    setOpen(false);
    reset();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> New task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task ? "Edit task" : "New task"}</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-2">
            <Label>Title</Label>
            <Input {...register("title")} />
            {errors.title ? <p className="text-xs text-rose-300">{errors.title.message}</p> : null}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setValue("priority", v as TaskInput["priority"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {TASK_PRIORITY_LABELS[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setValue("status", v as TaskInput["status"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {TASK_STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Category</Label>
              <Input placeholder="Operations, Sales..." {...register("category")} />
            </div>
            <div className="space-y-2">
              <Label>Due date</Label>
              <Input type="date" {...register("dueDate")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea rows={3} {...register("description")} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : task ? "Save changes" : "Create task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

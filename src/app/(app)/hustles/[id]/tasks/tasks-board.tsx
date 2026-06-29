"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { TaskStatus } from "@/generated/prisma/client";
import { toast } from "sonner";
import { Check, Clock, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { TaskPriorityBadge, TaskStatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { TaskFormButton, type TaskData } from "./task-form-button";
import { TASK_PRIORITIES, TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { deleteTaskAction, setTaskStatusAction } from "@/actions/task-actions";
import { cn } from "@/lib/utils";

interface Props {
  hustleId: string;
  tasks: TaskData[];
}

const KANBAN_COLUMNS: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];

export function TasksBoard({ hustleId, tasks }: Props) {
  const router = useRouter();
  const [view, setView] = useState<"list" | "kanban">("list");
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState<string>("ALL");
  const [category, setCategory] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const allCategories = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => t.category && set.add(t.category));
    return Array.from(set).sort();
  }, [tasks]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return tasks.filter((t) => {
      if (priority !== "ALL" && t.priority !== priority) return false;
      if (category !== "ALL" && (t.category ?? "") !== category) return false;
      if (statusFilter !== "ALL" && t.status !== statusFilter) return false;
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        (t.description ?? "").toLowerCase().includes(q) ||
        (t.category ?? "").toLowerCase().includes(q)
      );
    });
  }, [tasks, search, priority, category, statusFilter]);

  async function toggleDone(t: TaskData) {
    const next: TaskStatus = t.status === "DONE" ? "TODO" : "DONE";
    const res = await setTaskStatusAction(hustleId, t.id, next);
    if (!res.success) toast.error(res.error);
    else router.refresh();
  }

  async function setStatus(t: TaskData, s: TaskStatus) {
    const res = await setTaskStatusAction(hustleId, t.id, s);
    if (!res.success) toast.error(res.error);
    else router.refresh();
  }

  async function handleDelete(t: TaskData) {
    const res = await deleteTaskAction(hustleId, t.id);
    if (!res.success) toast.error(res.error);
    else toast.success("Task deleted.");
  }

  function isOverdue(t: TaskData) {
    if (!t.dueDate) return false;
    if (t.status === "DONE" || t.status === "CANCELLED") return false;
    return new Date(t.dueDate) < new Date();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Tabs value={view} onValueChange={(v) => setView(v as "list" | "kanban")}>
          <TabsList>
            <TabsTrigger value="list">List</TabsTrigger>
            <TabsTrigger value="kanban">Kanban</TabsTrigger>
          </TabsList>
        </Tabs>
        <Input
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <div className="w-40">
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger>
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All priorities</SelectItem>
              {TASK_PRIORITIES.map((p) => (
                <SelectItem key={p} value={p}>
                  {TASK_PRIORITY_LABELS[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-40">
          <Select value={category} onValueChange={setCategory} disabled={allCategories.length === 0}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All categories</SelectItem>
              {allCategories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {view === "list" ? (
          <div className="w-40">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All statuses</SelectItem>
                {Object.entries(TASK_STATUS_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}
      </div>

      {view === "list" ? (
        filtered.length === 0 ? (
          <EmptyState title="No tasks match" description="Try clearing filters or creating a task." />
        ) : (
          <ul className="space-y-2">
            {filtered.map((t) => (
              <li key={t.id} className="flex items-start gap-3 rounded-lg border border-border bg-card p-3">
                <button
                  type="button"
                  onClick={() => toggleDone(t)}
                  className={cn(
                    "mt-0.5 h-5 w-5 rounded-md border flex items-center justify-center",
                    t.status === "DONE"
                      ? "bg-emerald-500/20 border-emerald-700/50"
                      : "border-border hover:border-primary",
                  )}
                >
                  {t.status === "DONE" ? <Check className="h-3 w-3 text-emerald-300" /> : null}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={cn("font-medium", t.status === "DONE" && "line-through text-muted-foreground")}>
                    {t.title}
                  </p>
                  {t.description ? (
                    <p className="text-xs text-muted-foreground line-clamp-2">{t.description}</p>
                  ) : null}
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <TaskPriorityBadge priority={t.priority} />
                    <TaskStatusBadge status={t.status} />
                    {t.category ? <span>{t.category}</span> : null}
                    {t.dueDate ? (
                      <span
                        className={cn(
                          "inline-flex items-center gap-1",
                          isOverdue(t) ? "text-rose-300" : "",
                        )}
                      >
                        <Clock className="h-3 w-3" />
                        {formatDate(t.dueDate)}
                      </span>
                    ) : null}
                  </div>
                </div>
                <RowMenu
                  hustleId={hustleId}
                  task={t}
                  onDelete={() => handleDelete(t)}
                />
              </li>
            ))}
          </ul>
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {KANBAN_COLUMNS.map((col) => {
            const items = filtered.filter((t) => t.status === col);
            return (
              <Card key={col} className="flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm">{TASK_STATUS_LABELS[col]}</CardTitle>
                  <span className="text-xs text-muted-foreground font-mono">{items.length}</span>
                </CardHeader>
                <CardContent className="space-y-2 min-h-[200px]">
                  {items.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">Empty.</p>
                  ) : (
                    items.map((t) => (
                      <div
                        key={t.id}
                        className="rounded-md border border-border bg-background/40 p-2 space-y-1.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium leading-tight line-clamp-2">{t.title}</p>
                          <RowMenu
                            hustleId={hustleId}
                            task={t}
                            onDelete={() => handleDelete(t)}
                          />
                        </div>
                        <div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
                          <TaskPriorityBadge priority={t.priority} />
                          {t.dueDate ? (
                            <span className={isOverdue(t) ? "text-rose-300" : ""}>
                              {formatDate(t.dueDate)}
                            </span>
                          ) : null}
                        </div>
                        <div className="flex items-center gap-1">
                          {KANBAN_COLUMNS.filter((c) => c !== col).map((c) => (
                            <Button
                              key={c}
                              variant="outline"
                              size="sm"
                              className="h-6 px-2 text-[10px]"
                              onClick={() => setStatus(t, c)}
                            >
                              → {TASK_STATUS_LABELS[c]}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function RowMenu({
  hustleId,
  task,
  onDelete,
}: {
  hustleId: string;
  task: TaskData;
  onDelete: () => Promise<void> | void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <TaskFormButton
          hustleId={hustleId}
          task={task}
          trigger={
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Pencil className="h-4 w-4" /> Edit
            </DropdownMenuItem>
          }
        />
        <ConfirmDialog
          title="Delete this task?"
          confirmLabel="Delete"
          onConfirm={onDelete}
          trigger={
            <DropdownMenuItem
              className="text-rose-300 focus:text-rose-200"
              onSelect={(e) => e.preventDefault()}
            >
              <Trash2 className="h-4 w-4" /> Delete
            </DropdownMenuItem>
          }
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


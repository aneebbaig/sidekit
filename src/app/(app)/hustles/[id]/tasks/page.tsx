import { PageHeader } from "@/components/shared/page-header";
import { hustleService } from "@/services/hustle-service";
import { taskService } from "@/services/task-service";
import { TasksBoard } from "./tasks-board";
import { TaskFormButton } from "./task-form-button";

export default async function TasksPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const hustle = await hustleService.getById(id);
  if (!hustle) return null;
  const tasks = await taskService.list(id);

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Tasks"
        description="Things to do, ordered by priority and due date."
        action={<TaskFormButton hustleId={id} />}
      />
      <TasksBoard
        hustleId={id}
        tasks={tasks.map((t) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          priority: t.priority,
          status: t.status,
          category: t.category,
          dueDate: t.dueDate?.toISOString() ?? null,
        }))}
      />
    </div>
  );
}

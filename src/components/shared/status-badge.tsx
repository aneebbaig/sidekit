import type {
  HustleStatus,
  OrderStatus,
  PaymentStatus,
  ResearchCategory,
  TaskPriority,
  TaskStatus,
} from "@/generated/prisma/client";
import { cn } from "@/lib/utils";
import {
  HUSTLE_STATUS_LABELS,
  HUSTLE_STATUS_TONES,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_TONES,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_TONES,
  RESEARCH_CATEGORY_LABELS,
  RESEARCH_CATEGORY_TONES,
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_TONES,
  TASK_STATUS_LABELS,
  TASK_STATUS_TONES,
} from "@/lib/constants";

const BASE = "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium";

export function HustleStatusBadge({ status, className }: { status: HustleStatus; className?: string }) {
  return (
    <span className={cn(BASE, HUSTLE_STATUS_TONES[status], className)}>
      {HUSTLE_STATUS_LABELS[status]}
    </span>
  );
}

export function OrderStatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  return (
    <span className={cn(BASE, ORDER_STATUS_TONES[status], className)}>
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}

export function PaymentStatusBadge({ status, className }: { status: PaymentStatus; className?: string }) {
  return (
    <span className={cn(BASE, PAYMENT_STATUS_TONES[status], className)}>
      {PAYMENT_STATUS_LABELS[status]}
    </span>
  );
}

export function ResearchCategoryBadge({ category, className }: { category: ResearchCategory; className?: string }) {
  return (
    <span className={cn(BASE, RESEARCH_CATEGORY_TONES[category], className)}>
      {RESEARCH_CATEGORY_LABELS[category]}
    </span>
  );
}

export function TaskPriorityBadge({ priority, className }: { priority: TaskPriority; className?: string }) {
  return (
    <span className={cn(BASE, TASK_PRIORITY_TONES[priority], className)}>
      {TASK_PRIORITY_LABELS[priority]}
    </span>
  );
}

export function TaskStatusBadge({ status, className }: { status: TaskStatus; className?: string }) {
  return (
    <span className={cn(BASE, TASK_STATUS_TONES[status], className)}>
      {TASK_STATUS_LABELS[status]}
    </span>
  );
}

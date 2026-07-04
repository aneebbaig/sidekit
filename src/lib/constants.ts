import type {
  CostCategory,
  CostType,
  HustleStatus,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  ResearchCategory,
  TaskPriority,
  TaskStatus,
  TransactionType,
} from "@/generated/prisma/client";

export const HUSTLE_STATUSES: HustleStatus[] = [
  "IDEA",
  "RESEARCH",
  "BUILDING",
  "LAUNCHED",
  "PAUSED",
  "ARCHIVED",
];

export const HUSTLE_STATUS_LABELS: Record<HustleStatus, string> = {
  IDEA: "Idea",
  RESEARCH: "Research",
  BUILDING: "Building",
  LAUNCHED: "Launched",
  PAUSED: "Paused",
  ARCHIVED: "Archived",
};

export const HUSTLE_STATUS_TONES: Record<HustleStatus, string> = {
  IDEA: "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-700/40 dark:text-zinc-200 dark:border-zinc-600",
  RESEARCH: "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-700/50",
  BUILDING: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-700/50",
  LAUNCHED: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-700/50",
  PAUSED: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/15 dark:text-orange-300 dark:border-orange-700/50",
  ARCHIVED: "bg-zinc-100 text-zinc-400 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-500 dark:border-zinc-700",
};

export const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "IN_PRODUCTION",
  "READY",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  IN_PRODUCTION: "In Production",
  READY: "Ready",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export const ORDER_STATUS_TONES: Record<OrderStatus, string> = {
  PENDING: "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-700/40 dark:text-zinc-200 dark:border-zinc-600",
  CONFIRMED: "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-700/50",
  IN_PRODUCTION: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-700/50",
  READY: "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-500/15 dark:text-violet-300 dark:border-violet-700/50",
  SHIPPED: "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-700/50",
  DELIVERED: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-700/50",
  CANCELLED: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-700/50",
};

export const PAYMENT_STATUSES: PaymentStatus[] = ["UNPAID", "PARTIAL", "PAID"];

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  UNPAID: "Unpaid",
  PARTIAL: "Partial",
  PAID: "Paid",
};

export const PAYMENT_STATUS_TONES: Record<PaymentStatus, string> = {
  UNPAID: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-700/50",
  PARTIAL: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-700/50",
  PAID: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-700/50",
};

export const PAYMENT_METHODS: PaymentMethod[] = [
  "CASH",
  "BANK_TRANSFER",
  "CARD",
  "EASYPAISA",
  "JAZZCASH",
  "OTHER",
];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: "Cash",
  BANK_TRANSFER: "Bank Transfer",
  CARD: "Card",
  EASYPAISA: "EasyPaisa",
  JAZZCASH: "JazzCash",
  OTHER: "Other",
};

export const RESEARCH_CATEGORIES: ResearchCategory[] = [
  "PRODUCT",
  "MARKET",
  "SUPPLIER",
  "LEGAL",
  "COMPETITOR",
  "PRICING",
  "CUSTOMER",
  "OPERATIONS",
  "GENERAL",
];

export const RESEARCH_CATEGORY_LABELS: Record<ResearchCategory, string> = {
  PRODUCT: "Product",
  MARKET: "Market",
  SUPPLIER: "Supplier",
  LEGAL: "Legal",
  COMPETITOR: "Competitor",
  PRICING: "Pricing",
  CUSTOMER: "Customer",
  OPERATIONS: "Operations",
  GENERAL: "General",
};

export const RESEARCH_CATEGORY_TONES: Record<ResearchCategory, string> = {
  PRODUCT: "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-500/15 dark:text-violet-300 dark:border-violet-700/50",
  MARKET: "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-700/50",
  SUPPLIER: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-700/50",
  LEGAL: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-700/50",
  COMPETITOR: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/15 dark:text-orange-300 dark:border-orange-700/50",
  PRICING: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-700/50",
  CUSTOMER: "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-700/50",
  OPERATIONS: "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-500/15 dark:text-teal-300 dark:border-teal-700/50",
  GENERAL: "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-700/40 dark:text-zinc-200 dark:border-zinc-600",
};

export const COST_CATEGORIES: CostCategory[] = [
  "RAW_MATERIAL",
  "PACKAGING",
  "EQUIPMENT",
  "SHIPPING",
  "MARKETING",
  "PLATFORM_FEE",
  "LEGAL",
  "MISCELLANEOUS",
];

export const COST_CATEGORY_LABELS: Record<CostCategory, string> = {
  RAW_MATERIAL: "Raw Material",
  PACKAGING: "Packaging",
  EQUIPMENT: "Equipment",
  SHIPPING: "Shipping",
  MARKETING: "Marketing",
  PLATFORM_FEE: "Platform Fee",
  LEGAL: "Legal",
  MISCELLANEOUS: "Miscellaneous",
};

export const COST_TYPES: CostType[] = ["FIXED", "VARIABLE"];

export const COST_TYPE_LABELS: Record<CostType, string> = {
  FIXED: "Fixed",
  VARIABLE: "Variable",
};

export const TASK_PRIORITIES: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

export const TASK_PRIORITY_TONES: Record<TaskPriority, string> = {
  LOW: "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-700/40 dark:text-zinc-300 dark:border-zinc-600",
  MEDIUM: "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-700/50",
  HIGH: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-700/50",
  CRITICAL: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-700/50",
};

export const TASK_STATUSES: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE", "CANCELLED"];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
  CANCELLED: "Cancelled",
};

export const TASK_STATUS_TONES: Record<TaskStatus, string> = {
  TODO: "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-700/40 dark:text-zinc-300 dark:border-zinc-600",
  IN_PROGRESS: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-700/50",
  DONE: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-700/50",
  CANCELLED: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-700/50",
};

export const TRANSACTION_TYPES: TransactionType[] = ["INCOME", "EXPENSE"];

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  INCOME: "Income",
  EXPENSE: "Expense",
};

export const CURRENCY_OPTIONS = ["PKR", "USD", "EUR", "GBP", "AED", "INR"] as const;

export const HUSTLE_COLORS = [
  "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7",
  "#ec4899", "#ef4444", "#f97316", "#f59e0b",
  "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9",
] as const;

export const EXPENSE_CATEGORY_SUGGESTIONS = [
  "Materials",
  "Packaging",
  "Shipping",
  "Marketing",
  "Platform Fees",
  "Equipment",
  "Software",
  "Utilities",
  "Salaries",
  "Tax",
  "Other",
];

export const INCOME_CATEGORY_SUGGESTIONS = [
  "Order Sale",
  "Refund",
  "Other",
];

export const DEFAULT_LAUNCH_TASKS: Array<{
  title: string;
  description: string;
  priority: TaskPriority;
  category: string;
}> = [
  {
    title: "Define value proposition",
    description: "Write a one-sentence pitch describing what your business does and who for.",
    priority: "HIGH",
    category: "Strategy",
  },
  {
    title: "Identify target customer",
    description: "Document the primary customer persona and where they spend time online.",
    priority: "HIGH",
    category: "Research",
  },
  {
    title: "Research competitors",
    description: "List 5 competitors and note their pricing, positioning, and weaknesses.",
    priority: "MEDIUM",
    category: "Research",
  },
  {
    title: "Source initial suppliers",
    description: "Identify and contact at least 3 suppliers for raw materials.",
    priority: "HIGH",
    category: "Operations",
  },
  {
    title: "Build cost sheet",
    description: "Document fixed and variable costs to calculate true unit cost.",
    priority: "HIGH",
    category: "Finance",
  },
  {
    title: "Set pricing strategy",
    description: "Decide on pricing tiers based on cost and competitor analysis.",
    priority: "MEDIUM",
    category: "Strategy",
  },
  {
    title: "Create brand identity",
    description: "Pick a name, logo, color palette, and core typography.",
    priority: "MEDIUM",
    category: "Branding",
  },
  {
    title: "Set up sales channel",
    description: "Open Instagram / WhatsApp business / web store as appropriate.",
    priority: "MEDIUM",
    category: "Sales",
  },
  {
    title: "Produce first batch",
    description: "Create a small batch of finished product to validate operations end-to-end.",
    priority: "HIGH",
    category: "Operations",
  },
  {
    title: "Launch marketing campaign",
    description: "Run a small launch campaign across chosen channels.",
    priority: "MEDIUM",
    category: "Marketing",
  },
];

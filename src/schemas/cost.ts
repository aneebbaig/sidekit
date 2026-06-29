import { z } from "zod";
import { COST_CATEGORIES, COST_TYPES } from "@/lib/constants";

export const costItemSchema = z.object({
  name: z.string().min(1, "Name is required.").max(160),
  category: z.enum(COST_CATEGORIES as [string, ...string[]]),
  type: z.enum(COST_TYPES as [string, ...string[]]),
  amount: z.coerce.number().nonnegative("Amount must be 0 or greater."),
  unit: z.string().min(1, "Unit required.").max(40).default("unit"),
  quantity: z.coerce.number().positive("Quantity must be greater than 0.").default(1),
  supplierId: z.string().optional().or(z.literal("")),
  productId: z.string().optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
  url: z.string().url("Must be a valid URL.").max(2000).optional().or(z.literal("")),
});

export type CostItemInput = z.infer<typeof costItemSchema>;

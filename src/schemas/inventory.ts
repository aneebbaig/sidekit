import { z } from "zod";

export const inventoryItemSchema = z.object({
  name: z.string().min(1, "Name is required.").max(160),
  sku: z.string().max(60).optional().or(z.literal("")),
  unit: z.string().min(1).max(40).default("unit"),
  quantity: z.coerce.number().nonnegative("Quantity must be 0 or greater.").default(0),
  reorderAt: z.coerce.number().nonnegative("Reorder point must be 0 or greater.").default(0),
  unitCost: z.coerce.number().nonnegative("Unit cost must be 0 or greater.").default(0),
  notes: z.string().max(500).optional().or(z.literal("")),
  url: z.string().url("Must be a valid URL.").max(2000).optional().or(z.literal("")),
});

export const inventoryAdjustmentSchema = z.object({
  delta: z.coerce.number().refine((n) => n !== 0, "Delta must be non-zero."),
  reason: z.string().min(2, "Reason required."),
});

export type InventoryItemInput = z.infer<typeof inventoryItemSchema>;
export type InventoryAdjustmentInput = z.infer<typeof inventoryAdjustmentSchema>;

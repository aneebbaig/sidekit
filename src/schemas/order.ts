import { z } from "zod";
import { ORDER_STATUSES, PAYMENT_METHODS } from "@/lib/constants";

export const orderItemSchema = z.object({
  name: z.string().min(1, "Item name required."),
  description: z.string().optional().or(z.literal("")),
  quantity: z.coerce.number().int().positive("Quantity must be > 0."),
  unitPrice: z.coerce.number().nonnegative("Unit price must be 0 or greater."),
});

export const customizationEntrySchema = z.object({
  key: z.string().min(1),
  value: z.string().min(1),
});

export const orderSchema = z.object({
  customerId: z.string().optional().or(z.literal("")),
  customerName: z.string().min(1, "Customer name required.").max(160),
  status: z.enum(ORDER_STATUSES as [string, ...string[]]).default("PENDING"),
  paymentMethod: z.enum(PAYMENT_METHODS as [string, ...string[]]).optional().or(z.literal("")),
  shippingCost: z.coerce.number().nonnegative().default(0),
  discount: z.coerce.number().nonnegative().default(0),
  amountPaid: z.coerce.number().nonnegative().default(0),
  notes: z.string().max(500).optional().or(z.literal("")),
  dueDate: z.string().optional().or(z.literal("")),
  items: z.array(orderItemSchema).min(1, "At least one line item required."),
  customizations: z.array(customizationEntrySchema).default([]),
});

export const orderStatusUpdateSchema = z.object({
  status: z.enum(ORDER_STATUSES as [string, ...string[]]),
  note: z.string().max(300).optional().or(z.literal("")),
});

export const orderPaymentSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0."),
  method: z.enum(PAYMENT_METHODS as [string, ...string[]]),
  reference: z.string().max(120).optional().or(z.literal("")),
  note: z.string().max(300).optional().or(z.literal("")),
});

export type OrderInput = z.infer<typeof orderSchema>;
export type OrderItemInput = z.infer<typeof orderItemSchema>;
export type OrderStatusUpdateInput = z.infer<typeof orderStatusUpdateSchema>;
export type OrderPaymentInput = z.infer<typeof orderPaymentSchema>;

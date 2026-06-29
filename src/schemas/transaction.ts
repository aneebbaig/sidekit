import { z } from "zod";
import { TRANSACTION_TYPES } from "@/lib/constants";

export const transactionSchema = z.object({
  type: z.enum(TRANSACTION_TYPES as [string, ...string[]]),
  category: z.string().min(1, "Category required.").max(80),
  description: z.string().max(300).optional().or(z.literal("")),
  amount: z.coerce.number().positive("Amount must be greater than 0."),
  date: z.string().min(1, "Date required."),
  reference: z.string().max(120).optional().or(z.literal("")),
});

export type TransactionInput = z.infer<typeof transactionSchema>;

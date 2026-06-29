import { z } from "zod";

export const supplierSchema = z.object({
  name: z.string().min(1, "Name is required.").max(160),
  contactName: z.string().max(120).optional().or(z.literal("")),
  phone: z.string().max(40).optional().or(z.literal("")),
  email: z.string().email("Enter a valid email.").optional().or(z.literal("")),
  website: z.string().url("Enter a valid URL.").optional().or(z.literal("")),
  city: z.string().max(80).optional().or(z.literal("")),
  rating: z.coerce.number().int().min(0).max(5).default(0),
  preferred: z.boolean().default(false),
  notes: z.string().max(500).optional().or(z.literal("")),
});

export type SupplierInput = z.infer<typeof supplierSchema>;

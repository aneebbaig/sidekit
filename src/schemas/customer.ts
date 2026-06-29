import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(1, "Name is required.").max(160),
  phone: z.string().max(40).optional().or(z.literal("")),
  email: z.string().email("Enter a valid email.").optional().or(z.literal("")),
  city: z.string().max(80).optional().or(z.literal("")),
  address: z.string().max(300).optional().or(z.literal("")),
  source: z.string().max(60).optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
});

export type CustomerInput = z.infer<typeof customerSchema>;

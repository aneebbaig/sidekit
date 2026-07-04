import { z } from "zod";
import { CURRENCY_OPTIONS, HUSTLE_STATUSES } from "@/lib/constants";

export const hustleSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(80),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color.").default("#14b8a6"),
  description: z.string().max(500).optional().or(z.literal("")),
  currency: z.enum(CURRENCY_OPTIONS),
  status: z.enum(HUSTLE_STATUSES as [string, ...string[]]),
  websiteUrl: z.string().url("Must be a valid URL.").optional().or(z.literal("")),
});

export const hustleStatusSchema = z.object({
  status: z.enum(HUSTLE_STATUSES as [string, ...string[]]),
});

export const hustleDeleteSchema = z.object({
  confirmation: z.string().min(1, "Type the hustle name to confirm."),
});

export type HustleInput = z.infer<typeof hustleSchema>;

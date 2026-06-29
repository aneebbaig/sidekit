import { z } from "zod";

export const PRODUCT_STATUSES = ["RESEARCH", "ACTIVE", "RETIRED"] as const;
export type ProductStatusType = (typeof PRODUCT_STATUSES)[number];

export const PRODUCT_STATUS_LABELS: Record<ProductStatusType, string> = {
  RESEARCH: "R&D",
  ACTIVE: "Active",
  RETIRED: "Retired",
};

export const PRODUCT_STATUS_BADGE_VARIANTS: Record<
  ProductStatusType,
  "warning" | "success" | "outline"
> = {
  RESEARCH: "warning",
  ACTIVE: "success",
  RETIRED: "outline",
};

export const productSchema = z.object({
  name: z.string().min(1, "Name is required.").max(160),
  description: z.string().max(500).optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
  status: z.enum(PRODUCT_STATUSES).default("RESEARCH"),
  coverImageUrl: z.string().url("Must be a valid URL.").max(2000).optional().or(z.literal("")),
});

export type ProductInput = z.infer<typeof productSchema>;

export const productInspirationSchema = z.object({
  imageUrl: z.string().url("Must be a valid URL.").max(2000),
  title: z.string().max(160).optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
});

export type ProductInspirationInput = z.infer<typeof productInspirationSchema>;

import { z } from "zod";
import { RESEARCH_CATEGORIES } from "@/lib/constants";

export const researchNoteSchema = z.object({
  title: z.string().min(1, "Title is required.").max(160),
  content: z.string().min(1, "Content is required."),
  category: z.enum(RESEARCH_CATEGORIES as [string, ...string[]]),
  tags: z.array(z.string().min(1)).max(20).default([]),
  pinned: z.boolean().default(false),
});

export type ResearchNoteInput = z.infer<typeof researchNoteSchema>;

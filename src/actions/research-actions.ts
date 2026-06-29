"use server";

import { researchService } from "@/services/research-service";
import { withAuth, revalidateHustle } from "./_helpers";
import type { ResearchNoteInput } from "@/schemas/research";

export async function createNoteAction(hustleId: string, input: ResearchNoteInput) {
  return withAuth(async () => {
    const res = await researchService.create(hustleId, input);
    if (res.success) revalidateHustle(hustleId, "research");
    return res;
  });
}

export async function updateNoteAction(hustleId: string, id: string, input: ResearchNoteInput) {
  return withAuth(async () => {
    const res = await researchService.update(id, input);
    if (res.success) revalidateHustle(hustleId, "research");
    return res;
  });
}

export async function togglePinAction(hustleId: string, id: string, pinned: boolean) {
  return withAuth(async () => {
    const res = await researchService.togglePin(id, pinned);
    if (res.success) revalidateHustle(hustleId, "research");
    return res;
  });
}

export async function deleteNoteAction(hustleId: string, id: string) {
  return withAuth(async () => {
    const res = await researchService.delete(id);
    if (res.success) revalidateHustle(hustleId, "research");
    return res;
  });
}

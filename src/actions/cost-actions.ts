"use server";

import { costService } from "@/services/cost-service";
import { withAuth, revalidateHustle } from "./_helpers";
import { costItemSchema, type CostItemInput } from "@/schemas/cost";
import { fail, ok } from "@/lib/result";

export async function createCostItemAction(hustleId: string, input: CostItemInput) {
  return withAuth(async () => {
    const res = await costService.create(hustleId, input);
    if (res.success) revalidateHustle(hustleId, "cost-sheet");
    return res;
  });
}

export async function updateCostItemAction(hustleId: string, id: string, input: CostItemInput) {
  return withAuth(async () => {
    const res = await costService.update(id, input);
    if (res.success) revalidateHustle(hustleId, "cost-sheet");
    return res;
  });
}

export async function deleteCostItemAction(hustleId: string, id: string) {
  return withAuth(async () => {
    const res = await costService.delete(id);
    if (res.success) revalidateHustle(hustleId, "cost-sheet");
    return res;
  });
}

export async function deleteManyCostItemsAction(hustleId: string, ids: string[]) {
  return withAuth(async () => {
    for (const id of ids) {
      const res = await costService.delete(id);
      if (!res.success) return fail(res.error);
    }
    revalidateHustle(hustleId, "cost-sheet");
    return ok({ count: ids.length });
  });
}

export async function importCostItemsAction(hustleId: string, raw: unknown[]) {
  return withAuth(async () => {
    let count = 0;
    for (const item of raw) {
      const parsed = costItemSchema.safeParse(item);
      if (!parsed.success) return fail(`Invalid item: ${parsed.error.issues[0]?.message}`);
      const res = await costService.create(hustleId, parsed.data);
      if (!res.success) return fail(res.error);
      count++;
    }
    revalidateHustle(hustleId, "cost-sheet");
    return ok({ count });
  });
}

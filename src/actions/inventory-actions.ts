"use server";

import { inventoryService } from "@/services/inventory-service";
import { withAuth, revalidateHustle } from "./_helpers";
import { inventoryItemSchema, type InventoryAdjustmentInput, type InventoryItemInput } from "@/schemas/inventory";
import { fail, ok } from "@/lib/result";

export async function createInventoryItemAction(hustleId: string, input: InventoryItemInput) {
  return withAuth(async () => {
    const res = await inventoryService.create(hustleId, input);
    if (res.success) revalidateHustle(hustleId, "inventory");
    return res;
  });
}

export async function updateInventoryItemAction(hustleId: string, id: string, input: InventoryItemInput) {
  return withAuth(async () => {
    const res = await inventoryService.update(id, input);
    if (res.success) revalidateHustle(hustleId, "inventory");
    return res;
  });
}

export async function adjustInventoryAction(hustleId: string, id: string, input: InventoryAdjustmentInput) {
  return withAuth(async () => {
    const res = await inventoryService.adjust(id, input);
    if (res.success) revalidateHustle(hustleId, "inventory");
    return res;
  });
}

export async function deleteInventoryItemAction(hustleId: string, id: string) {
  return withAuth(async () => {
    const res = await inventoryService.delete(id);
    if (res.success) revalidateHustle(hustleId, "inventory");
    return res;
  });
}

export async function deleteManyInventoryItemsAction(hustleId: string, ids: string[]) {
  return withAuth(async () => {
    for (const id of ids) {
      const res = await inventoryService.delete(id);
      if (!res.success) return fail(res.error);
    }
    revalidateHustle(hustleId, "inventory");
    return ok({ count: ids.length });
  });
}

export async function importInventoryItemsAction(hustleId: string, raw: unknown[]) {
  return withAuth(async () => {
    let count = 0;
    for (const item of raw) {
      const parsed = inventoryItemSchema.safeParse(item);
      if (!parsed.success) return fail(`Invalid item: ${parsed.error.issues[0]?.message}`);
      const res = await inventoryService.create(hustleId, parsed.data);
      if (!res.success) return fail(res.error);
      count++;
    }
    revalidateHustle(hustleId, "inventory");
    return ok({ count });
  });
}

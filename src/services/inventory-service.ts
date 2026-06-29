import { inventoryRepository } from "@/repositories/inventory-repository";
import { activityRepository } from "@/repositories/activity-repository";
import {
  inventoryAdjustmentSchema,
  inventoryItemSchema,
  type InventoryAdjustmentInput,
  type InventoryItemInput,
} from "@/schemas/inventory";
import { fail, ok, type ActionResult } from "@/lib/result";
import { logError, toErrorMessage } from "@/lib/errors";
import { toNumber } from "@/lib/currency";

export const inventoryService = {
  async list(hustleId: string) {
    return inventoryRepository.list(hustleId);
  },

  async lowStock(hustleId: string) {
    return inventoryRepository.lowStock(hustleId);
  },

  async totalValue(hustleId: string): Promise<number> {
    const items = await inventoryRepository.list(hustleId);
    return items.reduce((sum, i) => sum + toNumber(i.quantity) * toNumber(i.unitCost), 0);
  },

  async create(hustleId: string, input: InventoryItemInput): Promise<ActionResult<{ id: string }>> {
    try {
      const parsed = inventoryItemSchema.parse(input);
      const item = await inventoryRepository.create({
        hustle: { connect: { id: hustleId } },
        name: parsed.name,
        sku: parsed.sku || null,
        unit: parsed.unit,
        quantity: parsed.quantity,
        reorderAt: parsed.reorderAt,
        unitCost: parsed.unitCost,
        notes: parsed.notes || null,
        url: parsed.url || null,
      });
      return ok({ id: item.id });
    } catch (err) {
      logError("inventory-service.create", err);
      return fail(toErrorMessage(err));
    }
  },

  async update(id: string, input: InventoryItemInput): Promise<ActionResult<{ id: string }>> {
    try {
      const parsed = inventoryItemSchema.parse(input);
      await inventoryRepository.update(id, {
        name: parsed.name,
        sku: parsed.sku || null,
        unit: parsed.unit,
        quantity: parsed.quantity,
        reorderAt: parsed.reorderAt,
        unitCost: parsed.unitCost,
        notes: parsed.notes || null,
        url: parsed.url || null,
      });
      return ok({ id });
    } catch (err) {
      logError("inventory-service.update", err);
      return fail(toErrorMessage(err));
    }
  },

  async adjust(id: string, input: InventoryAdjustmentInput): Promise<ActionResult<{ id: string }>> {
    try {
      const parsed = inventoryAdjustmentSchema.parse(input);
      const item = await inventoryRepository.findById(id);
      if (!item) return fail("Inventory item not found.");
      await inventoryRepository.adjust(id, parsed.delta, parsed.reason);
      await activityRepository.log({
        hustleId: item.hustleId,
        type: "INVENTORY_ADJUSTED",
        title: `${item.name} adjusted by ${parsed.delta}`,
        detail: parsed.reason,
        refId: id,
      });
      return ok({ id });
    } catch (err) {
      logError("inventory-service.adjust", err);
      return fail(toErrorMessage(err));
    }
  },

  async delete(id: string): Promise<ActionResult<{ id: string }>> {
    try {
      await inventoryRepository.delete(id);
      return ok({ id });
    } catch (err) {
      logError("inventory-service.delete", err);
      return fail(toErrorMessage(err));
    }
  },
};

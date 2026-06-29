import type { CostCategory, CostType } from "@/generated/prisma/client";
import { costRepository } from "@/repositories/cost-repository";
import { costItemSchema, type CostItemInput } from "@/schemas/cost";
import { fail, ok, type ActionResult } from "@/lib/result";
import { logError, toErrorMessage } from "@/lib/errors";

export const costService = {
  async list(hustleId: string) {
    return costRepository.list(hustleId);
  },

  async create(hustleId: string, input: CostItemInput): Promise<ActionResult<{ id: string }>> {
    try {
      const parsed = costItemSchema.parse(input);
      const item = await costRepository.create({
        hustle: { connect: { id: hustleId } },
        supplier: parsed.supplierId ? { connect: { id: parsed.supplierId } } : undefined,
        product: parsed.productId ? { connect: { id: parsed.productId } } : undefined,
        name: parsed.name,
        category: parsed.category as CostCategory,
        type: parsed.type as CostType,
        amount: parsed.amount,
        unit: parsed.unit,
        quantity: parsed.quantity,
        notes: parsed.notes || null,
        url: parsed.url || null,
      });
      return ok({ id: item.id });
    } catch (err) {
      logError("cost-service.create", err);
      return fail(toErrorMessage(err));
    }
  },

  async update(id: string, input: CostItemInput): Promise<ActionResult<{ id: string }>> {
    try {
      const parsed = costItemSchema.parse(input);
      await costRepository.update(id, {
        supplier: parsed.supplierId
          ? { connect: { id: parsed.supplierId } }
          : { disconnect: true },
        product: parsed.productId
          ? { connect: { id: parsed.productId } }
          : { disconnect: true },
        name: parsed.name,
        category: parsed.category as CostCategory,
        type: parsed.type as CostType,
        amount: parsed.amount,
        unit: parsed.unit,
        quantity: parsed.quantity,
        notes: parsed.notes || null,
        url: parsed.url || null,
      });
      return ok({ id });
    } catch (err) {
      logError("cost-service.update", err);
      return fail(toErrorMessage(err));
    }
  },

  async delete(id: string): Promise<ActionResult<{ id: string }>> {
    try {
      await costRepository.delete(id);
      return ok({ id });
    } catch (err) {
      logError("cost-service.delete", err);
      return fail(toErrorMessage(err));
    }
  },
};

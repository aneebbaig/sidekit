import type { TransactionType } from "@/generated/prisma/client";
import { transactionRepository } from "@/repositories/transaction-repository";
import { activityRepository } from "@/repositories/activity-repository";
import { transactionSchema, type TransactionInput } from "@/schemas/transaction";
import { fail, ok, type ActionResult } from "@/lib/result";
import { logError, toErrorMessage } from "@/lib/errors";

export const transactionService = {
  async list(filters: { hustleId?: string; from?: Date; to?: Date }) {
    return transactionRepository.list(filters);
  },

  async create(hustleId: string, input: TransactionInput): Promise<ActionResult<{ id: string }>> {
    try {
      const parsed = transactionSchema.parse(input);
      const tx = await transactionRepository.create({
        hustle: { connect: { id: hustleId } },
        type: parsed.type as TransactionType,
        category: parsed.category,
        description: parsed.description || null,
        amount: parsed.amount,
        date: new Date(parsed.date),
        reference: parsed.reference || null,
      });
      await activityRepository.log({
        hustleId,
        type: "TRANSACTION_RECORDED",
        title: `${parsed.type} • ${parsed.category}`,
        detail: parsed.description || undefined,
        refId: tx.id,
      });
      return ok({ id: tx.id });
    } catch (err) {
      logError("transaction-service.create", err);
      return fail(toErrorMessage(err));
    }
  },

  async update(id: string, input: TransactionInput): Promise<ActionResult<{ id: string }>> {
    try {
      const parsed = transactionSchema.parse(input);
      await transactionRepository.update(id, {
        type: parsed.type as TransactionType,
        category: parsed.category,
        description: parsed.description || null,
        amount: parsed.amount,
        date: new Date(parsed.date),
        reference: parsed.reference || null,
      });
      return ok({ id });
    } catch (err) {
      logError("transaction-service.update", err);
      return fail(toErrorMessage(err));
    }
  },

  async delete(id: string): Promise<ActionResult<{ id: string }>> {
    try {
      await transactionRepository.delete(id);
      return ok({ id });
    } catch (err) {
      logError("transaction-service.delete", err);
      return fail(toErrorMessage(err));
    }
  },
};

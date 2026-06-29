"use server";

import { transactionService } from "@/services/transaction-service";
import { withAuth, revalidateHustle, revalidateGlobal } from "./_helpers";
import type { TransactionInput } from "@/schemas/transaction";

export async function createTransactionAction(hustleId: string, input: TransactionInput) {
  return withAuth(async () => {
    const res = await transactionService.create(hustleId, input);
    if (res.success) { revalidateHustle(hustleId, "financials"); revalidateGlobal(); }
    return res;
  });
}

export async function updateTransactionAction(hustleId: string, id: string, input: TransactionInput) {
  return withAuth(async () => {
    const res = await transactionService.update(id, input);
    if (res.success) { revalidateHustle(hustleId, "financials"); revalidateGlobal(); }
    return res;
  });
}

export async function deleteTransactionAction(hustleId: string, id: string) {
  return withAuth(async () => {
    const res = await transactionService.delete(id);
    if (res.success) { revalidateHustle(hustleId, "financials"); revalidateGlobal(); }
    return res;
  });
}

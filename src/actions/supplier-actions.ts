"use server";

import { supplierService } from "@/services/supplier-service";
import { withAuth, revalidateHustle } from "./_helpers";
import { supplierSchema, type SupplierInput } from "@/schemas/supplier";
import { fail, ok } from "@/lib/result";

export async function createSupplierAction(hustleId: string, input: SupplierInput) {
  return withAuth(async () => {
    const res = await supplierService.create(hustleId, input);
    if (res.success) revalidateHustle(hustleId, "suppliers");
    return res;
  });
}

export async function updateSupplierAction(hustleId: string, id: string, input: SupplierInput) {
  return withAuth(async () => {
    const res = await supplierService.update(id, input);
    if (res.success) revalidateHustle(hustleId, "suppliers", id);
    return res;
  });
}

export async function deleteSupplierAction(hustleId: string, id: string) {
  return withAuth(async () => {
    const res = await supplierService.delete(id);
    if (res.success) revalidateHustle(hustleId, "suppliers");
    return res;
  });
}

export async function importSuppliersAction(hustleId: string, raw: unknown[]) {
  return withAuth(async () => {
    let count = 0;
    for (const item of raw) {
      const parsed = supplierSchema.safeParse(item);
      if (!parsed.success) return fail(`Invalid supplier: ${parsed.error.issues[0]?.message}`);
      const res = await supplierService.create(hustleId, parsed.data);
      if (!res.success) return fail(res.error);
      count++;
    }
    revalidateHustle(hustleId, "suppliers");
    return ok({ count });
  });
}

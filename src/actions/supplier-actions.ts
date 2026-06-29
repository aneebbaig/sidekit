"use server";

import { supplierService } from "@/services/supplier-service";
import { withAuth, revalidateHustle } from "./_helpers";
import type { SupplierInput } from "@/schemas/supplier";

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

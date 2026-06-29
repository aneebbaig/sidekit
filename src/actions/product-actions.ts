"use server";

import { productService } from "@/services/product-service";
import { productRepository } from "@/repositories/product-repository";
import { withAuth, revalidateHustle } from "./_helpers";
import { ok } from "@/lib/result";
import type { ProductInput } from "@/schemas/product";

export async function createProductAction(hustleId: string, input: ProductInput) {
  return withAuth(async () => {
    const res = await productService.create(hustleId, input);
    if (res.success) { revalidateHustle(hustleId, "cost-sheet"); revalidateHustle(hustleId, "products"); }
    return res;
  });
}

export async function updateProductAction(hustleId: string, id: string, input: ProductInput) {
  return withAuth(async () => {
    const res = await productService.update(id, input);
    if (res.success) { revalidateHustle(hustleId, "cost-sheet"); revalidateHustle(hustleId, "products"); }
    return res;
  });
}

export async function deleteProductAction(hustleId: string, id: string) {
  return withAuth(async () => {
    const res = await productService.delete(id);
    if (res.success) { revalidateHustle(hustleId, "cost-sheet"); revalidateHustle(hustleId, "products"); }
    return res;
  });
}

export async function reorderProductsAction(hustleId: string, orderedIds: string[]) {
  return withAuth(async () => {
    const updates = orderedIds.map((id, i) => ({ id, sortOrder: i }));
    await productRepository.reorder(updates);
    revalidateHustle(hustleId, "cost-sheet");
    return ok({ count: updates.length });
  });
}

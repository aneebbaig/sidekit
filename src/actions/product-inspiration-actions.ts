"use server";

import { prisma } from "@/lib/prisma";
import { productInspirationSchema, type ProductInspirationInput } from "@/schemas/product";
import { withAuth, revalidateHustle } from "./_helpers";
import { ok, fail } from "@/lib/result";
import { logError, toErrorMessage } from "@/lib/errors";

export async function listProductInspirationsAction(productId: string) {
  return withAuth(async () => {
    try {
      const items = await prisma.productInspiration.findMany({
        where: { productId },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      });
      return ok(items);
    } catch (err) {
      logError("list-inspirations", err);
      return fail(toErrorMessage(err));
    }
  });
}

export async function listProductCostItemsAction(productId: string) {
  return withAuth(async () => {
    try {
      const items = await prisma.costItem.findMany({
        where: { productId },
        orderBy: { createdAt: "asc" },
      });
      return ok(
        items.map((i) => ({
          id: i.id,
          name: i.name,
          category: i.category,
          type: i.type,
          amount: Number(i.amount),
          quantity: Number(i.quantity),
          unit: i.unit,
        })),
      );
    } catch (err) {
      logError("list-product-costs", err);
      return fail(toErrorMessage(err));
    }
  });
}

export async function createProductInspirationAction(
  hustleId: string,
  productId: string,
  input: ProductInspirationInput,
) {
  return withAuth(async () => {
    try {
      const parsed = productInspirationSchema.parse(input);
      const item = await prisma.productInspiration.create({
        data: {
          product: { connect: { id: productId } },
          imageUrl: parsed.imageUrl,
          title: parsed.title || null,
          notes: parsed.notes || null,
        },
      });
      revalidateHustle(hustleId, "products");
      return ok({ id: item.id });
    } catch (err) {
      logError("create-inspiration", err);
      return fail(toErrorMessage(err));
    }
  });
}

export async function deleteProductInspirationAction(hustleId: string, id: string) {
  return withAuth(async () => {
    try {
      await prisma.productInspiration.delete({ where: { id } });
      revalidateHustle(hustleId, "products");
      return ok({ id });
    } catch (err) {
      logError("delete-inspiration", err);
      return fail(toErrorMessage(err));
    }
  });
}

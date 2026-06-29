import type { ProductStatus } from "@/generated/prisma/client";
import { productRepository } from "@/repositories/product-repository";
import { productSchema, type ProductInput } from "@/schemas/product";
import { fail, ok, type ActionResult } from "@/lib/result";
import { logError, toErrorMessage } from "@/lib/errors";

export const productService = {
  async list(hustleId: string) {
    return productRepository.list(hustleId);
  },

  async listWithCounts(hustleId: string) {
    return productRepository.listWithCounts(hustleId);
  },

  async create(hustleId: string, input: ProductInput): Promise<ActionResult<{ id: string }>> {
    try {
      const parsed = productSchema.parse(input);
      const item = await productRepository.create({
        hustle: { connect: { id: hustleId } },
        name: parsed.name,
        description: parsed.description || null,
        notes: parsed.notes || null,
        status: parsed.status as ProductStatus,
        coverImageUrl: parsed.coverImageUrl || null,
      });
      return ok({ id: item.id });
    } catch (err) {
      logError("product-service.create", err);
      return fail(toErrorMessage(err));
    }
  },

  async update(id: string, input: ProductInput): Promise<ActionResult<{ id: string }>> {
    try {
      const parsed = productSchema.parse(input);
      await productRepository.update(id, {
        name: parsed.name,
        description: parsed.description || null,
        notes: parsed.notes || null,
        status: parsed.status as ProductStatus,
        coverImageUrl: parsed.coverImageUrl || null,
      });
      return ok({ id });
    } catch (err) {
      logError("product-service.update", err);
      return fail(toErrorMessage(err));
    }
  },

  async delete(id: string): Promise<ActionResult<{ id: string }>> {
    try {
      await productRepository.delete(id);
      return ok({ id });
    } catch (err) {
      logError("product-service.delete", err);
      return fail(toErrorMessage(err));
    }
  },
};

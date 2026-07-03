import type { CostCategory, CostType, HustleStatus, ProductStatus } from "@/generated/prisma/client";
import { hustleRepository } from "@/repositories/hustle-repository";
import { activityRepository } from "@/repositories/activity-repository";
import { taskRepository } from "@/repositories/task-repository";
import { DEFAULT_LAUNCH_TASKS } from "@/lib/constants";
import { hustleSchema, type HustleInput } from "@/schemas/hustle";
import { supplierSchema } from "@/schemas/supplier";
import { productSchema } from "@/schemas/product";
import { inventoryItemSchema } from "@/schemas/inventory";
import { draftCostItemSchema, hustleDraftSchema, type HustleDraft } from "@/schemas/ai-draft";
import { prisma } from "@/lib/prisma";
import { fail, ok, type ActionResult } from "@/lib/result";
import { logError, toErrorMessage } from "@/lib/errors";

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

export const hustleService = {
  async list() {
    return hustleRepository.list();
  },

  async getById(id: string) {
    return hustleRepository.findById(id);
  },

  async create(input: HustleInput): Promise<ActionResult<{ id: string }>> {
    try {
      const parsed = hustleSchema.parse(input);
      const hustle = await hustleRepository.create({
        name: parsed.name,
        color: parsed.color,
        description: parsed.description || null,
        currency: parsed.currency,
        status: parsed.status as HustleStatus,
        websiteUrl: parsed.websiteUrl || null,
      });
      await taskRepository.createMany(
        DEFAULT_LAUNCH_TASKS.map((t) => ({
          hustleId: hustle.id,
          title: t.title,
          description: t.description,
          priority: t.priority,
          category: t.category,
        })),
      );
      await activityRepository.log({
        hustleId: hustle.id,
        type: "HUSTLE_CREATED",
        title: `Hustle “${hustle.name}” created`,
        refId: hustle.id,
      });
      return ok({ id: hustle.id });
    } catch (err) {
      logError("hustle-service.create", err);
      return fail(toErrorMessage(err));
    }
  },

  /**
   * Creates a hustle plus its drafted suppliers/products/inventory/cost items
   * in one transaction. Cost items can't nest-create across sibling relations
   * in a single Prisma call (nested-write only goes parent -> child), so this
   * creates suppliers/products first, builds name -> id maps from what was
   * actually created (some rows may have been deselected in the preview
   * before commit), then creates cost items resolving supplierName/productName
   * against those maps.
   */
  async createFromDraft(draft: HustleDraft): Promise<ActionResult<{ id: string }>> {
    try {
      const parsed = hustleDraftSchema.parse(draft);

      const hustleId = await prisma.$transaction(async (tx) => {
        const hustle = await tx.hustle.create({
          data: {
            name: parsed.hustle.name,
            color: parsed.hustle.color,
            description: parsed.hustle.description || null,
            currency: parsed.hustle.currency,
            status: "IDEA",
          },
        });

        const suppliers = await Promise.all(
          parsed.suppliers.map((s) => {
            const v = supplierSchema.parse(s);
            return tx.supplier.create({
              data: {
                hustleId: hustle.id,
                name: v.name,
                contactName: v.contactName || null,
                phone: v.phone || null,
                email: v.email || null,
                website: v.website || null,
                city: v.city || null,
                rating: v.rating,
                preferred: v.preferred,
                notes: v.notes || null,
              },
            });
          }),
        );

        const products = await Promise.all(
          parsed.products.map((p) => {
            const v = productSchema.parse(p);
            return tx.product.create({
              data: {
                hustleId: hustle.id,
                name: v.name,
                description: v.description || null,
                notes: v.notes || null,
                status: v.status as ProductStatus,
                coverImageUrl: v.coverImageUrl || null,
              },
            });
          }),
        );

        if (parsed.inventoryItems.length > 0) {
          await tx.inventoryItem.createMany({
            data: parsed.inventoryItems.map((i) => {
              const v = inventoryItemSchema.parse(i);
              return {
                hustleId: hustle.id,
                name: v.name,
                sku: v.sku || null,
                unit: v.unit,
                quantity: v.quantity,
                reorderAt: v.reorderAt,
                unitCost: v.unitCost,
                notes: v.notes || null,
                url: v.url || null,
              };
            }),
          });
        }

        const supplierIdByName = new Map(suppliers.map((s) => [normalizeName(s.name), s.id]));
        const productIdByName = new Map(products.map((p) => [normalizeName(p.name), p.id]));

        await Promise.all(
          parsed.costItems.map((c) => {
            const v = draftCostItemSchema.parse(c);
            return tx.costItem.create({
              data: {
                hustleId: hustle.id,
                name: v.name,
                category: v.category as CostCategory,
                type: v.type as CostType,
                amount: v.amount,
                unit: v.unit,
                quantity: v.quantity,
                notes: v.notes || null,
                url: v.url || null,
                supplierId: v.supplierName ? supplierIdByName.get(normalizeName(v.supplierName)) ?? null : null,
                productId: v.productName ? productIdByName.get(normalizeName(v.productName)) ?? null : null,
              },
            });
          }),
        );

        return hustle.id;
      });

      await taskRepository.createMany(
        DEFAULT_LAUNCH_TASKS.map((t) => ({
          hustleId,
          title: t.title,
          description: t.description,
          priority: t.priority,
          category: t.category,
        })),
      );
      await activityRepository.log({
        hustleId,
        type: "HUSTLE_CREATED",
        title: `Hustle "${parsed.hustle.name}" created from AI draft`,
        refId: hustleId,
      });

      return ok({ id: hustleId });
    } catch (err) {
      logError("hustle-service.createFromDraft", err);
      return fail(toErrorMessage(err));
    }
  },

  async update(id: string, input: HustleInput): Promise<ActionResult<{ id: string }>> {
    try {
      const parsed = hustleSchema.parse(input);
      const current = await hustleRepository.findById(id);
      if (!current) return fail("Hustle not found.");
      await hustleRepository.update(id, {
        name: parsed.name,
        color: parsed.color,
        description: parsed.description || null,
        currency: parsed.currency,
        status: parsed.status as HustleStatus,
        websiteUrl: parsed.websiteUrl || null,
      });
      if (current.status !== parsed.status) {
        await activityRepository.log({
          hustleId: id,
          type: "HUSTLE_STATUS_CHANGED",
          title: `Status changed to ${parsed.status}`,
          refId: id,
        });
      }
      return ok({ id });
    } catch (err) {
      logError("hustle-service.update", err);
      return fail(toErrorMessage(err));
    }
  },

  async updateStatus(id: string, status: HustleStatus): Promise<ActionResult<{ id: string }>> {
    try {
      const current = await hustleRepository.findById(id);
      if (!current) return fail("Hustle not found.");
      await hustleRepository.updateStatus(id, status);
      if (current.status !== status) {
        await activityRepository.log({
          hustleId: id,
          type: "HUSTLE_STATUS_CHANGED",
          title: `Status changed to ${status}`,
          refId: id,
        });
      }
      return ok({ id });
    } catch (err) {
      logError("hustle-service.updateStatus", err);
      return fail(toErrorMessage(err));
    }
  },

  async delete(id: string, confirmation: string): Promise<ActionResult<{ id: string }>> {
    try {
      const hustle = await hustleRepository.findById(id);
      if (!hustle) return fail("Hustle not found.");
      if (confirmation.trim() !== hustle.name.trim()) {
        return fail("Confirmation text does not match hustle name.");
      }
      await hustleRepository.delete(id);
      return ok({ id });
    } catch (err) {
      logError("hustle-service.delete", err);
      return fail(toErrorMessage(err));
    }
  },
};

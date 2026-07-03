"use server";

import { revalidatePath } from "next/cache";
import { aiService } from "@/services/ai-service";
import { hustleService } from "@/services/hustle-service";
import { requireUser, revalidateGlobal } from "./_helpers";
import { fail, type ActionResult } from "@/lib/result";
import type { AiSettingsInput } from "@/schemas/ai";
import { costItemSchema, type CostItemInput } from "@/schemas/cost";
import { inventoryItemSchema, type InventoryItemInput } from "@/schemas/inventory";
import { supplierSchema, type SupplierInput } from "@/schemas/supplier";
import { customerSchema, type CustomerInput } from "@/schemas/customer";
import { productSchema } from "@/schemas/product";
import { tableCostItemSchema, type HustleDraft } from "@/schemas/ai-draft";
import { hustleRepository } from "@/repositories/hustle-repository";
import { costRepository } from "@/repositories/cost-repository";
import { inventoryRepository } from "@/repositories/inventory-repository";
import { supplierRepository } from "@/repositories/supplier-repository";
import { productRepository } from "@/repositories/product-repository";

export async function updateAiSettingsAction(input: AiSettingsInput): Promise<ActionResult<null>> {
  const userId = await requireUser();
  if (!userId) return fail("Not authenticated.");
  const res = await aiService.updateSettings(userId, input);
  if (res.success) revalidatePath("/account");
  return res;
}

export async function testAiConnectionAction(input: AiSettingsInput): Promise<ActionResult<null>> {
  const userId = await requireUser();
  if (!userId) return fail("Not authenticated.");
  return aiService.testConnection(userId, input);
}

export type ExtractableEntity = "cost" | "inventory" | "supplier" | "customer";

export async function extractEntityAction(
  entity: ExtractableEntity,
  rawText: string,
): Promise<ActionResult<(CostItemInput | InventoryItemInput | SupplierInput | CustomerInput)[]>> {
  const userId = await requireUser();
  if (!userId) return fail("Not authenticated.");

  switch (entity) {
    case "cost":
      return aiService.extractFromText(userId, costItemSchema, "cost item", rawText);
    case "inventory":
      return aiService.extractFromText(userId, inventoryItemSchema, "inventory item", rawText);
    case "supplier":
      return aiService.extractFromText(userId, supplierSchema, "supplier", rawText);
    case "customer":
      return aiService.extractFromText(userId, customerSchema, "customer", rawText);
  }
}

export type GeneratableTable = "cost" | "inventory" | "supplier" | "product";

export async function generateTableDraftAction(
  hustleId: string,
  table: GeneratableTable,
  count: number,
  instructions?: string,
) {
  const userId = await requireUser();
  if (!userId) return fail("Not authenticated.");

  const hustle = await hustleRepository.findById(hustleId);
  if (!hustle) return fail("Hustle not found.");
  const hustleContext = {
    name: hustle.name,
    description: hustle.description,
    currency: hustle.currency,
    status: hustle.status,
  };

  switch (table) {
    case "cost": {
      const rows = await costRepository.list(hustleId);
      const existingRows = rows.map((r) => ({
        name: r.name,
        category: r.category,
        type: r.type,
        amount: r.amount.toNumber(),
        unit: r.unit,
        quantity: r.quantity.toNumber(),
      }));
      return aiService.generateTableDraft(userId, {
        entitySchema: tableCostItemSchema,
        entityLabel: "cost item",
        hustle: hustleContext,
        existingRows,
        count,
        instructions,
      });
    }
    case "inventory": {
      const rows = await inventoryRepository.list(hustleId);
      const existingRows = rows.map((r) => ({
        name: r.name,
        sku: r.sku,
        unit: r.unit,
        quantity: r.quantity.toNumber(),
        reorderAt: r.reorderAt.toNumber(),
        unitCost: r.unitCost.toNumber(),
      }));
      return aiService.generateTableDraft(userId, {
        entitySchema: inventoryItemSchema,
        entityLabel: "inventory item",
        hustle: hustleContext,
        existingRows,
        count,
        instructions,
      });
    }
    case "supplier": {
      const rows = await supplierRepository.list(hustleId);
      const existingRows = rows.map((r) => ({
        name: r.name,
        city: r.city,
        preferred: r.preferred,
        rating: r.rating,
      }));
      return aiService.generateTableDraft(userId, {
        entitySchema: supplierSchema,
        entityLabel: "supplier",
        hustle: hustleContext,
        existingRows,
        count,
        instructions,
      });
    }
    case "product": {
      const rows = await productRepository.list(hustleId);
      const existingRows = rows.map((r) => ({ name: r.name, status: r.status }));
      return aiService.generateTableDraft(userId, {
        entitySchema: productSchema,
        entityLabel: "product",
        hustle: hustleContext,
        existingRows,
        count,
        instructions,
      });
    }
  }
}

export async function generateHustleDraftAction(prompt: string): Promise<ActionResult<HustleDraft>> {
  const userId = await requireUser();
  if (!userId) return fail("Not authenticated.");
  return aiService.generateHustleDraft(userId, prompt);
}

export async function createHustleFromDraftAction(
  draft: HustleDraft,
): Promise<ActionResult<{ id: string }>> {
  const userId = await requireUser();
  if (!userId) return fail("Not authenticated.");
  const res = await hustleService.createFromDraft(draft);
  if (res.success) revalidateGlobal();
  return res;
}

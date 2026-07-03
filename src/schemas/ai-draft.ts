import { z } from "zod";
import { hustleSchema } from "./hustle";
import { costItemSchema } from "./cost";
import { supplierSchema } from "./supplier";
import { inventoryItemSchema } from "./inventory";
import { productSchema } from "./product";

/**
 * Cost items can't reference real supplier/product DB ids while drafting a
 * brand-new hustle (nothing exists yet) - they reference siblings in the
 * draft's own suppliers/products arrays by exact name instead. Name (not
 * index) survives the user deselecting rows in the preview before commit.
 */
export const draftCostItemSchema = costItemSchema.omit({ supplierId: true, productId: true }).extend({
  supplierName: z.string().max(160).nullable().optional(),
  productName: z.string().max(160).nullable().optional(),
});

/**
 * For "generate a table" on an *existing* hustle: no sibling suppliers/products
 * are being drafted in the same call, and the AI can't reliably know real DB
 * ids, so cost item drafts here simply leave supplier/product unset - the
 * user can link them manually after import.
 */
export const tableCostItemSchema = costItemSchema.omit({ supplierId: true, productId: true });

export const hustleDraftSchema = z.object({
  hustle: hustleSchema.pick({ name: true, description: true, color: true, currency: true }),
  suppliers: z.array(supplierSchema).max(8),
  products: z.array(productSchema).max(6),
  inventoryItems: z.array(inventoryItemSchema).max(15),
  costItems: z.array(draftCostItemSchema).max(20),
});

export type DraftCostItemInput = z.infer<typeof draftCostItemSchema>;
export type HustleDraft = z.infer<typeof hustleDraftSchema>;

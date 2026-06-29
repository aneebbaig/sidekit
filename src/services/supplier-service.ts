import { supplierRepository } from "@/repositories/supplier-repository";
import { activityRepository } from "@/repositories/activity-repository";
import { supplierSchema, type SupplierInput } from "@/schemas/supplier";
import { fail, ok, type ActionResult } from "@/lib/result";
import { logError, toErrorMessage } from "@/lib/errors";

export const supplierService = {
  async list(hustleId: string) {
    return supplierRepository.list(hustleId);
  },

  async getById(id: string) {
    return supplierRepository.findById(id);
  },

  async create(hustleId: string, input: SupplierInput): Promise<ActionResult<{ id: string }>> {
    try {
      const parsed = supplierSchema.parse(input);
      const supplier = await supplierRepository.create({
        hustle: { connect: { id: hustleId } },
        name: parsed.name,
        contactName: parsed.contactName || null,
        phone: parsed.phone || null,
        email: parsed.email || null,
        website: parsed.website || null,
        city: parsed.city || null,
        rating: parsed.rating,
        preferred: parsed.preferred,
        notes: parsed.notes || null,
      });
      await activityRepository.log({
        hustleId,
        type: "SUPPLIER_ADDED",
        title: `Supplier “${parsed.name}” added`,
        refId: supplier.id,
      });
      return ok({ id: supplier.id });
    } catch (err) {
      logError("supplier-service.create", err);
      return fail(toErrorMessage(err));
    }
  },

  async update(id: string, input: SupplierInput): Promise<ActionResult<{ id: string }>> {
    try {
      const parsed = supplierSchema.parse(input);
      await supplierRepository.update(id, {
        name: parsed.name,
        contactName: parsed.contactName || null,
        phone: parsed.phone || null,
        email: parsed.email || null,
        website: parsed.website || null,
        city: parsed.city || null,
        rating: parsed.rating,
        preferred: parsed.preferred,
        notes: parsed.notes || null,
      });
      return ok({ id });
    } catch (err) {
      logError("supplier-service.update", err);
      return fail(toErrorMessage(err));
    }
  },

  async delete(id: string): Promise<ActionResult<{ id: string }>> {
    try {
      await supplierRepository.delete(id);
      return ok({ id });
    } catch (err) {
      logError("supplier-service.delete", err);
      return fail(toErrorMessage(err));
    }
  },
};

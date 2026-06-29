import { customerRepository } from "@/repositories/customer-repository";
import { activityRepository } from "@/repositories/activity-repository";
import { customerSchema, type CustomerInput } from "@/schemas/customer";
import { fail, ok, type ActionResult } from "@/lib/result";
import { logError, toErrorMessage } from "@/lib/errors";

export const customerService = {
  async list(hustleId: string) {
    return customerRepository.list(hustleId);
  },

  async getById(id: string) {
    return customerRepository.findById(id);
  },

  async create(hustleId: string, input: CustomerInput): Promise<ActionResult<{ id: string }>> {
    try {
      const parsed = customerSchema.parse(input);
      const customer = await customerRepository.create({
        hustle: { connect: { id: hustleId } },
        name: parsed.name,
        phone: parsed.phone || null,
        email: parsed.email || null,
        city: parsed.city || null,
        address: parsed.address || null,
        source: parsed.source || null,
        notes: parsed.notes || null,
      });
      await activityRepository.log({
        hustleId,
        type: "CUSTOMER_ADDED",
        title: `Customer “${parsed.name}” added`,
        refId: customer.id,
      });
      return ok({ id: customer.id });
    } catch (err) {
      logError("customer-service.create", err);
      return fail(toErrorMessage(err));
    }
  },

  async update(id: string, input: CustomerInput): Promise<ActionResult<{ id: string }>> {
    try {
      const parsed = customerSchema.parse(input);
      await customerRepository.update(id, {
        name: parsed.name,
        phone: parsed.phone || null,
        email: parsed.email || null,
        city: parsed.city || null,
        address: parsed.address || null,
        source: parsed.source || null,
        notes: parsed.notes || null,
      });
      return ok({ id });
    } catch (err) {
      logError("customer-service.update", err);
      return fail(toErrorMessage(err));
    }
  },

  async delete(id: string): Promise<ActionResult<{ id: string }>> {
    try {
      await customerRepository.delete(id);
      return ok({ id });
    } catch (err) {
      logError("customer-service.delete", err);
      return fail(toErrorMessage(err));
    }
  },
};

"use server";

import { customerService } from "@/services/customer-service";
import { withAuth, revalidateHustle } from "./_helpers";
import type { CustomerInput } from "@/schemas/customer";

export async function createCustomerAction(hustleId: string, input: CustomerInput) {
  return withAuth(async () => {
    const res = await customerService.create(hustleId, input);
    if (res.success) revalidateHustle(hustleId, "customers");
    return res;
  });
}

export async function updateCustomerAction(hustleId: string, id: string, input: CustomerInput) {
  return withAuth(async () => {
    const res = await customerService.update(id, input);
    if (res.success) revalidateHustle(hustleId, "customers", id);
    return res;
  });
}

export async function deleteCustomerAction(hustleId: string, id: string) {
  return withAuth(async () => {
    const res = await customerService.delete(id);
    if (res.success) revalidateHustle(hustleId, "customers");
    return res;
  });
}

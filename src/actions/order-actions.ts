"use server";

import { orderService } from "@/services/order-service";
import { withAuth, revalidateHustle } from "./_helpers";
import type { OrderInput, OrderPaymentInput, OrderStatusUpdateInput } from "@/schemas/order";

export async function createOrderAction(hustleId: string, input: OrderInput) {
  return withAuth(async () => {
    const res = await orderService.create(hustleId, input);
    if (res.success) revalidateHustle(hustleId, "orders", res.data.id);
    return res;
  });
}

export async function updateOrderAction(hustleId: string, id: string, input: OrderInput) {
  return withAuth(async () => {
    const res = await orderService.update(id, input);
    if (res.success) revalidateHustle(hustleId, "orders", id);
    return res;
  });
}

export async function setOrderStatusAction(hustleId: string, id: string, input: OrderStatusUpdateInput) {
  return withAuth(async () => {
    const res = await orderService.setStatus(id, input);
    if (res.success) revalidateHustle(hustleId, "orders", id);
    return res;
  });
}

export async function addOrderPaymentAction(hustleId: string, id: string, input: OrderPaymentInput) {
  return withAuth(async () => {
    const res = await orderService.addPayment(id, input);
    if (res.success) revalidateHustle(hustleId, "orders", id);
    return res;
  });
}

export async function deleteOrderAction(hustleId: string, id: string) {
  return withAuth(async () => {
    const res = await orderService.delete(id);
    if (res.success) revalidateHustle(hustleId, "orders");
    return res;
  });
}

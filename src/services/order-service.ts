import type { OrderStatus, PaymentMethod, PaymentStatus } from "@/generated/prisma/client";
import { orderRepository } from "@/repositories/order-repository";
import { activityRepository } from "@/repositories/activity-repository";
import {
  orderPaymentSchema,
  orderSchema,
  orderStatusUpdateSchema,
  type OrderInput,
  type OrderPaymentInput,
  type OrderStatusUpdateInput,
} from "@/schemas/order";
import { fail, ok, type ActionResult } from "@/lib/result";
import { logError, toErrorMessage } from "@/lib/errors";
import { toNumber } from "@/lib/currency";

function computeTotal(items: { quantity: number; unitPrice: number }[], shipping: number, discount: number): number {
  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  return Math.max(0, subtotal + shipping - discount);
}

function derivePaymentStatus(amountPaid: number, total: number): PaymentStatus {
  if (amountPaid <= 0) return "UNPAID";
  if (amountPaid >= total) return "PAID";
  return "PARTIAL";
}

async function nextOrderNumber(hustleId: string): Promise<string> {
  const last = await orderRepository.lastOrderNumber(hustleId);
  const num = last ? parseInt(last.replace(/\D/g, ""), 10) + 1 : 1;
  return `ORD-${String(num).padStart(4, "0")}`;
}

export const orderService = {
  async list(hustleId: string) {
    return orderRepository.list(hustleId);
  },

  async getById(id: string) {
    return orderRepository.findById(id);
  },

  async create(hustleId: string, input: OrderInput): Promise<ActionResult<{ id: string }>> {
    try {
      const parsed = orderSchema.parse(input);
      const total = computeTotal(parsed.items, parsed.shippingCost, parsed.discount);
      const paymentStatus = derivePaymentStatus(parsed.amountPaid, total);
      const orderNumber = await nextOrderNumber(hustleId);
      const order = await orderRepository.create({
        hustle: { connect: { id: hustleId } },
        customer: parsed.customerId ? { connect: { id: parsed.customerId } } : undefined,
        customerName: parsed.customerName,
        orderNumber,
        status: parsed.status as OrderStatus,
        paymentStatus,
        paymentMethod: (parsed.paymentMethod as PaymentMethod) || null,
        shippingCost: parsed.shippingCost,
        discount: parsed.discount,
        total,
        amountPaid: parsed.amountPaid,
        customizations: parsed.customizations.length
          ? parsed.customizations.reduce<Record<string, string>>((acc, e) => {
              acc[e.key] = e.value;
              return acc;
            }, {})
          : undefined,
        notes: parsed.notes || null,
        dueDate: parsed.dueDate ? new Date(parsed.dueDate) : null,
        items: {
          create: parsed.items.map((i) => ({
            name: i.name,
            description: i.description || null,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
          })),
        },
        events: {
          create: { status: parsed.status as OrderStatus, note: "Order created" },
        },
        payments:
          parsed.amountPaid > 0 && parsed.paymentMethod
            ? {
                create: {
                  amount: parsed.amountPaid,
                  method: parsed.paymentMethod as PaymentMethod,
                  note: "Initial payment",
                },
              }
            : undefined,
      });
      await activityRepository.log({
        hustleId,
        type: "ORDER_CREATED",
        title: `${orderNumber} • ${parsed.customerName}`,
        detail: `Total ${total.toFixed(2)}`,
        refId: order.id,
      });
      return ok({ id: order.id });
    } catch (err) {
      logError("order-service.create", err);
      return fail(toErrorMessage(err));
    }
  },

  async update(id: string, input: OrderInput): Promise<ActionResult<{ id: string }>> {
    try {
      const parsed = orderSchema.parse(input);
      const existing = await orderRepository.findById(id);
      if (!existing) return fail("Order not found.");
      const total = computeTotal(parsed.items, parsed.shippingCost, parsed.discount);
      const paymentStatus = derivePaymentStatus(parsed.amountPaid, total);
      await orderRepository.update(id, {
        customer: parsed.customerId
          ? { connect: { id: parsed.customerId } }
          : { disconnect: true },
        customerName: parsed.customerName,
        status: parsed.status as OrderStatus,
        paymentStatus,
        paymentMethod: (parsed.paymentMethod as PaymentMethod) || null,
        shippingCost: parsed.shippingCost,
        discount: parsed.discount,
        total,
        amountPaid: parsed.amountPaid,
        customizations: parsed.customizations.length
          ? parsed.customizations.reduce<Record<string, string>>((acc, e) => {
              acc[e.key] = e.value;
              return acc;
            }, {})
          : undefined,
        notes: parsed.notes || null,
        dueDate: parsed.dueDate ? new Date(parsed.dueDate) : null,
      });
      await orderRepository.replaceItems(id, parsed.items);
      if (existing.status !== parsed.status) {
        await orderRepository.addStatusEvent(id, parsed.status as OrderStatus, "Status updated via edit");
        await activityRepository.log({
          hustleId: existing.hustleId,
          type: "ORDER_STATUS_CHANGED",
          title: `${existing.orderNumber} → ${parsed.status}`,
          refId: id,
        });
      }
      return ok({ id });
    } catch (err) {
      logError("order-service.update", err);
      return fail(toErrorMessage(err));
    }
  },

  async setStatus(id: string, input: OrderStatusUpdateInput): Promise<ActionResult<{ id: string }>> {
    try {
      const parsed = orderStatusUpdateSchema.parse(input);
      const existing = await orderRepository.findById(id);
      if (!existing) return fail("Order not found.");
      await orderRepository.update(id, { status: parsed.status as OrderStatus });
      await orderRepository.addStatusEvent(id, parsed.status as OrderStatus, parsed.note || null);
      await activityRepository.log({
        hustleId: existing.hustleId,
        type: "ORDER_STATUS_CHANGED",
        title: `${existing.orderNumber} → ${parsed.status}`,
        refId: id,
      });
      return ok({ id });
    } catch (err) {
      logError("order-service.setStatus", err);
      return fail(toErrorMessage(err));
    }
  },

  async addPayment(id: string, input: OrderPaymentInput): Promise<ActionResult<{ id: string }>> {
    try {
      const parsed = orderPaymentSchema.parse(input);
      const order = await orderRepository.findById(id);
      if (!order) return fail("Order not found.");
      await orderRepository.addPayment(
        id,
        parsed.amount,
        parsed.method as PaymentMethod,
        parsed.reference || null,
        parsed.note || null,
      );
      const newAmountPaid = toNumber(order.amountPaid) + parsed.amount;
      const newStatus = derivePaymentStatus(newAmountPaid, toNumber(order.total));
      await orderRepository.updatePaymentTotals(id, newAmountPaid, newStatus);
      await activityRepository.log({
        hustleId: order.hustleId,
        type: "ORDER_PAYMENT_RECORDED",
        title: `Payment on ${order.orderNumber}`,
        detail: `Amount ${parsed.amount.toFixed(2)} via ${parsed.method}`,
        refId: id,
      });
      return ok({ id });
    } catch (err) {
      logError("order-service.addPayment", err);
      return fail(toErrorMessage(err));
    }
  },

  async delete(id: string): Promise<ActionResult<{ id: string }>> {
    try {
      await orderRepository.delete(id);
      return ok({ id });
    } catch (err) {
      logError("order-service.delete", err);
      return fail(toErrorMessage(err));
    }
  },
};

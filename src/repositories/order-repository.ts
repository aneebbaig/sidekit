import type { OrderStatus, PaymentStatus, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export const orderRepository = {
  async list(hustleId: string) {
    return prisma.order.findMany({
      where: { hustleId },
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
        customer: { select: { id: true, name: true } },
      },
    });
  },
  async findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        customer: true,
        events: { orderBy: { createdAt: "asc" } },
        payments: { orderBy: { createdAt: "desc" } },
      },
    });
  },
  async create(data: Prisma.OrderCreateInput) {
    return prisma.order.create({
      data,
      include: { items: true, events: true, payments: true },
    });
  },
  async update(id: string, data: Prisma.OrderUpdateInput) {
    return prisma.order.update({ where: { id }, data });
  },
  async delete(id: string) {
    return prisma.order.delete({ where: { id } });
  },
  async replaceItems(orderId: string, items: { name: string; description?: string | null; quantity: number; unitPrice: number }[]) {
    return prisma.$transaction([
      prisma.orderItem.deleteMany({ where: { orderId } }),
      prisma.orderItem.createMany({
        data: items.map((i) => ({ ...i, orderId })),
      }),
    ]);
  },
  async addStatusEvent(orderId: string, status: OrderStatus, note?: string | null) {
    return prisma.orderStatusEvent.create({ data: { orderId, status, note: note ?? null } });
  },
  async addPayment(
    orderId: string,
    amount: number,
    method: Prisma.OrderPaymentCreateInput["method"],
    reference?: string | null,
    note?: string | null,
  ) {
    return prisma.orderPayment.create({
      data: { orderId, amount, method, reference: reference ?? null, note: note ?? null },
    });
  },
  async updatePaymentTotals(
    orderId: string,
    amountPaid: number,
    paymentStatus: PaymentStatus,
  ) {
    return prisma.order.update({
      where: { id: orderId },
      data: { amountPaid, paymentStatus },
    });
  },
  async countByStatus(hustleId: string) {
    const grouped = await prisma.order.groupBy({
      by: ["status"],
      where: { hustleId },
      _count: { _all: true },
    });
    const map: Record<string, number> = {};
    grouped.forEach((g) => {
      map[g.status] = g._count._all;
    });
    return map;
  },
  async lastOrderNumber(hustleId: string) {
    const last = await prisma.order.findFirst({
      where: { hustleId },
      orderBy: { createdAt: "desc" },
      select: { orderNumber: true },
    });
    return last?.orderNumber ?? null;
  },
  async findByNumberAndName(orderNumber: string, customerName: string) {
    return prisma.order.findFirst({
      where: {
        orderNumber: { equals: orderNumber.trim().toUpperCase() },
        customerName: { contains: customerName.trim(), mode: "insensitive" },
      },
      select: { id: true },
    });
  },
};

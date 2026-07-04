import { PageHeader } from "@/components/shared/page-header";
import { hustleService } from "@/services/hustle-service";
import { orderService } from "@/services/order-service";
import { customerService } from "@/services/customer-service";
import { toNumber } from "@/lib/currency";
import { OrdersBoard } from "./orders-board";
import { OrderFormButton } from "./order-form-button";

export default async function OrdersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const hustle = await hustleService.getById(id);
  if (!hustle) return null;
  const [orders, customers] = await Promise.all([
    orderService.list(id),
    customerService.list(id),
  ]);

  const serialized = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.customerName,
    customerId: o.customerId,
    status: o.status,
    paymentStatus: o.paymentStatus,
    total: toNumber(o.total),
    amountPaid: toNumber(o.amountPaid),
    createdAt: o.createdAt.toISOString(),
    dueDate: o.dueDate?.toISOString() ?? null,
    itemCount: o.items.length,
  }));

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Orders"
        description="Customer orders and their lifecycle."
        action={
          <OrderFormButton
            hustleId={id}
            customers={customers.map((c) => ({ id: c.id, name: c.name }))}
          />
        }
      />
      <OrdersBoard
        hustleId={id}
        currency={hustle.currency}
        orders={serialized}
      />
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Currency } from "@/components/shared/currency";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/shared/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { hustleService } from "@/services/hustle-service";
import { orderService } from "@/services/order-service";
import { customerService } from "@/services/customer-service";
import { formatDate, formatDateTime } from "@/lib/format";
import { toNumber } from "@/lib/currency";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
} from "@/lib/constants";
import { OrderStatusUpdater } from "./order-status-updater";
import { OrderPaymentDialog } from "./order-payment-dialog";
import { OrderFormButton } from "../order-form-button";
import { DeleteOrderButton } from "./delete-order-button";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string; orderId: string }>;
}) {
  const { id, orderId } = await params;
  const hustle = await hustleService.getById(id);
  if (!hustle) notFound();
  const order = await orderService.getById(orderId);
  if (!order || order.hustleId !== id) notFound();
  const customers = await customerService.list(id);

  const customizations = (order.customizations ?? {}) as Record<string, string>;

  const formData = {
    id: order.id,
    customerId: order.customerId,
    customerName: order.customerName,
    status: order.status,
    paymentMethod: order.paymentMethod,
    shippingCost: toNumber(order.shippingCost),
    discount: toNumber(order.discount),
    amountPaid: toNumber(order.amountPaid),
    notes: order.notes,
    dueDate: order.dueDate?.toISOString() ?? null,
    items: order.items.map((i) => ({
      name: i.name,
      description: i.description,
      quantity: i.quantity,
      unitPrice: toNumber(i.unitPrice),
    })),
    customizations,
  };

  const outstanding = Math.max(0, toNumber(order.total) - toNumber(order.amountPaid));

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title={`${order.orderNumber}`}
        description={`${order.customerName} • Created ${formatDate(order.createdAt)}`}
        breadcrumbs={[
          { label: "Orders", href: `/hustles/${id}/orders` },
          { label: order.orderNumber },
        ]}
        action={
          <div className="flex items-center gap-2">
            <OrderFormButton
              hustleId={id}
              customers={customers.map((c) => ({ id: c.id, name: c.name }))}
              order={formData}
              trigger={
                <Button variant="outline" className="gap-2">
                  <Pencil className="h-4 w-4" /> Edit
                </Button>
              }
            />
            <DeleteOrderButton
              hustleId={id}
              orderId={order.id}
              orderNumber={order.orderNumber}
            />
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit price</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((i) => (
                    <TableRow key={i.id}>
                      <TableCell>
                        <p className="font-medium">{i.name}</p>
                        {i.description ? (
                          <p className="text-xs text-muted-foreground">{i.description}</p>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-right font-mono">{i.quantity}</TableCell>
                      <TableCell className="text-right">
                        <Currency value={i.unitPrice} currency={hustle.currency} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Currency
                          value={toNumber(i.unitPrice) * i.quantity}
                          currency={hustle.currency}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="border-t border-border p-5 space-y-1 text-sm">
                <Row label="Subtotal" value={<Currency value={order.items.reduce((s, i) => s + toNumber(i.unitPrice) * i.quantity, 0)} currency={hustle.currency} />} />
                <Row label="Shipping" value={<Currency value={order.shippingCost} currency={hustle.currency} />} />
                <Row label="Discount" value={<Currency value={order.discount} currency={hustle.currency} tone="negative" />} />
                <div className="border-t border-border mt-2 pt-2">
                  <Row label="Total" emphasize value={<Currency value={order.total} currency={hustle.currency} />} />
                  <Row label="Paid" value={<Currency value={order.amountPaid} currency={hustle.currency} />} />
                  <Row
                    label="Outstanding"
                    emphasize
                    value={<Currency value={outstanding} currency={hustle.currency} tone={outstanding > 0 ? "negative" : "muted"} />}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {Object.keys(customizations).length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Customizations</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  {Object.entries(customizations).map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>
          ) : null}

          {order.notes ? (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">{order.notes}</p>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>Status timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                {order.events.map((e) => (
                  <li key={e.id} className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{ORDER_STATUS_LABELS[e.status]}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(e.createdAt)}
                        </span>
                      </div>
                      {e.note ? <p className="text-xs text-muted-foreground">{e.note}</p> : null}
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <OrderStatusBadge status={order.status} />
              <OrderStatusUpdater hustleId={id} orderId={order.id} current={order.status} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <PaymentStatusBadge status={order.paymentStatus} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Method</span>
                <span>{order.paymentMethod ? PAYMENT_METHOD_LABELS[order.paymentMethod] : "-"}</span>
              </div>
              <OrderPaymentDialog hustleId={id} orderId={order.id} />
              {order.payments.length > 0 ? (
                <ul className="space-y-2 border-t border-border pt-3">
                  {order.payments.map((p) => (
                    <li key={p.id} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {PAYMENT_METHOD_LABELS[p.method]} • {formatDate(p.createdAt)}
                      </span>
                      <Currency value={p.amount} currency={hustle.currency} />
                    </li>
                  ))}
                </ul>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium">{order.customerName}</p>
              {order.customer ? (
                <Link
                  href={`/hustles/${id}/customers/${order.customer.id}`}
                  className="text-xs text-primary hover:underline"
                >
                  View profile →
                </Link>
              ) : (
                <p className="text-xs text-muted-foreground">Ad-hoc - no profile linked.</p>
              )}
              {order.dueDate ? (
                <p className="text-xs text-muted-foreground pt-2">
                  Due {formatDate(order.dueDate)}
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: React.ReactNode;
  emphasize?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between ${emphasize ? "font-medium" : ""}`}>
      <span className="text-muted-foreground">{label}</span>
      {value}
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Currency } from "@/components/shared/currency";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { hustleService } from "@/services/hustle-service";
import { customerService } from "@/services/customer-service";
import { formatDate } from "@/lib/format";
import { toNumber } from "@/lib/currency";
import { CustomerFormButton } from "../customer-form-button";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string; customerId: string }>;
}) {
  const { id, customerId } = await params;
  const hustle = await hustleService.getById(id);
  if (!hustle) notFound();
  const customer = await customerService.getById(customerId);
  if (!customer || customer.hustleId !== id) notFound();

  const totalSpent = customer.orders.reduce((s, o) => s + toNumber(o.total), 0);

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title={customer.name}
        breadcrumbs={[
          { label: "Customers", href: `/hustles/${id}/customers` },
          { label: customer.name },
        ]}
        action={
          <CustomerFormButton
            hustleId={id}
            customer={{
              id: customer.id,
              name: customer.name,
              phone: customer.phone,
              email: customer.email,
              city: customer.city,
              address: customer.address,
              source: customer.source,
              notes: customer.notes,
            }}
            trigger={<Button variant="outline">Edit</Button>}
          />
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Phone" value={customer.phone} />
            <Row label="Email" value={customer.email} />
            <Row label="City" value={customer.city} />
            <Row label="Source" value={customer.source} />
            <Row label="Address" value={customer.address} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Lifetime</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Orders</span>
              <span className="font-mono">{customer.orders.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total spent</span>
              <Currency value={totalSpent} currency={hustle.currency} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">{customer.notes || "—"}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {customer.orders.length === 0 ? (
            <EmptyState title="No orders yet" description="Orders linked to this customer will appear here." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customer.orders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell>
                      <Link
                        href={`/hustles/${id}/orders/${o.id}`}
                        className="font-medium hover:text-primary"
                      >
                        {o.orderNumber}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <OrderStatusBadge status={o.status} />
                    </TableCell>
                    <TableCell>
                      <PaymentStatusBadge status={o.paymentStatus} />
                    </TableCell>
                    <TableCell>{formatDate(o.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Currency value={o.total} currency={hustle.currency} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-xs uppercase tracking-wider text-muted-foreground w-24 shrink-0">{label}</span>
      <span className="text-right break-words">{value || "—"}</span>
    </div>
  );
}

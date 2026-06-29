"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { OrderStatus, PaymentStatus } from "@/generated/prisma/client";
import { Search } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Currency } from "@/components/shared/currency";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/shared/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUSES,
  PAYMENT_STATUS_LABELS,
} from "@/lib/constants";
import { formatDate } from "@/lib/format";

interface OrderRow {
  id: string;
  orderNumber: string;
  customerName: string;
  customerId: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  total: number;
  amountPaid: number;
  createdAt: string;
  dueDate: string | null;
  itemCount: number;
}

interface Props {
  hustleId: string;
  currency: string;
  orders: OrderRow[];
}

export function OrdersBoard({ hustleId, currency, orders }: Props) {
  const [statusTab, setStatusTab] = useState<string>("ALL");
  const [paymentFilter, setPaymentFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  const counts = useMemo(() => {
    const map: Record<string, number> = { ALL: orders.length };
    ORDER_STATUSES.forEach((s) => {
      map[s] = orders.filter((o) => o.status === s).length;
    });
    return map;
  }, [orders]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return orders.filter((o) => {
      if (statusTab !== "ALL" && o.status !== statusTab) return false;
      if (paymentFilter !== "ALL" && o.paymentStatus !== paymentFilter) return false;
      if (!q) return true;
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q)
      );
    });
  }, [orders, statusTab, paymentFilter, search]);

  return (
    <div className="space-y-4">
      <Tabs value={statusTab} onValueChange={setStatusTab}>
        <TabsList className="overflow-x-auto max-w-full h-auto p-1 flex-wrap">
          <TabsTrigger value="ALL" className="gap-2">
            All <span className="text-xs text-muted-foreground">{counts.ALL}</span>
          </TabsTrigger>
          {ORDER_STATUSES.map((s) => (
            <TabsTrigger key={s} value={s} className="gap-2">
              {ORDER_STATUS_LABELS[s]}
              <span className="text-xs text-muted-foreground">{counts[s]}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by order # or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="w-44">
          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Payment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All payment</SelectItem>
              {PAYMENT_STATUSES.map((p) => (
                <SelectItem key={p} value={p}>
                  {PAYMENT_STATUS_LABELS[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No orders match" description="Try changing filters or search." />
      ) : (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Due</TableHead>
                <TableHead className="text-right">Paid / Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((o) => (
                <TableRow key={o.id}>
                  <TableCell>
                    <Link
                      href={`/hustles/${hustleId}/orders/${o.id}`}
                      className="font-mono text-sm hover:text-primary"
                    >
                      {o.orderNumber}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {o.itemCount} item{o.itemCount === 1 ? "" : "s"} • {formatDate(o.createdAt)}
                    </p>
                  </TableCell>
                  <TableCell>{o.customerName}</TableCell>
                  <TableCell>
                    <OrderStatusBadge status={o.status} />
                  </TableCell>
                  <TableCell>
                    <PaymentStatusBadge status={o.paymentStatus} />
                  </TableCell>
                  <TableCell>{o.dueDate ? formatDate(o.dueDate) : "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end leading-tight">
                      <Currency value={o.amountPaid} currency={currency} className="text-xs text-muted-foreground" />
                      <Currency value={o.total} currency={currency} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

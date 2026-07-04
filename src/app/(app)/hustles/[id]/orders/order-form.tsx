"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { orderSchema, type OrderInput } from "@/schemas/order";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
} from "@/lib/constants";
import { createOrderAction, updateOrderAction } from "@/actions/order-actions";

export interface OrderFormData {
  id: string;
  customerId: string | null;
  customerName: string;
  status: string;
  paymentMethod: string | null;
  shippingCost: number;
  discount: number;
  amountPaid: number;
  notes: string | null;
  dueDate: string | null;
  items: { name: string; description: string | null; quantity: number; unitPrice: number }[];
  customizations: Record<string, string>;
}

interface Props {
  hustleId: string;
  customers: { id: string; name: string }[];
  order?: OrderFormData;
  onDone?: () => void;
}

export function OrderForm({ hustleId, customers, order, onDone }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const defaultCustomizations = order
    ? Object.entries(order.customizations || {}).map(([key, value]) => ({ key, value }))
    : [];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customerId: order?.customerId ?? "",
      customerName: order?.customerName ?? "",
      status: (order?.status as OrderInput["status"]) ?? "PENDING",
      paymentMethod: (order?.paymentMethod as OrderInput["paymentMethod"]) ?? "",
      shippingCost: order?.shippingCost ?? 0,
      discount: order?.discount ?? 0,
      amountPaid: order?.amountPaid ?? 0,
      notes: order?.notes ?? "",
      dueDate: order?.dueDate ? order.dueDate.slice(0, 10) : "",
      items: order?.items?.map((i) => ({
        name: i.name,
        description: i.description ?? "",
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })) ?? [{ name: "", description: "", quantity: 1, unitPrice: 0 }],
      customizations: defaultCustomizations,
    },
  });

  const itemsArray = useFieldArray({ control, name: "items" });
  const customsArray = useFieldArray({ control, name: "customizations" });

  const status = watch("status");
  const paymentMethod = watch("paymentMethod");
  const customerId = watch("customerId");
  const items = watch("items");
  const shipping = Number(watch("shippingCost") ?? 0);
  const discount = Number(watch("discount") ?? 0);

  const subtotal = items.reduce(
    (s, i) => s + Number(i.quantity ?? 0) * Number(i.unitPrice ?? 0),
    0,
  );
  const total = Math.max(0, subtotal + shipping - discount);

  function handleCustomerChange(value: string) {
    if (value === "NONE") {
      setValue("customerId", "");
      return;
    }
    setValue("customerId", value);
    const c = customers.find((x) => x.id === value);
    if (c) setValue("customerName", c.name);
  }

  async function onSubmit(values: OrderInput) {
    setPending(true);
    const res = order
      ? await updateOrderAction(hustleId, order.id, values)
      : await createOrderAction(hustleId, values);
    setPending(false);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success(order ? "Order updated." : "Order created.");
    onDone?.();
    if (!order) router.push(`/hustles/${hustleId}/orders/${res.data.id}`);
    else router.refresh();
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Customer (existing)</Label>
          <Select value={customerId || "NONE"} onValueChange={handleCustomerChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select customer..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NONE">Ad-hoc (no link)</SelectItem>
              {customers.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Customer name (display)</Label>
          <Input {...register("customerName")} />
          {errors.customerName ? (
            <p className="text-xs text-destructive">{errors.customerName.message}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Line items</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => itemsArray.append({ name: "", description: "", quantity: 1, unitPrice: 0 })}
          >
            <Plus className="h-3.5 w-3.5" /> Add item
          </Button>
        </div>
        <div className="space-y-2">
          {itemsArray.fields.map((field, i) => (
            <div key={field.id} className="grid grid-cols-[1fr_70px_100px_36px] gap-2 items-start">
              <div className="space-y-1">
                <Input placeholder="Product name" {...register(`items.${i}.name`)} />
                <Input
                  placeholder="Description (optional)"
                  className="text-xs"
                  {...register(`items.${i}.description`)}
                />
              </div>
              <Input
                placeholder="Qty"
                type="number"
                min={1}
                {...register(`items.${i}.quantity`)}
              />
              <Input
                placeholder="Unit price"
                type="number"
                step="0.01"
                {...register(`items.${i}.unitPrice`)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive"
                onClick={() => itemsArray.remove(i)}
                disabled={itemsArray.fields.length <= 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        {errors.items ? <p className="text-xs text-destructive">{errors.items.message}</p> : null}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2">
          <Label>Shipping</Label>
          <Input type="number" step="0.01" {...register("shippingCost")} />
        </div>
        <div className="space-y-2">
          <Label>Discount</Label>
          <Input type="number" step="0.01" {...register("discount")} />
        </div>
        <div className="space-y-2">
          <Label>Total</Label>
          <Input value={total.toFixed(2)} readOnly disabled className="font-mono" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={(v) => setValue("status", v as OrderInput["status"])}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ORDER_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {ORDER_STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Due date</Label>
          <Input type="date" {...register("dueDate")} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Payment method</Label>
          <Select
            value={paymentMethod || "NONE"}
            onValueChange={(v) =>
              setValue("paymentMethod", v === "NONE" ? "" : (v as OrderInput["paymentMethod"]))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NONE">None</SelectItem>
              {PAYMENT_METHODS.map((p) => (
                <SelectItem key={p} value={p}>
                  {PAYMENT_METHOD_LABELS[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Amount paid</Label>
          <Input type="number" step="0.01" {...register("amountPaid")} />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Customizations</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => customsArray.append({ key: "", value: "" })}
          >
            <Plus className="h-3.5 w-3.5" /> Add field
          </Button>
        </div>
        <div className="space-y-2">
          {customsArray.fields.map((field, i) => (
            <div key={field.id} className="grid grid-cols-[1fr_2fr_36px] gap-2">
              <Input placeholder="Field (e.g. Names)" {...register(`customizations.${i}.key`)} />
              <Input placeholder="Value (e.g. Aisha & Bilal)" {...register(`customizations.${i}.value`)} />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive"
                onClick={() => customsArray.remove(i)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea rows={2} {...register("notes")} />
      </div>

      <div className="flex justify-end gap-2 sticky bottom-0 bg-card pt-3">
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : order ? "Save changes" : "Create order"}
        </Button>
      </div>
    </form>
  );
}

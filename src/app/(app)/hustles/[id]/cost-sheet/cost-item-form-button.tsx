"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { CostCategory, CostType } from "@/generated/prisma/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { costItemSchema, type CostItemInput } from "@/schemas/cost";
import {
  COST_CATEGORIES,
  COST_CATEGORY_LABELS,
  COST_TYPES,
  COST_TYPE_LABELS,
} from "@/lib/constants";
import { createCostItemAction, updateCostItemAction } from "@/actions/cost-actions";

interface ItemData {
  id: string;
  name: string;
  category: CostCategory;
  type: CostType;
  amount: number;
  unit: string;
  quantity: number;
  supplierId: string | null;
  productId: string | null;
  notes: string | null;
  url: string | null;
}

interface Props {
  hustleId: string;
  suppliers: { id: string; name: string }[];
  products: { id: string; name: string }[];
  item?: ItemData;
  trigger?: React.ReactNode;
  defaultProductId?: string;
}

export function CostItemFormButton({ hustleId, suppliers, products, item, trigger, defaultProductId }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(costItemSchema),
    defaultValues: {
      name: item?.name ?? "",
      category: (item?.category as CostItemInput["category"]) ?? "RAW_MATERIAL",
      type: (item?.type as CostItemInput["type"]) ?? "VARIABLE",
      amount: item?.amount ?? 0,
      unit: item?.unit ?? "unit",
      quantity: item?.quantity ?? 1,
      supplierId: item?.supplierId ?? "",
      productId: item?.productId ?? defaultProductId ?? "",
      notes: item?.notes ?? "",
      url: item?.url ?? "",
    },
  });

  const category = watch("category");
  const type = watch("type");
  const supplierId = watch("supplierId");
  const productId = watch("productId");

  async function onSubmit(values: CostItemInput) {
    setPending(true);
    const res = item
      ? await updateCostItemAction(hustleId, item.id, values)
      : await createCostItemAction(hustleId, values);
    setPending(false);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success(item ? "Cost item updated." : "Cost item added.");
    setOpen(false);
    reset();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> New cost item
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item ? "Edit cost item" : "Add cost item"}</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-2">
            <Label>Name</Label>
            <Input {...register("name")} />
            {errors.name ? <p className="text-xs text-rose-300">{errors.name.message}</p> : null}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={category}
                onValueChange={(v) => setValue("category", v as CostItemInput["category"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COST_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {COST_CATEGORY_LABELS[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setValue("type", v as CostItemInput["type"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COST_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {COST_TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input type="number" step="0.01" {...register("amount")} />
            </div>
            <div className="space-y-2">
              <Label>Unit</Label>
              <Input {...register("unit")} />
            </div>
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input type="number" step="0.01" {...register("quantity")} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Product (optional)</Label>
              <Select
                value={productId || "NONE"}
                onValueChange={(v) => setValue("productId", v === "NONE" ? "" : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Shared / overhead" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">Shared / overhead</SelectItem>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Supplier (optional)</Label>
              <Select
                value={supplierId || "NONE"}
                onValueChange={(v) => setValue("supplierId", v === "NONE" ? "" : v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">None</SelectItem>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea rows={2} {...register("notes")} />
          </div>
          <div className="space-y-2">
            <Label>URL (optional)</Label>
            <Input type="url" placeholder="https://" {...register("url")} />
            {errors.url ? <p className="text-xs text-rose-300">{errors.url.message}</p> : null}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : item ? "Save changes" : "Add item"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

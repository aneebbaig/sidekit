"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
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
import { inventoryItemSchema, type InventoryItemInput } from "@/schemas/inventory";
import {
  createInventoryItemAction,
  updateInventoryItemAction,
} from "@/actions/inventory-actions";
import { AiFillPanel } from "@/components/shared/ai-fill-panel";

export interface InventoryItemData {
  id: string;
  name: string;
  sku: string | null;
  unit: string;
  quantity: number;
  reorderAt: number;
  unitCost: number;
  notes: string | null;
  url: string | null;
}

interface Props {
  hustleId: string;
  item?: InventoryItemData;
  trigger?: React.ReactNode;
}

export function InventoryFormButton({ hustleId, item, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(inventoryItemSchema),
    defaultValues: {
      name: item?.name ?? "",
      sku: item?.sku ?? "",
      unit: item?.unit ?? "unit",
      quantity: item?.quantity ?? 0,
      reorderAt: item?.reorderAt ?? 0,
      unitCost: item?.unitCost ?? 0,
      notes: item?.notes ?? "",
      url: item?.url ?? "",
    },
  });

  function handleAiExtracted(data: InventoryItemInput) {
    reset({ ...getValues(), ...data });
  }

  async function onSubmit(values: InventoryItemInput) {
    setPending(true);
    const res = item
      ? await updateInventoryItemAction(hustleId, item.id, values)
      : await createInventoryItemAction(hustleId, values);
    setPending(false);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success(item ? "Item updated." : "Item added.");
    setOpen(false);
    reset();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> New item
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item ? "Edit inventory item" : "Add inventory item"}</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <AiFillPanel<InventoryItemInput>
            entity="inventory"
            onExtracted={handleAiExtracted}
            placeholder="Paste a packing list line or note, e.g. 'Kraft boxes small, 200 in stock, reorder at 50, cost 12 each'"
          />
          <div className="space-y-2">
            <Label>Name</Label>
            <Input {...register("name")} />
            {errors.name ? <p className="text-xs text-destructive">{errors.name.message}</p> : null}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>SKU</Label>
              <Input {...register("sku")} />
            </div>
            <div className="space-y-2">
              <Label>Unit</Label>
              <Input {...register("unit")} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input type="number" step="0.01" {...register("quantity")} />
            </div>
            <div className="space-y-2">
              <Label>Reorder at</Label>
              <Input type="number" step="0.01" {...register("reorderAt")} />
            </div>
            <div className="space-y-2">
              <Label>Unit cost</Label>
              <Input type="number" step="0.01" {...register("unitCost")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea rows={2} {...register("notes")} />
          </div>
          <div className="space-y-2">
            <Label>URL (optional)</Label>
            <Input type="url" placeholder="https://" {...register("url")} />
            {errors.url ? <p className="text-xs text-destructive">{errors.url.message}</p> : null}
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

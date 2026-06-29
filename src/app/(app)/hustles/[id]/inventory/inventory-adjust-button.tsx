"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowDownUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { inventoryAdjustmentSchema, type InventoryAdjustmentInput } from "@/schemas/inventory";
import { adjustInventoryAction } from "@/actions/inventory-actions";

interface Props {
  hustleId: string;
  itemId: string;
  trigger?: React.ReactNode;
}

export function InventoryAdjustButton({ hustleId, itemId, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(inventoryAdjustmentSchema),
    defaultValues: { delta: 0, reason: "" },
  });

  async function onSubmit(values: InventoryAdjustmentInput) {
    setPending(true);
    const res = await adjustInventoryAction(hustleId, itemId, values);
    setPending(false);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success("Stock adjusted.");
    reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowDownUp className="h-3.5 w-3.5" /> Adjust
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust stock</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-2">
            <Label>Delta (use negative for outflow)</Label>
            <Input type="number" step="0.01" {...register("delta")} />
            {errors.delta ? <p className="text-xs text-rose-300">{errors.delta.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label>Reason</Label>
            <Input placeholder="Restock, used in batch, breakage..." {...register("reason")} />
            {errors.reason ? <p className="text-xs text-rose-300">{errors.reason.message}</p> : null}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : "Save adjustment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

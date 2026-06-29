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
import { Badge } from "@/components/ui/badge";
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
import {
  productSchema,
  type ProductInput,
  type ProductStatusType,
  PRODUCT_STATUSES,
  PRODUCT_STATUS_LABELS,
  PRODUCT_STATUS_BADGE_VARIANTS,
} from "@/schemas/product";
import { createProductAction, updateProductAction } from "@/actions/product-actions";

export interface ProductData {
  id: string;
  name: string;
  description: string | null;
  notes: string | null;
  status: ProductStatusType;
  coverImageUrl: string | null;
}

interface Props {
  hustleId: string;
  item?: ProductData;
  trigger?: React.ReactNode;
}

export function ProductFormButton({ hustleId, item, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const defaultValues = {
    name: item?.name ?? "",
    description: item?.description ?? "",
    notes: item?.notes ?? "",
    status: (item?.status ?? "RESEARCH") as ProductStatusType,
    coverImageUrl: item?.coverImageUrl ?? "",
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues,
  });

  const status = watch("status");

  async function onSubmit(values: ProductInput) {
    setPending(true);
    const res = item
      ? await updateProductAction(hustleId, item.id, values)
      : await createProductAction(hustleId, values);
    setPending(false);
    if (!res.success) { toast.error(res.error); return; }
    toast.success(item ? "Product updated." : "Product added.");
    setOpen(false);
    reset();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => {
      setOpen(v);
      if (v) reset(defaultValues);
    }}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm" className="gap-1">
            <Plus className="h-3 w-3" /> Add product
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{item ? "Edit product" : "Add product"}</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-2">
            <Label>Product name</Label>
            <Input {...register("name")} placeholder="e.g. Rose Gold Nikkah Plaque" />
            {errors.name ? <p className="text-xs text-rose-300">{errors.name.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={status}
              onValueChange={(v) => setValue("status", v as ProductStatusType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    <div className="flex items-center gap-2">
                      <Badge variant={PRODUCT_STATUS_BADGE_VARIANTS[s]} className="text-[10px]">
                        {PRODUCT_STATUS_LABELS[s]}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Description (optional)</Label>
            <Input {...register("description")} placeholder="Short description" />
          </div>
          <div className="space-y-2">
            <Label>Cover image URL (optional)</Label>
            <Input type="url" placeholder="https://" {...register("coverImageUrl")} />
            {errors.coverImageUrl ? (
              <p className="text-xs text-rose-300">{errors.coverImageUrl.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea rows={2} {...register("notes")} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : item ? "Save changes" : "Add product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { supplierSchema, type SupplierInput } from "@/schemas/supplier";
import { createSupplierAction, updateSupplierAction } from "@/actions/supplier-actions";
import { AiFillPanel } from "@/components/shared/ai-fill-panel";

export interface SupplierData {
  id: string;
  name: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  city: string | null;
  rating: number;
  preferred: boolean;
  notes: string | null;
}

interface Props {
  hustleId: string;
  supplier?: SupplierData;
  onDone?: () => void;
}

export function SupplierForm({ hustleId, supplier, onDone }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: supplier?.name ?? "",
      contactName: supplier?.contactName ?? "",
      phone: supplier?.phone ?? "",
      email: supplier?.email ?? "",
      website: supplier?.website ?? "",
      city: supplier?.city ?? "",
      rating: supplier?.rating ?? 0,
      preferred: supplier?.preferred ?? false,
      notes: supplier?.notes ?? "",
    },
  });

  const preferred = watch("preferred");
  const rating = Number(watch("rating") ?? 0);

  function handleAiExtracted(data: SupplierInput) {
    reset({ ...getValues(), ...data });
  }

  async function onSubmit(values: SupplierInput) {
    setPending(true);
    const res = supplier
      ? await updateSupplierAction(hustleId, supplier.id, values)
      : await createSupplierAction(hustleId, values);
    setPending(false);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success(supplier ? "Supplier updated." : "Supplier created.");
    onDone?.();
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <AiFillPanel<SupplierInput>
        entity="supplier"
        onExtracted={handleAiExtracted}
        placeholder="Paste a WhatsApp message, business card text, or note about this supplier"
      />
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Name</Label>
          <Input {...register("name")} />
          {errors.name ? <p className="text-xs text-destructive">{errors.name.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label>Contact name</Label>
          <Input {...register("contactName")} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input {...register("phone")} />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input type="email" {...register("email")} />
          {errors.email ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Website</Label>
          <Input {...register("website")} />
          {errors.website ? <p className="text-xs text-destructive">{errors.website.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label>City</Label>
          <Input {...register("city")} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Rating ({rating}/5)</Label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setValue("rating", rating === n ? 0 : n)}
                className={`h-7 w-7 rounded text-sm font-mono transition-colors ${
                  rating >= n ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label className="block">Preferred</Label>
          <div className="flex items-center h-9">
            <Switch checked={preferred} onCheckedChange={(v) => setValue("preferred", v)} />
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea rows={3} {...register("notes")} />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : supplier ? "Save changes" : "Create supplier"}
        </Button>
      </div>
    </form>
  );
}

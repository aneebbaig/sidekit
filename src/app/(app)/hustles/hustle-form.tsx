"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
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
import { hustleSchema, type HustleInput } from "@/schemas/hustle";
import {
  CURRENCY_OPTIONS,
  HUSTLE_COLORS,
  HUSTLE_STATUSES,
  HUSTLE_STATUS_LABELS,
} from "@/lib/constants";
import { createHustleAction, updateHustleAction } from "@/actions/hustle-actions";
import type { HustleStatus } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

export type CreatedHustle = {
  id: string;
  name: string;
  color: string;
  description: string | null;
  currency: string;
  status: HustleStatus;
  createdAt: Date;
};

interface Props {
  hustle?: {
    id: string;
    name: string;
    color: string;
    description: string | null;
    currency: string;
    status: string;
    websiteUrl?: string | null;
  };
  onDone?: (created?: CreatedHustle) => void;
}

export function HustleForm({ hustle, onDone }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(hustleSchema),
    defaultValues: {
      name: hustle?.name ?? "",
      color: hustle?.color ?? "#14b8a6",
      description: hustle?.description ?? "",
      currency: (hustle?.currency as HustleInput["currency"]) ?? "PKR",
      status: (hustle?.status as HustleInput["status"]) ?? "IDEA",
      websiteUrl: hustle?.websiteUrl ?? "",
    },
  });

  const currency = watch("currency");
  const status = watch("status");
  const color = watch("color");

  async function onSubmit(values: HustleInput) {
    setPending(true);
    const res = hustle
      ? await updateHustleAction(hustle.id, values)
      : await createHustleAction(values);
    setPending(false);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success(hustle ? "Hustle updated." : "Hustle created.");
    if (!hustle) {
      onDone?.({
        id: res.data.id,
        name: values.name,
        color: values.color,
        description: values.description ?? null,
        currency: values.currency,
        status: values.status as HustleStatus,
        createdAt: new Date(),
      });
    } else {
      onDone?.();
      router.refresh();
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register("name")} />
        {errors.name ? <p className="text-xs text-destructive">{errors.name.message}</p> : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" rows={3} {...register("description")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="websiteUrl">Website URL</Label>
        <Input id="websiteUrl" placeholder="https://daastan.pk" {...register("websiteUrl")} />
        {errors.websiteUrl ? (
          <p className="text-xs text-destructive">{errors.websiteUrl.message}</p>
        ) : null}
        <p className="text-xs text-muted-foreground">Shown on the order tracking page as a &quot;Back to site&quot; link.</p>
      </div>
      <div className="space-y-2">
        <Label>Color</Label>
        <div className="flex flex-wrap gap-2">
          {HUSTLE_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setValue("color", c)}
              className={cn(
                "h-8 w-8 rounded-full transition-all",
                color === c
                  ? "ring-2 ring-offset-2 ring-offset-background ring-primary scale-110"
                  : "hover:scale-105 opacity-70 hover:opacity-100",
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        {errors.color ? <p className="text-xs text-destructive">{errors.color.message}</p> : null}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Currency</Label>
          <Select value={currency} onValueChange={(v) => setValue("currency", v as HustleInput["currency"])}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCY_OPTIONS.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={(v) => setValue("status", v as HustleInput["status"])}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {HUSTLE_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {HUSTLE_STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : hustle ? "Save changes" : "Create hustle"}
        </Button>
      </div>
    </form>
  );
}

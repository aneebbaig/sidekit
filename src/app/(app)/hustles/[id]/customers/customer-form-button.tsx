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
import { customerSchema, type CustomerInput } from "@/schemas/customer";
import {
  createCustomerAction,
  updateCustomerAction,
} from "@/actions/customer-actions";
import { AiFillPanel } from "@/components/shared/ai-fill-panel";

export interface CustomerData {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  city: string | null;
  address: string | null;
  source: string | null;
  notes: string | null;
}

interface Props {
  hustleId: string;
  customer?: CustomerData;
  trigger?: React.ReactNode;
}

export function CustomerFormButton({ hustleId, customer, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: customer?.name ?? "",
      phone: customer?.phone ?? "",
      email: customer?.email ?? "",
      city: customer?.city ?? "",
      address: customer?.address ?? "",
      source: customer?.source ?? "",
      notes: customer?.notes ?? "",
    },
  });

  function handleAiExtracted(data: CustomerInput) {
    reset({ ...getValues(), ...data });
  }

  async function onSubmit(values: CustomerInput) {
    setPending(true);
    const res = customer
      ? await updateCustomerAction(hustleId, customer.id, values)
      : await createCustomerAction(hustleId, values);
    setPending(false);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success(customer ? "Customer updated." : "Customer added.");
    setOpen(false);
    reset();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> New customer
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{customer ? "Edit customer" : "New customer"}</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <AiFillPanel<CustomerInput>
            entity="customer"
            onExtracted={handleAiExtracted}
            placeholder="Paste a contact card or message about this customer"
          />
          <div className="space-y-2">
            <Label>Name</Label>
            <Input {...register("name")} />
            {errors.name ? <p className="text-xs text-destructive">{errors.name.message}</p> : null}
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
              <Label>City</Label>
              <Input {...register("city")} />
            </div>
            <div className="space-y-2">
              <Label>Acquisition source</Label>
              <Input placeholder="Instagram, referral..." {...register("source")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Address</Label>
            <Textarea rows={2} {...register("address")} />
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea rows={2} {...register("notes")} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : customer ? "Save changes" : "Add customer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

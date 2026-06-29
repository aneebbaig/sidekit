"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Wallet } from "lucide-react";
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
import { orderPaymentSchema, type OrderPaymentInput } from "@/schemas/order";
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from "@/lib/constants";
import { addOrderPaymentAction } from "@/actions/order-actions";

interface Props {
  hustleId: string;
  orderId: string;
}

export function OrderPaymentDialog({ hustleId, orderId }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(orderPaymentSchema),
    defaultValues: { amount: 0, method: "CASH", reference: "", note: "" },
  });

  const method = watch("method");

  async function onSubmit(values: OrderPaymentInput) {
    setPending(true);
    const res = await addOrderPaymentAction(hustleId, orderId, values);
    setPending(false);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success("Payment recorded.");
    reset();
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full gap-2">
          <Wallet className="h-4 w-4" /> Record payment
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record payment</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input type="number" step="0.01" {...register("amount")} />
              {errors.amount ? <p className="text-xs text-rose-300">{errors.amount.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label>Method</Label>
              <Select
                value={method}
                onValueChange={(v) => setValue("method", v as OrderPaymentInput["method"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {PAYMENT_METHOD_LABELS[m]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Reference (optional)</Label>
            <Input {...register("reference")} />
          </div>
          <div className="space-y-2">
            <Label>Note (optional)</Label>
            <Textarea rows={2} {...register("note")} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : "Record"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

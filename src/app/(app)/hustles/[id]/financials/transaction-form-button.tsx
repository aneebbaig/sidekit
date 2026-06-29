"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { TransactionType } from "@/generated/prisma/client";
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
import {
  EXPENSE_CATEGORY_SUGGESTIONS,
  INCOME_CATEGORY_SUGGESTIONS,
  TRANSACTION_TYPES,
} from "@/lib/constants";
import { transactionSchema, type TransactionInput } from "@/schemas/transaction";
import {
  createTransactionAction,
  updateTransactionAction,
} from "@/actions/transaction-actions";

export interface TransactionData {
  id: string;
  type: TransactionType;
  category: string;
  description: string | null;
  amount: number;
  date: string;
  reference: string | null;
}

interface Props {
  hustleId: string;
  transaction?: TransactionData;
  trigger?: React.ReactNode;
}

export function TransactionFormButton({ hustleId, transaction, trigger }: Props) {
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
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: (transaction?.type as TransactionInput["type"]) ?? "EXPENSE",
      category: transaction?.category ?? "",
      description: transaction?.description ?? "",
      amount: transaction?.amount ?? 0,
      date: transaction?.date
        ? transaction.date.slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      reference: transaction?.reference ?? "",
    },
  });

  const type = watch("type");
  const category = watch("category");
  const suggestions = type === "INCOME" ? INCOME_CATEGORY_SUGGESTIONS : EXPENSE_CATEGORY_SUGGESTIONS;

  async function onSubmit(values: TransactionInput) {
    setPending(true);
    const res = transaction
      ? await updateTransactionAction(hustleId, transaction.id, values)
      : await createTransactionAction(hustleId, values);
    setPending(false);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success(transaction ? "Transaction updated." : "Transaction recorded.");
    setOpen(false);
    reset();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> New transaction
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{transaction ? "Edit transaction" : "New transaction"}</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setValue("type", v as TransactionInput["type"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRANSACTION_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t === "INCOME" ? "Income" : "Expense"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" {...register("date")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Input list="cat-suggestions" {...register("category")} value={category} onChange={(e) => setValue("category", e.target.value)} />
            <datalist id="cat-suggestions">
              {suggestions.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
            {errors.category ? <p className="text-xs text-rose-300">{errors.category.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label>Amount</Label>
            <Input type="number" step="0.01" {...register("amount")} />
            {errors.amount ? <p className="text-xs text-rose-300">{errors.amount.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea rows={2} {...register("description")} />
          </div>
          <div className="space-y-2">
            <Label>Reference (optional)</Label>
            <Input {...register("reference")} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : transaction ? "Save changes" : "Record"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

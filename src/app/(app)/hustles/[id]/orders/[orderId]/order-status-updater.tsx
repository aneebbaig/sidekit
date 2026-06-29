"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { OrderStatus } from "@/generated/prisma/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from "@/lib/constants";
import { setOrderStatusAction } from "@/actions/order-actions";

interface Props {
  hustleId: string;
  orderId: string;
  current: OrderStatus;
}

export function OrderStatusUpdater({ hustleId, orderId, current }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [next, setNext] = useState<OrderStatus>(current);
  const [note, setNote] = useState("");

  async function handleSave() {
    if (next === current && !note) return;
    setPending(true);
    const res = await setOrderStatusAction(hustleId, orderId, { status: next, note });
    setPending(false);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success("Status updated.");
    setNote("");
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <Select value={next} onValueChange={(v) => setNext(v as OrderStatus)}>
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
      <Textarea
        placeholder="Note (optional)"
        rows={2}
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <Button onClick={handleSave} disabled={pending} className="w-full">
        {pending ? "Updating..." : "Update status"}
      </Button>
    </div>
  );
}

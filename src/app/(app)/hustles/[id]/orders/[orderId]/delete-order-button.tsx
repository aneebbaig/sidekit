"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteOrderAction } from "@/actions/order-actions";

interface Props {
  hustleId: string;
  orderId: string;
  orderNumber: string;
}

export function DeleteOrderButton({ hustleId, orderId, orderNumber }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    setPending(true);
    const res = await deleteOrderAction(hustleId, orderId);
    setPending(false);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success("Order deleted.");
    router.push(`/hustles/${hustleId}/orders`);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4" /> Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {orderNumber}?</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This will permanently delete the order and all its items, payments, and status history. This cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" disabled={pending} onClick={handleDelete}>
              {pending ? "Deleting..." : "Delete order"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

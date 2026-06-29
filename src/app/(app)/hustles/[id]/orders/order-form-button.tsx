"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { OrderForm, type OrderFormData } from "./order-form";

interface Props {
  hustleId: string;
  customers: { id: string; name: string }[];
  order?: OrderFormData;
  trigger?: React.ReactNode;
}

export function OrderFormButton({ hustleId, customers, order, trigger }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> New order
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{order ? "Edit order" : "New order"}</DialogTitle>
        </DialogHeader>
        <OrderForm
          hustleId={hustleId}
          customers={customers}
          order={order}
          onDone={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

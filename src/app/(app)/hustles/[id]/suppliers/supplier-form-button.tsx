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
import { SupplierForm, type SupplierData } from "./supplier-form";

export function SupplierFormButton({
  hustleId,
  supplier,
  trigger,
}: {
  hustleId: string;
  supplier?: SupplierData;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New supplier
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{supplier ? "Edit supplier" : "New supplier"}</DialogTitle>
        </DialogHeader>
        <SupplierForm hustleId={hustleId} supplier={supplier} onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

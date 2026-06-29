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
import { HustleForm, type CreatedHustle } from "./hustle-form";

interface Props {
  onCreated?: (hustle: CreatedHustle) => void;
}

export function HustleCreateButton({ onCreated }: Props) {
  const [open, setOpen] = useState(false);

  function handleDone(created?: CreatedHustle) {
    setOpen(false);
    if (created) onCreated?.(created);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> New hustle
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new hustle</DialogTitle>
        </DialogHeader>
        <HustleForm onDone={handleDone} />
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { HustleAiWizardDialog } from "./hustle-ai-wizard-dialog";
import type { CreatedHustle } from "./hustle-form";

interface Props {
  onCreated?: (hustle: CreatedHustle) => void;
}

export function HustleAiWizardButton({ onCreated }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Sparkles className="h-4 w-4" /> Generate with AI
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generate a hustle with AI</DialogTitle>
        </DialogHeader>
        <HustleAiWizardDialog
          onDone={() => setOpen(false)}
          onCreated={(hustle) => {
            onCreated?.(hustle);
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
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
import { AiDraftTable } from "@/components/shared/ai-draft-table";
import { generateTableDraftAction } from "@/actions/ai-actions";
import { importProductsAction } from "@/actions/product-actions";
import type { ProductInput } from "@/schemas/product";

interface Props {
  hustleId: string;
}

export function AiGenerateProductButton({ hustleId }: Props) {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(4);
  const [instructions, setInstructions] = useState("");
  const [generating, setGenerating] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [rows, setRows] = useState<ProductInput[] | null>(null);

  async function handleGenerate() {
    setGenerating(true);
    const res = await generateTableDraftAction(hustleId, "product", count, instructions || undefined);
    setGenerating(false);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    setRows(res.data as ProductInput[]);
  }

  async function handleCommit(selected: ProductInput[]) {
    setCommitting(true);
    const res = await importProductsAction(hustleId, selected);
    setCommitting(false);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success(`Added ${res.data.count} product${res.data.count === 1 ? "" : "s"}.`);
    setOpen(false);
    setRows(null);
    setInstructions("");
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setRows(null);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Sparkles className="h-4 w-4" /> AI Generate
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generate products with AI</DialogTitle>
        </DialogHeader>
        {rows ? (
          <AiDraftTable
            rows={rows}
            pending={committing}
            onCancel={() => setRows(null)}
            onCommit={handleCommit}
            commitLabel="Add selected"
            columns={[
              { key: "name", label: "Name" },
              { key: "description", label: "Description" },
              { key: "status", label: "Status" },
            ]}
          />
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>How many?</Label>
              <Input
                type="number"
                min={1}
                max={20}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Instructions (optional)</Label>
              <Textarea
                rows={3}
                placeholder="e.g. product ideas for gifting season"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="button" disabled={generating} onClick={handleGenerate}>
                {generating ? "Generating..." : "Generate"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

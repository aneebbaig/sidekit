"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CURRENCY_OPTIONS, HUSTLE_COLORS } from "@/lib/constants";
import { generateHustleDraftAction, createHustleFromDraftAction } from "@/actions/ai-actions";
import type { HustleDraft } from "@/schemas/ai-draft";
import type { HustleStatus } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";
import type { CreatedHustle } from "./hustle-form";

interface Props {
  onDone: () => void;
  onCreated?: (hustle: CreatedHustle) => void;
}

function useSelection(length: number) {
  const [selected, setSelected] = useState<boolean[]>(() => Array(length).fill(true));
  return { selected, setSelected };
}

function DraftSection<T extends { name: string }>({
  title,
  rows,
  selected,
  onToggle,
  render,
}: {
  title: string;
  rows: T[];
  selected: boolean[];
  onToggle: (i: number) => void;
  render: (row: T) => React.ReactNode;
}) {
  if (rows.length === 0) return null;
  const count = selected.filter(Boolean).length;
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        {title} ({count}/{rows.length})
      </p>
      <div className="space-y-1 rounded-md border border-border p-2 max-h-40 overflow-auto">
        {rows.map((row, i) => (
          <label key={i} className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted/40">
            <Checkbox checked={selected[i]} onCheckedChange={() => onToggle(i)} />
            <span className="truncate">{render(row)}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export function HustleAiWizardDialog({ onDone, onCreated }: Props) {
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<HustleDraft | null>(null);

  const suppliers = useSelection(draft?.suppliers.length ?? 0);
  const products = useSelection(draft?.products.length ?? 0);
  const inventoryItems = useSelection(draft?.inventoryItems.length ?? 0);
  const costItems = useSelection(draft?.costItems.length ?? 0);

  async function handleGenerate() {
    setGenerating(true);
    const res = await generateHustleDraftAction(prompt);
    setGenerating(false);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    setDraft(res.data);
    suppliers.setSelected(res.data.suppliers.map(() => true));
    products.setSelected(res.data.products.map(() => true));
    inventoryItems.setSelected(res.data.inventoryItems.map(() => true));
    costItems.setSelected(res.data.costItems.map(() => true));
  }

  async function handleCreate() {
    if (!draft) return;
    setCreating(true);
    const finalDraft: HustleDraft = {
      hustle: draft.hustle,
      suppliers: draft.suppliers.filter((_, i) => suppliers.selected[i]),
      products: draft.products.filter((_, i) => products.selected[i]),
      inventoryItems: draft.inventoryItems.filter((_, i) => inventoryItems.selected[i]),
      costItems: draft.costItems.filter((_, i) => costItems.selected[i]),
    };
    const res = await createHustleFromDraftAction(finalDraft);
    setCreating(false);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success(`"${draft.hustle.name}" created.`);
    onCreated?.({
      id: res.data.id,
      name: draft.hustle.name,
      color: draft.hustle.color,
      description: draft.hustle.description ?? null,
      currency: draft.hustle.currency,
      status: "IDEA" as HustleStatus,
      createdAt: new Date(),
    });
    onDone();
  }

  if (!draft) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Describe the business you want to start</Label>
          <Textarea
            rows={4}
            placeholder="e.g. a resin jewelry side hustle selling handmade pieces in Lahore"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            AI will draft a starter cost sheet, suppliers, inventory, and products - you review and
            pick what to keep before anything is saved.
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onDone}>
            Cancel
          </Button>
          <Button type="button" disabled={generating || !prompt.trim()} onClick={handleGenerate}>
            {generating ? "Generating..." : "Generate"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Name</Label>
          <Input
            value={draft.hustle.name}
            onChange={(e) => setDraft({ ...draft, hustle: { ...draft.hustle, name: e.target.value } })}
          />
        </div>
        <div className="space-y-2">
          <Label>Currency</Label>
          <Select
            value={draft.hustle.currency}
            onValueChange={(v) =>
              setDraft({ ...draft, hustle: { ...draft.hustle, currency: v as HustleDraft["hustle"]["currency"] } })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCY_OPTIONS.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          rows={2}
          value={draft.hustle.description ?? ""}
          onChange={(e) => setDraft({ ...draft, hustle: { ...draft.hustle, description: e.target.value } })}
        />
      </div>
      <div className="space-y-2">
        <Label>Color</Label>
        <div className="flex flex-wrap gap-2">
          {HUSTLE_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setDraft({ ...draft, hustle: { ...draft.hustle, color: c } })}
              className={cn(
                "h-7 w-7 rounded-full transition-all",
                draft.hustle.color === c
                  ? "ring-2 ring-offset-2 ring-offset-background ring-primary scale-110"
                  : "hover:scale-105 opacity-70 hover:opacity-100",
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      <DraftSection
        title="Suppliers"
        rows={draft.suppliers}
        selected={suppliers.selected}
        onToggle={(i) => suppliers.setSelected((s) => s.map((v, idx) => (idx === i ? !v : v)))}
        render={(s) => `${s.name}${s.city ? ` - ${s.city}` : ""}`}
      />
      <DraftSection
        title="Products"
        rows={draft.products}
        selected={products.selected}
        onToggle={(i) => products.setSelected((s) => s.map((v, idx) => (idx === i ? !v : v)))}
        render={(p) => p.name}
      />
      <DraftSection
        title="Inventory items"
        rows={draft.inventoryItems}
        selected={inventoryItems.selected}
        onToggle={(i) => inventoryItems.setSelected((s) => s.map((v, idx) => (idx === i ? !v : v)))}
        render={(i) => `${i.name} - ${i.quantity} ${i.unit}`}
      />
      <DraftSection
        title="Cost items"
        rows={draft.costItems}
        selected={costItems.selected}
        onToggle={(i) => costItems.setSelected((s) => s.map((v, idx) => (idx === i ? !v : v)))}
        render={(c) => `${c.name} - ${c.amount}/${c.unit}`}
      />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={() => setDraft(null)} disabled={creating}>
          Back
        </Button>
        <Button type="button" disabled={creating} onClick={handleCreate}>
          {creating ? "Creating..." : "Create hustle"}
        </Button>
      </div>
    </div>
  );
}

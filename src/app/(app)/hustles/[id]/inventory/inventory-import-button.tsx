"use client";

import { useRef, useState } from "react";
import { Upload, Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { importInventoryItemsAction } from "@/actions/inventory-actions";

const EXAMPLE = [
  {
    name: "Nitrile Gloves",
    sku: "GLV-001",
    unit: "glove",
    quantity: 100,
    reorderAt: 20,
    unitCost: 0.1,
    notes: "Pack of 100 @ $10",
  },
  {
    name: "Kraft Boxes (Small)",
    sku: "BOX-SM",
    unit: "box",
    quantity: 200,
    reorderAt: 50,
    unitCost: 12,
    notes: "",
  },
  {
    name: "Bubble Wrap Roll",
    sku: "",
    unit: "meter",
    quantity: 50,
    reorderAt: 10,
    unitCost: 8,
    notes: "Standard 50cm width",
  },
];

interface Props {
  hustleId: string;
}

export function InventoryImportButton({ hustleId }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsed, setParsed] = useState<unknown[] | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function downloadExample() {
    const blob = new Blob([JSON.stringify(EXAMPLE, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inventory-example.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setParseError(null);
    setParsed(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (!Array.isArray(data)) {
          setParseError("JSON must be an array of inventory items.");
          return;
        }
        for (let i = 0; i < data.length; i++) {
          const item = data[i];
          if (!item.name) { setParseError(`Item ${i + 1}: missing "name".`); return; }
          if (item.quantity !== undefined && typeof item.quantity !== "number") {
            setParseError(`Item ${i + 1}: "quantity" must be a number.`); return;
          }
          if (item.unitCost !== undefined && typeof item.unitCost !== "number") {
            setParseError(`Item ${i + 1}: "unitCost" must be a number.`); return;
          }
        }
        setParsed(data);
      } catch {
        setParseError("Invalid JSON file.");
      }
    };
    reader.readAsText(file);
  }

  async function handleImport() {
    if (!parsed) return;
    setPending(true);
    const res = await importInventoryItemsAction(hustleId, parsed);
    setPending(false);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success(`Imported ${res.data.count} item${res.data.count === 1 ? "" : "s"}.`);
    setOpen(false);
    setFileName(null);
    setParsed(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" /> Import JSON
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import inventory items</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-md border border-border bg-muted/20 p-4 space-y-2">
            <p className="text-sm text-muted-foreground">
              Upload a JSON file containing an array of inventory items. Each item needs{" "}
              <code className="text-xs bg-muted px-1 rounded">name</code>. Optional:{" "}
              <code className="text-xs bg-muted px-1 rounded">sku</code>,{" "}
              <code className="text-xs bg-muted px-1 rounded">unit</code>,{" "}
              <code className="text-xs bg-muted px-1 rounded">quantity</code>,{" "}
              <code className="text-xs bg-muted px-1 rounded">reorderAt</code>,{" "}
              <code className="text-xs bg-muted px-1 rounded">unitCost</code>.
            </p>
            <Button variant="ghost" size="sm" className="gap-2 h-8" onClick={downloadExample}>
              <Download className="h-3 w-3" /> Download example file
            </Button>
          </div>

          <div className="space-y-2">
            <input
              ref={fileRef}
              type="file"
              accept=".json,application/json"
              className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground cursor-pointer"
              onChange={handleFile}
            />
            {parseError ? (
              <p className="text-xs text-rose-300">{parseError}</p>
            ) : parsed ? (
              <p className="text-xs text-emerald-300">{parsed.length} item{parsed.length === 1 ? "" : "s"} ready to import.</p>
            ) : null}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button disabled={!parsed || pending} onClick={handleImport}>
              {pending ? "Importing..." : "Import"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

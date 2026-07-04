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
import { importCostItemsAction } from "@/actions/cost-actions";

const EXAMPLE = [
  {
    name: "Nitrile Gloves",
    category: "RAW_MATERIAL",
    type: "VARIABLE",
    amount: 0.1,
    unit: "glove",
    quantity: 2,
    notes: "Pack of 100 @ $10 - cost per glove = $0.10",
  },
  {
    name: "Kraft Boxes",
    category: "PACKAGING",
    type: "VARIABLE",
    amount: 12,
    unit: "box",
    quantity: 1,
    notes: "",
  },
  {
    name: "Heat Press Machine",
    category: "EQUIPMENT",
    type: "FIXED",
    amount: 15000,
    unit: "unit",
    quantity: 1,
    notes: "One-time startup asset",
  },
  {
    name: "Electricity",
    category: "MISCELLANEOUS",
    type: "FIXED",
    amount: 3000,
    unit: "month",
    quantity: 1,
    notes: "Monthly utility estimate",
  },
  {
    name: "Canva Pro",
    category: "PLATFORM_FEE",
    type: "FIXED",
    amount: 1300,
    unit: "month",
    quantity: 1,
    notes: "Design subscription",
  },
];

const VALID_CATEGORIES = [
  "RAW_MATERIAL",
  "PACKAGING",
  "EQUIPMENT",
  "SHIPPING",
  "MARKETING",
  "PLATFORM_FEE",
  "LEGAL",
  "MISCELLANEOUS",
];
const VALID_TYPES = ["FIXED", "VARIABLE"];

interface Props {
  hustleId: string;
  defaultProductId?: string;
}

export function CostImportButton({ hustleId, defaultProductId }: Props) {
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
    a.download = "cost-sheet-example.json";
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
          setParseError("JSON must be an array of cost items.");
          return;
        }
        for (let i = 0; i < data.length; i++) {
          const item = data[i];
          if (!item.name) { setParseError(`Item ${i + 1}: missing "name".`); return; }
          if (!VALID_CATEGORIES.includes(item.category)) {
            setParseError(`Item ${i + 1}: invalid category "${item.category}". Valid: ${VALID_CATEGORIES.join(", ")}`);
            return;
          }
          if (!VALID_TYPES.includes(item.type)) {
            setParseError(`Item ${i + 1}: invalid type "${item.type}". Valid: FIXED, VARIABLE`);
            return;
          }
          if (typeof item.amount !== "number") { setParseError(`Item ${i + 1}: "amount" must be a number.`); return; }
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
    const withProduct = parsed.map((item) => ({ ...(item as object), productId: defaultProductId ?? "" }));
    const res = await importCostItemsAction(hustleId, withProduct);
    setPending(false);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success(`Imported ${res.data.count} cost item${res.data.count === 1 ? "" : "s"}.`);
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
          <DialogTitle>Import cost items</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-md border border-border bg-muted/20 p-4 space-y-2">
            <p className="text-sm text-muted-foreground">
              Upload a JSON file containing an array of cost items. Each item needs{" "}
              <code className="text-xs bg-muted px-1 rounded">name</code>,{" "}
              <code className="text-xs bg-muted px-1 rounded">category</code>,{" "}
              <code className="text-xs bg-muted px-1 rounded">type</code>, and{" "}
              <code className="text-xs bg-muted px-1 rounded">amount</code>.
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
              <p className="text-xs text-destructive">{parseError}</p>
            ) : parsed ? (
              <p className="text-xs text-success">{parsed.length} item{parsed.length === 1 ? "" : "s"} ready to import.</p>
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

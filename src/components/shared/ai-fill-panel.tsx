"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { extractEntityAction, type ExtractableEntity } from "@/actions/ai-actions";

interface Props<T> {
  entity: ExtractableEntity;
  onExtracted: (data: T) => void;
  placeholder?: string;
}

export function AiFillPanel<T>({ entity, onExtracted, placeholder }: Props<T>) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);

  async function handleExtract() {
    setPending(true);
    const res = await extractEntityAction(entity, text);
    setPending(false);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    onExtracted(res.data[0] as T);
    if (res.data.length > 1) {
      toast.success(`Filled from the first of ${res.data.length} records found. Review before saving.`);
    } else {
      toast.success("Fields filled - review before saving.");
    }
    setText("");
    setOpen(false);
  }

  return (
    <div className="rounded-md border border-dashed border-border">
      <button
        type="button"
        className="flex w-full items-center justify-between px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5" />
          Fill with AI
        </span>
        {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>
      {open ? (
        <div className="space-y-2 border-t border-border p-3">
          <Textarea
            rows={3}
            placeholder={placeholder ?? "Paste an invoice line, message, or note describing this record..."}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="flex justify-end">
            <Button type="button" size="sm" disabled={pending || !text.trim()} onClick={handleExtract}>
              {pending ? "Extracting..." : "Extract"}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

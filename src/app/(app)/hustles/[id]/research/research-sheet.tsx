"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { ResearchCategory } from "@/generated/prisma/client";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { researchNoteSchema, type ResearchNoteInput } from "@/schemas/research";
import { RESEARCH_CATEGORIES, RESEARCH_CATEGORY_LABELS } from "@/lib/constants";
import { createNoteAction, updateNoteAction } from "@/actions/research-actions";
import { X } from "lucide-react";

interface NoteData {
  id: string;
  title: string;
  content: string;
  category: ResearchCategory;
  tags: string[];
  pinned: boolean;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hustleId: string;
  note: NoteData | null;
}

export function ResearchSheet({ open, onOpenChange, hustleId, note }: Props) {
  const [pending, setPending] = useState(false);
  const [tagDraft, setTagDraft] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(researchNoteSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "GENERAL",
      tags: [],
      pinned: false,
    },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      title: note?.title ?? "",
      content: note?.content ?? "",
      category: (note?.category as ResearchNoteInput["category"]) ?? "GENERAL",
      tags: note?.tags ?? [],
      pinned: note?.pinned ?? false,
    });
    setTagDraft("");
  }, [open, note, reset]);

  const tags = watch("tags") ?? [];
  const category = watch("category");
  const pinned = watch("pinned");

  function addTag() {
    const t = tagDraft.trim();
    if (!t) return;
    if (!tags.includes(t)) setValue("tags", [...tags, t]);
    setTagDraft("");
  }

  function removeTag(t: string) {
    setValue(
      "tags",
      tags.filter((x) => x !== t),
    );
  }

  async function onSubmit(values: ResearchNoteInput) {
    setPending(true);
    const res = note
      ? await updateNoteAction(hustleId, note.id, values)
      : await createNoteAction(hustleId, values);
    setPending(false);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success(note ? "Note updated." : "Note created.");
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{note ? "Edit note" : "New note"}</SheetTitle>
        </SheetHeader>
        <form className="flex-1 px-6 pb-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register("title")} />
            {errors.title ? <p className="text-xs text-destructive">{errors.title.message}</p> : null}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={category}
                onValueChange={(v) => setValue("category", v as ResearchNoteInput["category"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RESEARCH_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {RESEARCH_CATEGORY_LABELS[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="block">Pinned</Label>
              <div className="flex items-center h-9">
                <Switch checked={pinned} onCheckedChange={(v) => setValue("pinned", v)} />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea id="content" rows={12} {...register("content")} />
            {errors.content ? <p className="text-xs text-destructive">{errors.content.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={tagDraft}
                onChange={(e) => setTagDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Press Enter to add"
              />
              <Button type="button" variant="outline" onClick={addTag}>
                Add
              </Button>
            </div>
            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <Badge key={t} variant="outline" className="gap-1">
                    #{t}
                    <button
                      type="button"
                      onClick={() => removeTag(t)}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>

          <SheetFooter className="-mx-6 px-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : note ? "Save changes" : "Create note"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

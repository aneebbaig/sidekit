"use client";

import { useMemo, useState } from "react";
import { Pin, PinOff, Plus, Search, Trash2 } from "lucide-react";
import type { ResearchCategory } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ResearchCategoryBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ResearchSheet } from "./research-sheet";
import { RESEARCH_CATEGORIES, RESEARCH_CATEGORY_LABELS } from "@/lib/constants";
import { formatRelative } from "@/lib/format";
import { deleteNoteAction, togglePinAction } from "@/actions/research-actions";
import { toast } from "sonner";

interface Note {
  id: string;
  title: string;
  content: string;
  category: ResearchCategory;
  tags: string[];
  pinned: boolean;
  updatedAt: string;
}

interface Props {
  hustleId: string;
  notes: Note[];
}

export function ResearchBoard({ hustleId, notes }: Props) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("ALL");
  const [tag, setTag] = useState<string>("ALL");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<Note | null>(null);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    notes.forEach((n) => n.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [notes]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return notes.filter((n) => {
      if (category !== "ALL" && n.category !== category) return false;
      if (tag !== "ALL" && !n.tags.includes(tag)) return false;
      if (!q) return true;
      return (
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [notes, search, category, tag]);

  const sorted = [...filtered].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.updatedAt.localeCompare(a.updatedAt);
  });

  async function handlePin(n: Note) {
    const res = await togglePinAction(hustleId, n.id, !n.pinned);
    if (!res.success) toast.error(res.error);
  }

  async function handleDelete(n: Note) {
    const res = await deleteNoteAction(hustleId, n.id);
    if (!res.success) toast.error(res.error);
    else toast.success("Note deleted.");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="w-44">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All categories</SelectItem>
              {RESEARCH_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {RESEARCH_CATEGORY_LABELS[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-44">
          <Select value={tag} onValueChange={setTag} disabled={allTags.length === 0}>
            <SelectTrigger>
              <SelectValue placeholder="All tags" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All tags</SelectItem>
              {allTags.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="ml-auto">
          <Button
            className="gap-2"
            onClick={() => {
              setActive(null);
              setOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> New note
          </Button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          title="No notes yet"
          description="Capture ideas, supplier conversations, market observations — anything you learn."
          action={
            <Button
              onClick={() => {
                setActive(null);
                setOpen(true);
              }}
            >
              Create first note
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sorted.map((n) => (
            <Card
              key={n.id}
              className="cursor-pointer transition-colors hover:border-primary/40"
              onClick={() => {
                setActive(n);
                setOpen(true);
              }}
            >
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold leading-tight line-clamp-2 min-w-0">{n.title}</p>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePin(n);
                      }}
                    >
                      {n.pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                    </Button>
                    <ConfirmDialog
                      title="Delete this note?"
                      description="The note will be permanently removed."
                      confirmLabel="Delete"
                      onConfirm={() => handleDelete(n)}
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-rose-300 hover:text-rose-200"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      }
                    />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-4 whitespace-pre-wrap">{n.content}</p>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <ResearchCategoryBadge category={n.category} />
                  {n.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {n.tags.slice(0, 3).map((t) => (
                        <Badge key={t} variant="outline" className="text-[10px]">
                          #{t}
                        </Badge>
                      ))}
                      {n.tags.length > 3 ? (
                        <span className="text-xs text-muted-foreground">+{n.tags.length - 3}</span>
                      ) : null}
                    </div>
                  ) : null}
                </div>
                <p className="text-[10px] text-muted-foreground">Updated {formatRelative(n.updatedAt)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ResearchSheet
        open={open}
        onOpenChange={setOpen}
        hustleId={hustleId}
        note={active}
      />
    </div>
  );
}

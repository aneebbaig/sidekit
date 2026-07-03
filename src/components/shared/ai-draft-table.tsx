"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface AiDraftColumn<T> {
  key: keyof T;
  label: string;
  format?: (value: T[keyof T], row: T) => React.ReactNode;
}

interface Props<T> {
  rows: T[];
  columns: AiDraftColumn<T>[];
  pending?: boolean;
  onCommit: (selected: T[]) => void;
  onCancel: () => void;
  commitLabel?: string;
}

export function AiDraftTable<T>({ rows, columns, pending, onCommit, onCancel, commitLabel }: Props<T>) {
  const [selected, setSelected] = useState<boolean[]>(() => rows.map(() => true));

  const selectedCount = selected.filter(Boolean).length;

  function toggle(i: number) {
    setSelected((s) => s.map((v, idx) => (idx === i ? !v : v)));
  }

  function toggleAll() {
    const next = selectedCount < rows.length;
    setSelected(rows.map(() => next));
  }

  return (
    <div className="space-y-3">
      <div className="max-h-96 overflow-auto rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={selectedCount === rows.length && rows.length > 0}
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              {columns.map((c) => (
                <TableHead key={String(c.key)}>{c.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Checkbox checked={selected[i]} onCheckedChange={() => toggle(i)} />
                </TableCell>
                {columns.map((c) => (
                  <TableCell key={String(c.key)}>
                    {c.format ? c.format(row[c.key], row) : String(row[c.key] ?? "")}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{selectedCount} of {rows.length} selected</p>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={pending || selectedCount === 0}
            onClick={() => onCommit(rows.filter((_, i) => selected[i]))}
          >
            {pending ? "Saving..." : commitLabel ?? `Add ${selectedCount}`}
          </Button>
        </div>
      </div>
    </div>
  );
}

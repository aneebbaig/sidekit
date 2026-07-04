"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import { ExternalLink, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/shared/data-table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Currency } from "@/components/shared/currency";
import { InventoryFormButton, type InventoryItemData } from "./inventory-form-button";
import { InventoryAdjustButton } from "./inventory-adjust-button";
import { deleteInventoryItemAction, deleteManyInventoryItemsAction } from "@/actions/inventory-actions";

interface Props {
  hustleId: string;
  currency: string;
  items: InventoryItemData[];
}

function stockStatus(qty: number, reorderAt: number) {
  if (qty <= 0) return { label: "Out of stock", variant: "danger" as const };
  if (qty <= reorderAt) return { label: "Low stock", variant: "warning" as const };
  return { label: "In stock", variant: "success" as const };
}

export function InventoryTable({ hustleId, currency, items }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  function toggleItem(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const allIds = useMemo(() => items.map((i) => i.id), [items]);
  const allChecked = allIds.length > 0 && allIds.every((id) => selected.has(id));
  const someChecked = allIds.some((id) => selected.has(id));

  function toggleAll() {
    if (allChecked) setSelected(new Set());
    else setSelected(new Set(allIds));
  }

  async function handleDelete(id: string) {
    const res = await deleteInventoryItemAction(hustleId, id);
    if (!res.success) toast.error(res.error);
    else {
      toast.success("Item deleted.");
      setSelected((prev) => { const next = new Set(prev); next.delete(id); return next; });
    }
  }

  async function handleDeleteSelected() {
    setDeleting(true);
    const ids = Array.from(selected);
    const res = await deleteManyInventoryItemsAction(hustleId, ids);
    setDeleting(false);
    if (!res.success) { toast.error(res.error); return; }
    toast.success(`Deleted ${res.data.count} item${res.data.count === 1 ? "" : "s"}.`);
    setSelected(new Set());
  }

  const columns = useMemo<ColumnDef<InventoryItemData>[]>(
    () => [
      {
        id: "select",
        header: () => (
          <Checkbox
            checked={allChecked}
            data-state={someChecked && !allChecked ? "indeterminate" : undefined}
            onCheckedChange={toggleAll}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={selected.has(row.original.id)}
            onCheckedChange={() => toggleItem(row.original.id)}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "name",
        header: "Item",
        cell: ({ row }) => (
          <div>
            <div className="flex items-center gap-1.5">
              <p className="font-medium">{row.original.name}</p>
              {row.original.url ? (
                <a href={row.original.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                  <ExternalLink className="h-3 w-3" />
                </a>
              ) : null}
            </div>
            {row.original.sku ? (
              <p className="text-xs text-muted-foreground">{row.original.sku}</p>
            ) : null}
          </div>
        ),
      },
      {
        accessorKey: "quantity",
        header: "Stock",
        cell: ({ row }) => {
          const s = stockStatus(row.original.quantity, row.original.reorderAt);
          return (
            <div className="flex items-center gap-2">
              <span className="font-mono">
                {row.original.quantity} {row.original.unit}
              </span>
              <Badge variant={s.variant} className="text-[10px]">
                {s.label}
              </Badge>
            </div>
          );
        },
      },
      {
        accessorKey: "reorderAt",
        header: "Reorder at",
        cell: ({ row }) => (
          <span className="font-mono text-xs">
            {row.original.reorderAt} {row.original.unit}
          </span>
        ),
      },
      {
        accessorKey: "unitCost",
        header: "Unit cost",
        cell: ({ row }) => <Currency value={row.original.unitCost} currency={currency} />,
      },
      {
        id: "value",
        header: "Value",
        cell: ({ row }) => (
          <Currency value={row.original.quantity * row.original.unitCost} currency={currency} />
        ),
      },
    ],
    [currency, selected, allChecked, someChecked, allIds],
  );

  return (
    <div className="space-y-3">
      {selected.size > 0 && (
        <div className="flex items-center gap-2">
          <ConfirmDialog
            title={`Delete ${selected.size} item${selected.size === 1 ? "" : "s"}?`}
            confirmLabel="Delete"
            onConfirm={handleDeleteSelected}
            trigger={
              <Button variant="destructive" size="sm" className="gap-2" disabled={deleting}>
                <Trash2 className="h-4 w-4" />
                Delete {selected.size} selected
              </Button>
            }
          />
        </div>
      )}
      <DataTable
        columns={columns}
        data={items}
        searchPlaceholder="Search inventory..."
        searchKeys={["name", "sku"]}
        rowActions={(i) => (
          <div className="flex items-center gap-2 justify-end">
            <InventoryAdjustButton hustleId={hustleId} itemId={i.id} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <InventoryFormButton
                  hustleId={hustleId}
                  item={i}
                  trigger={
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Pencil className="h-4 w-4" /> Edit
                    </DropdownMenuItem>
                  }
                />
                <ConfirmDialog
                  title="Delete this item?"
                  confirmLabel="Delete"
                  onConfirm={() => handleDelete(i.id)}
                  trigger={
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onSelect={(e) => e.preventDefault()}
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  }
                />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      />
    </div>
  );
}

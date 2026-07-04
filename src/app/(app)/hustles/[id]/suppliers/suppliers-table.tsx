"use client";

import { useMemo } from "react";
import Link from "next/link";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, MoreHorizontal, Pencil, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/shared/data-table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { SupplierFormButton } from "./supplier-form-button";
import type { SupplierData } from "./supplier-form";
import { deleteSupplierAction } from "@/actions/supplier-actions";

interface Props {
  hustleId: string;
  suppliers: SupplierData[];
}

export function SuppliersTable({ hustleId, suppliers }: Props) {
  const columns = useMemo<ColumnDef<SupplierData>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Link
              href={`/hustles/${hustleId}/suppliers/${row.original.id}`}
              className="font-medium hover:text-primary transition-colors"
            >
              {row.original.name}
            </Link>
            {row.original.preferred ? (
              <Badge variant="primary" className="gap-1">
                <Star className="h-3 w-3" /> Preferred
              </Badge>
            ) : null}
          </div>
        ),
      },
      { accessorKey: "contactName", header: "Contact", cell: ({ row }) => row.original.contactName || "-" },
      { accessorKey: "phone", header: "Phone", cell: ({ row }) => row.original.phone || "-" },
      { accessorKey: "city", header: "City", cell: ({ row }) => row.original.city || "-" },
      {
        accessorKey: "rating",
        header: "Rating",
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.rating > 0 ? `${row.original.rating}/5` : "-"}</span>
        ),
      },
    ],
    [hustleId],
  );

  async function handleDelete(id: string) {
    const res = await deleteSupplierAction(hustleId, id);
    if (!res.success) toast.error(res.error);
    else toast.success("Supplier deleted.");
  }

  return (
    <DataTable
      columns={columns}
      data={suppliers}
      searchPlaceholder="Search suppliers..."
      searchKeys={["name", "contactName", "city", "phone", "email"]}
      empty={<span className="text-sm text-muted-foreground">No suppliers yet.</span>}
      rowActions={(s) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/hustles/${hustleId}/suppliers/${s.id}`}>
                <Eye className="h-4 w-4" /> View
              </Link>
            </DropdownMenuItem>
            <SupplierFormButton
              hustleId={hustleId}
              supplier={s}
              trigger={
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Pencil className="h-4 w-4" /> Edit
                </DropdownMenuItem>
              }
            />
            <ConfirmDialog
              title="Delete this supplier?"
              description="Linked cost items will keep their reference cleared."
              confirmLabel="Delete"
              onConfirm={() => handleDelete(s.id)}
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
      )}
    />
  );
}

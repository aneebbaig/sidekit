"use client";

import { useMemo } from "react";
import Link from "next/link";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/shared/data-table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { CustomerFormButton, type CustomerData } from "./customer-form-button";
import { deleteCustomerAction } from "@/actions/customer-actions";

interface Row extends CustomerData {
  orderCount: number;
}

interface Props {
  hustleId: string;
  currency: string;
  customers: Row[];
}

export function CustomersTable({ hustleId, customers }: Props) {
  const columns = useMemo<ColumnDef<Row>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <Link
            href={`/hustles/${hustleId}/customers/${row.original.id}`}
            className="font-medium hover:text-primary transition-colors"
          >
            {row.original.name}
          </Link>
        ),
      },
      { accessorKey: "phone", header: "Phone", cell: ({ row }) => row.original.phone || "—" },
      { accessorKey: "email", header: "Email", cell: ({ row }) => row.original.email || "—" },
      { accessorKey: "city", header: "City", cell: ({ row }) => row.original.city || "—" },
      { accessorKey: "source", header: "Source", cell: ({ row }) => row.original.source || "—" },
      {
        accessorKey: "orderCount",
        header: "Orders",
        cell: ({ row }) => <span className="font-mono">{row.original.orderCount}</span>,
      },
    ],
    [hustleId],
  );

  async function handleDelete(id: string) {
    const res = await deleteCustomerAction(hustleId, id);
    if (!res.success) toast.error(res.error);
    else toast.success("Customer deleted.");
  }

  return (
    <DataTable
      columns={columns}
      data={customers}
      searchPlaceholder="Search customers..."
      searchKeys={["name", "phone", "email", "city"]}
      rowActions={(c) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/hustles/${hustleId}/customers/${c.id}`}>
                <Eye className="h-4 w-4" /> View
              </Link>
            </DropdownMenuItem>
            <CustomerFormButton
              hustleId={hustleId}
              customer={c}
              trigger={
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Pencil className="h-4 w-4" /> Edit
                </DropdownMenuItem>
              }
            />
            <ConfirmDialog
              title="Delete this customer?"
              description="Their orders will keep their customer name but lose the link."
              confirmLabel="Delete"
              onConfirm={() => handleDelete(c.id)}
              trigger={
                <DropdownMenuItem
                  className="text-rose-300 focus:text-rose-200"
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

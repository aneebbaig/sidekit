"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { Currency } from "@/components/shared/currency";

interface Row {
  id: string;
  name: string;
  color: string;
  currency: string;
  income: number;
  expenses: number;
  profit: number;
  margin: number;
  orderCount: number;
  outstanding: number;
}

export function ConsolidatedTable({ rows }: { rows: Row[] }) {
  const columns = useMemo<ColumnDef<Row>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Hustle",
        cell: ({ row }) => (
          <Link
            href={`/hustles/${row.original.id}`}
            className="flex items-center gap-2 font-medium hover:text-primary"
          >
            <span
              className="h-4 w-4 rounded-full shrink-0 inline-block"
              style={{ backgroundColor: row.original.color }}
            />
            <span>{row.original.name}</span>
          </Link>
        ),
      },
      {
        accessorKey: "income",
        header: "Income",
        cell: ({ row }) => <Currency value={row.original.income} currency={row.original.currency} />,
      },
      {
        accessorKey: "expenses",
        header: "Expenses",
        cell: ({ row }) => <Currency value={row.original.expenses} currency={row.original.currency} />,
      },
      {
        accessorKey: "profit",
        header: "Profit",
        cell: ({ row }) => (
          <Currency
            value={row.original.profit}
            currency={row.original.currency}
            tone={row.original.profit >= 0 ? "positive" : "negative"}
          />
        ),
      },
      {
        accessorKey: "margin",
        header: "Margin",
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.margin.toFixed(1)}%</span>
        ),
      },
      {
        accessorKey: "orderCount",
        header: "Orders",
        cell: ({ row }) => <span className="font-mono">{row.original.orderCount}</span>,
      },
      {
        accessorKey: "outstanding",
        header: "Outstanding",
        cell: ({ row }) => (
          <Currency
            value={row.original.outstanding}
            currency={row.original.currency}
            tone={row.original.outstanding > 0 ? "negative" : "muted"}
          />
        ),
      },
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={rows}
      searchKeys={["name"]}
      empty={<span className="text-sm text-muted-foreground">No hustles.</span>}
    />
  );
}

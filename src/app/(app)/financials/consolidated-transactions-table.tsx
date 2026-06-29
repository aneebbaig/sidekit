"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDownToLine } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { Currency } from "@/components/shared/currency";
import { downloadCSV, rowsToCSV } from "@/components/shared/csv";
import { formatDate } from "@/lib/format";

interface Tx {
  id: string;
  hustleId: string;
  hustleName: string;
  hustleColor: string;
  currency: string;
  type: "INCOME" | "EXPENSE";
  category: string;
  description: string | null;
  amount: number;
  date: string;
}

export function ConsolidatedTransactionsTable({
  transactions,
  range,
}: {
  transactions: Tx[];
  range: { from: string; to: string };
}) {
  const columns = useMemo<ColumnDef<Tx>[]>(
    () => [
      { accessorKey: "date", header: "Date", cell: ({ row }) => formatDate(row.original.date) },
      {
        accessorKey: "hustleName",
        header: "Hustle",
        cell: ({ row }) => (
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full shrink-0 inline-block" style={{ backgroundColor: row.original.hustleColor }} />
            <span>{row.original.hustleName}</span>
          </span>
        ),
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => (
          <Badge variant={row.original.type === "INCOME" ? "success" : "danger"}>
            {row.original.type === "INCOME" ? "Income" : "Expense"}
          </Badge>
        ),
      },
      { accessorKey: "category", header: "Category" },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => row.original.description || "-",
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => (
          <Currency
            value={row.original.amount}
            currency={row.original.currency}
            tone={row.original.type === "INCOME" ? "positive" : "negative"}
          />
        ),
      },
    ],
    [],
  );

  function exportCSV() {
    const csv = rowsToCSV(
      ["Date", "Hustle", "Currency", "Type", "Category", "Description", "Amount"],
      transactions.map((t) => [
        t.date.slice(0, 10),
        t.hustleName,
        t.currency,
        t.type,
        t.category,
        t.description ?? "",
        t.amount,
      ]),
    );
    downloadCSV(`consolidated-transactions-${range.from}-${range.to}.csv`, csv);
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button variant="outline" className="gap-2" onClick={exportCSV}>
          <ArrowDownToLine className="h-4 w-4" /> Export CSV
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={transactions}
        searchPlaceholder="Search across all hustles..."
        searchKeys={["hustleName", "category", "description"]}
      />
    </div>
  );
}

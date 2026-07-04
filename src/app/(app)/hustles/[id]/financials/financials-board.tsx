"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowDownToLine, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import type { TransactionType } from "@/generated/prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/shared/stat-card";
import { Currency } from "@/components/shared/currency";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GroupedBarChart } from "@/components/charts/grouped-bar-chart";
import { DonutChartCard, DONUT_PALETTE } from "@/components/charts/donut-chart";
import { DataTable } from "@/components/shared/data-table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { TransactionFormButton } from "./transaction-form-button";
import { rowsToCSV, downloadCSV } from "@/components/shared/csv";
import { deleteTransactionAction } from "@/actions/transaction-actions";
import { TRANSACTION_TYPES } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";

interface Tx {
  id: string;
  type: TransactionType;
  category: string;
  description: string | null;
  amount: number;
  date: string;
  reference: string | null;
}

interface Props {
  hustleId: string;
  currency: string;
  from: string;
  to: string;
  totals: {
    income: number;
    expenses: number;
    profit: number;
    margin: number;
    averageOrder: number;
    outstanding: number;
  };
  monthly: { label: string; income: number; expenses: number; profit: number }[];
  breakdown: { category: string; total: number }[];
  transactions: Tx[];
}

export function FinancialsBoard({
  hustleId,
  currency,
  from,
  to,
  totals,
  monthly,
  breakdown,
  transactions,
}: Props) {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const sp = useSearchParams();
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  function applyDates(nextFrom: string, nextTo: string) {
    const p = new URLSearchParams(sp?.toString() ?? "");
    p.set("from", nextFrom);
    p.set("to", nextTo);
    router.replace(`${pathname}?${p.toString()}`);
  }

  const filteredTx = useMemo(
    () => transactions.filter((t) => typeFilter === "ALL" || t.type === typeFilter),
    [transactions, typeFilter],
  );

  const columns = useMemo<ColumnDef<Tx>[]>(
    () => [
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => formatDate(row.original.date),
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
        cell: ({ row }) => (
          <div>
            <p className="truncate">{row.original.description || "-"}</p>
            {row.original.reference ? (
              <p className="text-xs text-muted-foreground">Ref: {row.original.reference}</p>
            ) : null}
          </div>
        ),
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => (
          <Currency
            value={row.original.amount}
            currency={currency}
            tone={row.original.type === "INCOME" ? "positive" : "negative"}
          />
        ),
      },
    ],
    [currency],
  );

  async function handleDelete(id: string) {
    const res = await deleteTransactionAction(hustleId, id);
    if (!res.success) toast.error(res.error);
    else toast.success("Transaction deleted.");
  }

  function exportCSV() {
    const csv = rowsToCSV(
      ["Date", "Type", "Category", "Description", "Reference", "Amount"],
      filteredTx.map((t) => [
        t.date.slice(0, 10),
        t.type,
        t.category,
        t.description ?? "",
        t.reference ?? "",
        t.amount,
      ]),
    );
    downloadCSV(`transactions-${from}-${to}.csv`, csv);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex items-center gap-4 flex-wrap p-5">
          <div className="space-y-1">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">From</Label>
            <Input type="date" value={from} onChange={(e) => applyDates(e.target.value, to)} className="w-44" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">To</Label>
            <Input type="date" value={to} onChange={(e) => applyDates(from, e.target.value)} className="w-44" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" className="gap-2" onClick={exportCSV}>
              <ArrowDownToLine className="h-4 w-4" /> Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard label="Income" value={<Currency value={totals.income} currency={currency} compact />} />
        <StatCard label="Expenses" value={<Currency value={totals.expenses} currency={currency} compact />} />
        <StatCard
          label="Profit"
          value={
            <Currency
              value={totals.profit}
              currency={currency}
              compact
              tone={totals.profit >= 0 ? "positive" : "negative"}
            />
          }
        />
        <StatCard label="Margin" value={<span className="font-mono">{totals.margin.toFixed(1)}%</span>} />
        <StatCard
          label="Avg order"
          value={<Currency value={totals.averageOrder} currency={currency} compact />}
        />
        <StatCard
          label="Outstanding"
          value={<Currency value={totals.outstanding} currency={currency} compact tone="negative" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Income vs Expenses (6 months)</CardTitle>
          </CardHeader>
          <CardContent>
            <GroupedBarChart
              data={monthly}
              currency={currency}
              series={[
                { key: "income", label: "Income", color: "var(--color-success)" },
                { key: "expenses", label: "Expenses", color: "var(--color-destructive)" },
              ]}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Expense breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {breakdown.length === 0 ? (
              <EmptyState title="No expenses in range" />
            ) : (
              <>
                <DonutChartCard
                  data={breakdown.map((b) => ({ name: b.category, value: b.total }))}
                  currency={currency}
                />
                <ul className="mt-3 space-y-1 text-xs">
                  {breakdown.slice(0, 6).map((b, i) => (
                    <li key={b.category} className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: DONUT_PALETTE[i % DONUT_PALETTE.length] }}
                      />
                      <span className="flex-1 truncate">{b.category}</span>
                      <Currency value={b.total} currency={currency} className="text-xs" />
                    </li>
                  ))}
                </ul>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-lg font-semibold tracking-tight">Transactions</h2>
          <div className="w-44">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All types</SelectItem>
                {TRANSACTION_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t === "INCOME" ? "Income" : "Expense"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DataTable
          columns={columns}
          data={filteredTx}
          searchPlaceholder="Search transactions..."
          searchKeys={["category", "description", "reference"]}
          rowActions={(t) => (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <TransactionFormButton
                  hustleId={hustleId}
                  transaction={t}
                  trigger={
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Pencil className="h-4 w-4" /> Edit
                    </DropdownMenuItem>
                  }
                />
                <ConfirmDialog
                  title="Delete this transaction?"
                  confirmLabel="Delete"
                  onConfirm={() => handleDelete(t.id)}
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
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { Search, SlidersHorizontal, Loader2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  searchPlaceholder?: string;
  searchKeys?: (keyof TData & string)[];
  loading?: boolean;
  empty?: ReactNode;
  rowActions?: (row: TData) => ReactNode;
  className?: string;
}

export function DataTable<TData>({
  columns,
  data,
  searchPlaceholder = "Search...",
  searchKeys,
  loading = false,
  empty,
  rowActions,
  className,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [visibility, setVisibility] = useState<VisibilityState>({});

  const allColumns = useMemo<ColumnDef<TData, unknown>[]>(() => {
    if (!rowActions) return columns;
    return [
      ...columns,
      {
        id: "actions",
        header: () => null,
        cell: ({ row }) => (
          <div className="flex justify-end">{rowActions(row.original)}</div>
        ),
      } as ColumnDef<TData, unknown>,
    ];
  }, [columns, rowActions]);

  const table = useReactTable({
    data,
    columns: allColumns,
    state: { sorting, globalFilter, columnVisibility: visibility },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, _columnId, filterValue) => {
      const q = String(filterValue ?? "").toLowerCase().trim();
      if (!q) return true;
      if (searchKeys && searchKeys.length > 0) {
        return searchKeys.some((k) => {
          const v = (row.original as Record<string, unknown>)[k];
          return String(v ?? "").toLowerCase().includes(q);
        });
      }
      return row.getAllCells().some((c) => {
        const v = c.getValue();
        return String(v ?? "").toLowerCase().includes(q);
      });
    },
  });

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-8"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <SlidersHorizontal />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllLeafColumns()
              .filter((c) => c.getCanHide())
              .map((c) => (
                <DropdownMenuCheckboxItem
                  key={c.id}
                  checked={c.getIsVisible()}
                  onCheckedChange={(v) => c.toggleVisibility(!!v)}
                  className="capitalize"
                >
                  {c.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => {
                  const canSort = h.column.getCanSort();
                  const dir = h.column.getIsSorted();
                  return (
                    <TableHead key={h.id}>
                      {h.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          onClick={h.column.getToggleSortingHandler()}
                          className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                        >
                          {flexRender(h.column.columnDef.header, h.getContext())}
                          {dir === "asc" ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : dir === "desc" ? (
                            <ArrowDown className="h-3 w-3" />
                          ) : (
                            <ArrowUpDown className="h-3 w-3 opacity-40" />
                          )}
                        </button>
                      ) : (
                        flexRender(h.column.columnDef.header, h.getContext())
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={allColumns.length} className="h-24 text-center">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={allColumns.length} className="h-32">
                  <div className="flex items-center justify-center">
                    {empty ?? <span className="text-sm text-muted-foreground">No records.</span>}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

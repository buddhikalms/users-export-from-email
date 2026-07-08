"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type ColumnDef,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ProfessionalDataTable<TData>({
  columns,
  data,
  manualPagination,
  searchPlaceholder = "Search table...",
}: {
  columns: ColumnDef<TData>[];
  data: TData[];
  manualPagination?: {
    currentPage: number;
    pageSize: number;
    query: string;
    totalRows: number;
  };
  searchPlaceholder?: string;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchValue, setSearchValue] = useState(manualPagination?.query ?? "");
  const [globalFilter, setGlobalFilter] = useState(manualPagination?.query ?? "");
  const memoizedData = useMemo(() => data, [data]);
  const pageCount = manualPagination
    ? Math.max(1, Math.ceil(manualPagination.totalRows / manualPagination.pageSize))
    : 1;
  const table = useReactTable({
    columns,
    data: memoizedData,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: manualPagination ? undefined : setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: manualPagination ? undefined : getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  useEffect(() => {
    if (manualPagination) {
      return;
    }

    const timeout = setTimeout(() => setGlobalFilter(searchValue), 250);
    return () => clearTimeout(timeout);
  }, [manualPagination, searchValue]);

  useEffect(() => {
    if (!manualPagination) {
      return;
    }

    const timeout = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      if (searchValue.trim()) {
        params.set("q", searchValue.trim());
      } else {
        params.delete("q");
      }
      params.delete("page");
      const next = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
      if (next !== `${window.location.pathname}${window.location.search}`) {
        window.location.assign(next);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [manualPagination, searchValue]);

  const makePageHref = (page: number) => {
    const params = new URLSearchParams();
    if (manualPagination?.query) {
      params.set("q", manualPagination.query);
    }
    if (page > 1) {
      params.set("page", String(page));
    }
    return `${params.toString() ? `?${params.toString()}` : ""}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
          />
        </div>
        <Button variant="outline">Column visibility</Button>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="max-h-[620px] overflow-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="sticky top-0 z-10 bg-secondary/95 backdrop-blur">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="whitespace-nowrap px-4 py-3 font-semibold text-foreground"
                    >
                      {header.isPlaceholder ? null : (
                        <button
                          className="flex items-center gap-2"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <span className="text-xs text-muted-foreground">
                            {{
                              asc: "Asc",
                              desc: "Desc",
                            }[header.column.getIsSorted() as string] ?? ""}
                          </span>
                        </button>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-t border-border/70 transition hover:bg-secondary/50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>
          Page {manualPagination?.currentPage ?? table.getState().pagination.pageIndex + 1} of{" "}
          {manualPagination ? pageCount : table.getPageCount() || 1}
        </span>
        <div className="flex gap-2">
          {manualPagination ? (
            <>
              <Button asChild disabled={manualPagination.currentPage <= 1} size="sm" variant="outline">
                <Link href={makePageHref(Math.max(1, manualPagination.currentPage - 1))}>
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Link>
              </Button>
              <Button asChild disabled={manualPagination.currentPage >= pageCount} size="sm" variant="outline">
                <Link href={makePageHref(Math.min(pageCount, manualPagination.currentPage + 1))}>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button
                disabled={!table.getCanPreviousPage()}
                size="sm"
                variant="outline"
                onClick={() => table.previousPage()}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                disabled={!table.getCanNextPage()}
                size="sm"
                variant="outline"
                onClick={() => table.nextPage()}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

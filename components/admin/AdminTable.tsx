"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

type AdminTableColumn = {
  key: string;
  label: string;
};

export type AdminTableRow = {
  id: string;
  search: string;
  cells: Record<string, string>;
};

export function AdminTable({
  columns,
  emptyMessage,
  rows,
}: {
  columns: AdminTableColumn[];
  emptyMessage: string;
  rows: AdminTableRow[];
}) {
  const [query, setQuery] = useState("");
  const filteredRows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return rows;

    return rows.filter((row) => row.search.toLowerCase().includes(normalized));
  }, [query, rows]);

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          className="h-11 w-full rounded-2xl border border-input bg-background pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          placeholder="Filter table"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-secondary/60 text-xs uppercase tracking-[0.14em] text-muted-foreground">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3 font-semibold">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/70">
            {filteredRows.map((row) => (
              <tr key={row.id} className="transition hover:bg-secondary/40">
                {columns.map((column) => (
                  <td key={`${row.id}-${column.key}`} className="px-4 py-3 align-top">
                    {row.cells[column.key] ?? ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {filteredRows.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">{emptyMessage}</div>
        ) : null}
      </div>
    </div>
  );
}

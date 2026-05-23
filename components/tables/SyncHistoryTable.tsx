"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { ProfessionalDataTable } from "@/components/tables/ProfessionalDataTable";
import { Badge } from "@/components/ui/badge";

export type SyncRow = {
  workflow: string;
  status: string;
  duration: string;
  processed: number;
  duplicates: number;
  invalid: number;
};

const columns: ColumnDef<SyncRow>[] = [
  { accessorKey: "workflow", header: "Workflow" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <Badge>{row.original.status}</Badge>,
  },
  { accessorKey: "duration", header: "Duration" },
  { accessorKey: "processed", header: "Contacts" },
  { accessorKey: "duplicates", header: "Duplicates" },
  { accessorKey: "invalid", header: "Invalid" },
];

export function SyncHistoryTable({ data }: { data: SyncRow[] }) {
  return (
    <ProfessionalDataTable
      columns={columns}
      data={data}
      searchPlaceholder="Search sync history..."
    />
  );
}

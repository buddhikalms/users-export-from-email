"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { ProfessionalDataTable } from "@/components/tables/ProfessionalDataTable";
import { Badge } from "@/components/ui/badge";

export type LogRow = {
  level: string;
  message: string;
  source: string;
  time: string;
};

const columns: ColumnDef<LogRow>[] = [
  {
    accessorKey: "level",
    header: "Level",
    cell: ({ row }) => <Badge>{row.original.level}</Badge>,
  },
  { accessorKey: "message", header: "Message" },
  { accessorKey: "source", header: "Source" },
  { accessorKey: "time", header: "Time" },
];

export function LogsTable({ data }: { data: LogRow[] }) {
  return (
    <ProfessionalDataTable
      columns={columns}
      data={data}
      searchPlaceholder="Search logs..."
    />
  );
}

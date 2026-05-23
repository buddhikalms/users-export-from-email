"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { ProfessionalDataTable } from "@/components/tables/ProfessionalDataTable";
import { Badge } from "@/components/ui/badge";

export type ContactRow = {
  name: string;
  email: string;
  folder: string;
  source: string;
  count: number;
  lastSeen: string;
};

const columns: ColumnDef<ContactRow>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
  {
    accessorKey: "folder",
    header: "Folders",
    cell: ({ row }) => <Badge>{row.original.folder}</Badge>,
  },
  {
    accessorKey: "source",
    header: "Source",
    cell: ({ row }) => (
      <Badge className="bg-primary/10 text-primary">{row.original.source}</Badge>
    ),
  },
  { accessorKey: "count", header: "Email Count" },
  { accessorKey: "lastSeen", header: "Last Seen" },
];

export function ContactsTable({ data }: { data: ContactRow[] }) {
  return (
    <ProfessionalDataTable
      columns={columns}
      data={data}
      searchPlaceholder="Search contacts..."
    />
  );
}

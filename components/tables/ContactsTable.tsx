"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Star } from "lucide-react";

import { ProfessionalDataTable } from "@/components/tables/ProfessionalDataTable";
import { Badge } from "@/components/ui/badge";

export type ContactRow = {
  name: string;
  email: string;
  company: string;
  domain: string;
  folder: string;
  source: string;
  classification: string;
  status: string;
  leadScore: number;
  tags: string[];
  starred: boolean;
  count: number;
  lastSeen: string;
};

const columns: ColumnDef<ContactRow>[] = [
  {
    accessorKey: "name",
    header: "Contact",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {row.original.starred ? <Star className="h-4 w-4 fill-primary text-primary" /> : null}
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-xs text-muted-foreground">{row.original.email}</div>
        </div>
      </div>
    ),
  },
  { accessorKey: "email", header: "Email" },
  {
    accessorKey: "company",
    header: "Company",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.company}</div>
        <div className="text-xs text-muted-foreground">{row.original.domain}</div>
      </div>
    ),
  },
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
  {
    accessorKey: "classification",
    header: "Type",
    cell: ({ row }) => (
      <Badge className="bg-secondary text-secondary-foreground">
        {row.original.classification}
      </Badge>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge className="bg-accent/15 text-accent-foreground dark:text-accent">
        {row.original.status}
      </Badge>
    ),
  },
  { accessorKey: "leadScore", header: "Lead Score" },
  {
    accessorKey: "tags",
    header: "Tags",
    cell: ({ row }) => (
      <div className="flex max-w-[220px] flex-wrap gap-1">
        {row.original.tags.map((tag) => (
          <Badge key={tag} className="bg-secondary text-secondary-foreground">
            {tag}
          </Badge>
        ))}
      </div>
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

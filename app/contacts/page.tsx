import { getServerSession } from "next-auth";
import { MailCheck } from "lucide-react";

import { authOptions } from "@/auth";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { ContactsTable, type ContactRow } from "@/components/tables/ContactsTable";
import { db } from "@/lib/db";
import { formatCount, formatDateTime } from "@/lib/dashboard-data";
import type { Prisma } from "@prisma/client";

function titleCase(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}

type ContactsPageProps = {
  searchParams?: Promise<{
    page?: string;
    q?: string;
  }>;
};

export default async function ContactsPage({ searchParams }: ContactsPageProps) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const params = await searchParams;
  const page = Math.max(1, Number(params?.page ?? "1") || 1);
  const query = params?.q?.trim() ?? "";
  const pageSize = 100;
  const searchWhere: Prisma.ContactWhereInput = query
    ? {
        OR: [
          { email: { contains: query } },
          { name: { contains: query } },
          { company: { contains: query } },
          { domain: { contains: query } },
          { sourceFolder: { contains: query } },
        ],
      }
    : {};
  const where: Prisma.ContactWhereInput = userId ? { ownerId: userId, ...searchWhere } : {};
  const [contacts, totalContacts, businessCount, personalCount, duplicateRiskCount, starredCount] = userId
    ? await Promise.all([
        db.contact.findMany({
          where,
          select: {
            email: true,
            name: true,
            company: true,
            domain: true,
            sourceFolder: true,
            sourceType: true,
            emailClassification: true,
            status: true,
            leadScore: true,
            starred: true,
            emailCount: true,
            lastSeenAt: true,
            updatedAt: true,
            tags: {
              select: {
                tag: { select: { name: true } },
              },
              take: 8,
            },
          },
          orderBy: [{ starred: "desc" }, { updatedAt: "desc" }],
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        db.contact.count({ where }),
        db.contact.count({ where: { ownerId: userId, emailClassification: "BUSINESS" } }),
        db.contact.count({ where: { ownerId: userId, emailClassification: "PERSONAL" } }),
        db.contact.count({ where: { ownerId: userId, duplicateScore: { gt: 0 } } }),
        db.contact.count({ where: { ownerId: userId, starred: true } }),
      ])
    : [[], 0, 0, 0, 0, 0];
  const rows: ContactRow[] = contacts.map((contact) => ({
    name: contact.name || contact.email,
    email: contact.email,
    company: contact.company || "-",
    domain: contact.domain || "-",
    folder: contact.sourceFolder || "-",
    source: titleCase(contact.sourceType),
    classification: titleCase(contact.emailClassification),
    status: titleCase(contact.status),
    leadScore: contact.leadScore,
    tags: contact.tags.map((assignment) => assignment.tag.name),
    starred: contact.starred,
    count: contact.emailCount,
    lastSeen: formatDateTime(contact.lastSeenAt ?? contact.updatedAt),
  }));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">CRM Layer</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Contacts</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
          Search, filter, review source folders, score leads, track notes, and inspect
          enrichment before marketing sync.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Business contacts", formatCount(businessCount)],
          ["Personal emails", formatCount(personalCount)],
          ["Duplicate risk", formatCount(duplicateRiskCount)],
          ["Starred leads", formatCount(starredCount)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-3xl border border-border/70 bg-card/80 p-5 shadow-sm">
            <div className="text-sm text-muted-foreground">{label}</div>
            <div className="mt-3 text-3xl font-semibold">{value}</div>
          </div>
        ))}
      </div>
      {rows.length ? (
        <ContactsTable
          currentPage={page}
          data={rows}
          pageSize={pageSize}
          query={query}
          totalRows={totalContacts}
        />
      ) : (
        <EmptyState
          actionHref="/settings"
          actionLabel="Start email sync"
          description="Run a mailbox sync to populate the contact workspace with cleaned, deduped people."
          icon={MailCheck}
          title="No contacts synced yet"
        />
      )}
    </div>
  );
}

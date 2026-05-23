import { MailCheck } from "lucide-react";

import { EmptyState } from "@/components/dashboard/EmptyState";
import { ContactsTable, type ContactRow } from "@/components/tables/ContactsTable";

const contacts: ContactRow[] = [
  {
    name: "Maya Chen",
    email: "maya@example.com",
    folder: "Inbox / Leads",
    source: "direct_email",
    count: 18,
    lastSeen: "Today",
  },
  {
    name: "Nolan Brooks",
    email: "nolan@agency.co",
    folder: "Sales / Agency",
    source: "forwarded_email",
    count: 11,
    lastSeen: "Yesterday",
  },
];

export default function ContactsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">CRM Layer</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Contacts</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
          Search, filter, review source folders, and inspect contact enrichment before export.
        </p>
      </div>
      {contacts.length ? (
        <ContactsTable data={contacts} />
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

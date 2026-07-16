"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cleanEmail } from "@/lib/email-cleaner";
import { normalizeContactEmail } from "@/lib/email-format";
import type { EmailContact, SyncResult } from "@/types/email";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function dedupeContactsByCleanEmail(contacts: EmailContact[]) {
  const uniqueMap = new Map<string, EmailContact>();

  for (const contact of contacts) {
    const email = normalizeContactEmail(contact.email);
    if (!email) {
      continue;
    }

    const existing = uniqueMap.get(email);
    if (!existing) {
      uniqueMap.set(email, {
        ...contact,
        email,
      });
      continue;
    }

    uniqueMap.set(email, {
      ...existing,
      name:
        existing.name && existing.name !== existing.email.split("@")[0]
          ? existing.name
          : contact.name,
      sourceFolder: Array.from(
        new Set(
          [existing.sourceFolder, contact.sourceFolder]
            .flatMap((value) => value.split(", "))
            .filter(Boolean),
        ),
      )
        .sort()
        .join(", "),
      sourceType: Array.from(
        new Set(
          [existing.sourceType, contact.sourceType]
            .flatMap((value) => value.split(", "))
            .filter(Boolean),
        ),
      )
        .sort()
        .join(", "),
      forwardedBy: existing.forwardedBy || contact.forwardedBy,
      originalSender: existing.originalSender || contact.originalSender,
      subject: existing.subject || contact.subject,
      firstSeen:
        new Date(contact.firstSeen) < new Date(existing.firstSeen)
          ? contact.firstSeen
          : existing.firstSeen,
      lastSeen:
        new Date(contact.lastSeen) > new Date(existing.lastSeen)
          ? contact.lastSeen
          : existing.lastSeen,
      emailCount: existing.emailCount + contact.emailCount,
    });
  }

  return Array.from(uniqueMap.values()).sort((left, right) =>
    left.email.localeCompare(right.email),
  );
}

function getDateOnly(value: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

function matchesSearch(contact: EmailContact, query: string) {
  if (!query) {
    return true;
  }

  const haystack = [
    contact.name,
    contact.email,
    contact.sourceFolder,
    contact.sourceType,
    contact.forwardedBy,
    contact.originalSender,
    contact.subject,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

function matchesDateRange(contact: EmailContact, fromDate: string, toDate: string) {
  const lastSeenDate = getDateOnly(contact.lastSeen);

  if (!lastSeenDate) {
    return false;
  }

  if (fromDate && lastSeenDate < fromDate) {
    return false;
  }

  if (toDate && lastSeenDate > toDate) {
    return false;
  }

  return true;
}

function filterContacts(
  contacts: EmailContact[],
  filters: {
    query: string;
    fromDate: string;
    toDate: string;
  },
) {
  const query = filters.query.trim().toLowerCase();

  return contacts.filter(
    (contact) =>
      matchesSearch(contact, query) &&
      matchesDateRange(contact, filters.fromDate, filters.toDate),
  );
}

function filterSyncResult(
  syncResult: SyncResult,
  filters: {
    query: string;
    fromDate: string;
    toDate: string;
  },
): SyncResult {
  const folders = syncResult.folders.map((folder) => ({
    ...folder,
    contacts: filterContacts(folder.contacts, filters),
  }));
  const allContacts = filterContacts(syncResult.allContacts, filters);
  const visibleEmails = new Set(
    allContacts
      .map((contact) => normalizeContactEmail(contact.email))
      .filter((email): email is string => Boolean(email)),
  );

  return {
    folders,
    allContacts,
    duplicatesAcrossFolders: syncResult.duplicatesAcrossFolders.filter((duplicate) => {
      const email = normalizeContactEmail(duplicate.email);
      return email ? visibleEmails.has(email) : false;
    }),
  };
}

function ContactTable({
  contacts,
  emptyMessage,
}: {
  contacts: EmailContact[];
  emptyMessage: string;
}) {
  const cleanContacts = dedupeContactsByCleanEmail(contacts);

  if (cleanContacts.length === 0) {
    return (
      <div className="empty-panel">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="data-table-shell">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="data-table-head">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Source Folder</th>
              <th className="px-4 py-3 font-semibold">Source Type</th>
              <th className="px-4 py-3 font-semibold">Forwarded By</th>
              <th className="px-4 py-3 font-semibold">Original Sender</th>
              <th className="px-4 py-3 font-semibold">Subject</th>
              <th className="px-4 py-3 font-semibold">First Seen</th>
              <th className="px-4 py-3 font-semibold">Last Seen</th>
              <th className="px-4 py-3 font-semibold">Email Count</th>
            </tr>
          </thead>
          <tbody>
            {cleanContacts.map((contact) => (
              <tr
                key={`${contact.sourceFolder}-${contact.email}`}
                className="border-t border-border/60"
              >
                <td className="px-4 py-3">{contact.name}</td>
                <td className="px-4 py-3">{contact.email}</td>
                <td className="px-4 py-3">{contact.sourceFolder}</td>
                <td className="px-4 py-3">{contact.sourceType}</td>
                <td className="px-4 py-3">{contact.forwardedBy || "-"}</td>
                <td className="px-4 py-3">{contact.originalSender || "-"}</td>
                <td className="px-4 py-3">{contact.subject || "-"}</td>
                <td className="px-4 py-3">{formatDate(contact.firstSeen)}</td>
                <td className="px-4 py-3">{formatDate(contact.lastSeen)}</td>
                <td className="px-4 py-3">{contact.emailCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ResultsTable({
  syncResult,
  onFilteredResultChange,
}: {
  syncResult: SyncResult;
  onFilteredResultChange?: (filteredSyncResult: SyncResult) => void;
}) {
  const [query, setQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const filteredSyncResult = useMemo(
    () => filterSyncResult(syncResult, { query, fromDate, toDate }),
    [fromDate, query, syncResult, toDate],
  );
  const cleanAllContacts = dedupeContactsByCleanEmail(filteredSyncResult.allContacts);
  const totalFolderContacts = filteredSyncResult.folders.reduce(
    (count, folder) => count + dedupeContactsByCleanEmail(folder.contacts).length,
    0,
  );
  const hasFilters = Boolean(query.trim() || fromDate || toDate);

  useEffect(() => {
    onFilteredResultChange?.(filteredSyncResult);
  }, [filteredSyncResult, onFilteredResultChange]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filter Synced Contacts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-[1fr_180px_180px_auto]">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="sync-search">
                Search
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="sync-search"
                  className="pl-10"
                  placeholder="Search name, email, folder, sender, or subject"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="from-date">
                Last seen from
              </label>
              <Input
                id="from-date"
                type="date"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="to-date">
                Last seen to
              </label>
              <Input
                id="to-date"
                type="date"
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
              />
            </div>
            <Button
              className="self-end"
              disabled={!hasFilters}
              variant="outline"
              onClick={() => {
                setQuery("");
                setFromDate("");
                setToDate("");
              }}
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Filters apply to this review table and to the export dataset used by the next step.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Unique Global Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{cleanAllContacts.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Folder Contact Rows</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{totalFolderContacts}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Cross-Folder Duplicates</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {filteredSyncResult.duplicatesAcrossFolders.length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Folder-Wise Contacts</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all-contacts">
            <TabsList>
              <TabsTrigger value="all-contacts">
                All Contacts ({cleanAllContacts.length})
              </TabsTrigger>
              {filteredSyncResult.folders.map((folder) => (
                <TabsTrigger key={folder.folderPath} value={folder.folderPath}>
                  {folder.displayName} ({dedupeContactsByCleanEmail(folder.contacts).length})
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="all-contacts">
              <ContactTable
                contacts={cleanAllContacts}
                emptyMessage="No contacts were found across the selected folders."
              />
            </TabsContent>

            {filteredSyncResult.folders.map((folder) => (
              <TabsContent key={folder.folderPath} value={folder.folderPath}>
                <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span>Mailbox path: {folder.folderPath}</span>
                  <span>Messages scanned: {folder.totalMessagesScanned}</span>
                </div>
                <ContactTable
                  contacts={folder.contacts}
                  emptyMessage={`No contacts were found in ${folder.displayName}.`}
                />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Global Duplicates Across Folders</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSyncResult.duplicatesAcrossFolders.length === 0 ? (
            <div className="empty-panel">
              No duplicate email addresses were found across the selected folders.
            </div>
          ) : (
            <div className="data-table-shell">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="data-table-head">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Name</th>
                      <th className="px-4 py-3 font-semibold">Email</th>
                      <th className="px-4 py-3 font-semibold">Folders</th>
                      <th className="px-4 py-3 font-semibold">Total Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSyncResult.duplicatesAcrossFolders.map((duplicate) => (
                      <tr key={cleanEmail(duplicate.email)} className="border-t border-border/60">
                        <td className="px-4 py-3">{duplicate.name}</td>
                        <td className="px-4 py-3">{cleanEmail(duplicate.email)}</td>
                        <td className="px-4 py-3">{duplicate.folders.join(", ")}</td>
                        <td className="px-4 py-3">{duplicate.totalEmailCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

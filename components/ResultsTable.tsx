"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

function ContactTable({
  contacts,
  emptyMessage,
}: {
  contacts: EmailContact[];
  emptyMessage: string;
}) {
  if (contacts.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-white/60 p-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-border/70 bg-white/85">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-secondary/60 text-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Source Folder</th>
              <th className="px-4 py-3 font-semibold">First Seen</th>
              <th className="px-4 py-3 font-semibold">Last Seen</th>
              <th className="px-4 py-3 font-semibold">Email Count</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr
                key={`${contact.sourceFolder}-${contact.email}`}
                className="border-t border-border/60"
              >
                <td className="px-4 py-3">{contact.name}</td>
                <td className="px-4 py-3">{contact.email}</td>
                <td className="px-4 py-3">{contact.sourceFolder}</td>
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

export function ResultsTable({ syncResult }: { syncResult: SyncResult }) {
  const totalFolderContacts = syncResult.folders.reduce(
    (count, folder) => count + folder.contacts.length,
    0,
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Unique Global Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{syncResult.allContacts.length}</p>
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
              {syncResult.duplicatesAcrossFolders.length}
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
                All Contacts ({syncResult.allContacts.length})
              </TabsTrigger>
              {syncResult.folders.map((folder) => (
                <TabsTrigger key={folder.folderPath} value={folder.folderPath}>
                  {folder.displayName} ({folder.contacts.length})
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="all-contacts">
              <ContactTable
                contacts={syncResult.allContacts}
                emptyMessage="No contacts were found across the selected folders."
              />
            </TabsContent>

            {syncResult.folders.map((folder) => (
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
          {syncResult.duplicatesAcrossFolders.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-white/60 p-8 text-center text-sm text-muted-foreground">
              No duplicate email addresses were found across the selected folders.
            </div>
          ) : (
            <div className="overflow-hidden rounded-[1.5rem] border border-border/70 bg-white/85">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-secondary/60 text-foreground">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Name</th>
                      <th className="px-4 py-3 font-semibold">Email</th>
                      <th className="px-4 py-3 font-semibold">Folders</th>
                      <th className="px-4 py-3 font-semibold">Total Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {syncResult.duplicatesAcrossFolders.map((duplicate) => (
                      <tr key={duplicate.email} className="border-t border-border/60">
                        <td className="px-4 py-3">{duplicate.name}</td>
                        <td className="px-4 py-3">{duplicate.email}</td>
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

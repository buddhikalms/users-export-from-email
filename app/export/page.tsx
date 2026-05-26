"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { ExportButton } from "@/components/ExportButton";
import { KitSyncPanel } from "@/components/KitSyncPanel";
import { integrationRegistry } from "@/lib/integrations/registry";
import { filterSyncResultByLastSeen } from "@/lib/sync-result";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getStoredSyncResult } from "@/lib/storage";
import type { LastSeenFilter, SyncResult } from "@/types/email";

export default function ExportPage() {
  const router = useRouter();
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [filter, setFilter] = useState<LastSeenFilter>({ mode: "all" });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = getStoredSyncResult();
    if (!stored) {
      router.replace("/results");
      return;
    }

    setSyncResult(stored);
    setReady(true);
  }, [router]);

  if (!ready || !syncResult) {
    return (
      <main className="w-full">
        <div className="rounded-[1.75rem] border border-dashed border-border bg-white/70 p-8 text-sm text-muted-foreground">
          Preparing workbook export data...
        </div>
      </main>
    );
  }

  const filteredSyncResult = filterSyncResultByLastSeen(syncResult, filter);
  const totalFilteredFolderContacts = filteredSyncResult.folders.reduce(
    (count, folder) => count + folder.contacts.length,
    0,
  );

  return (
    <main className="w-full">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Step 4
          </p>
          <h1 className="text-4xl">Export Workbook</h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">
            Create one Excel workbook with an All Contacts sheet and one sheet for
            every mail folder you synced.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href="/results">Back To Results</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Home</Link>
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Export Destination Workflow</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="platform">
                  Platform
                </label>
                <select
                  id="platform"
                  className="flex h-11 w-full rounded-2xl border border-input bg-white/85 px-4 py-2 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:bg-card"
                  defaultValue="kit"
                >
                  {integrationRegistry.map((integration) => (
                    <option key={integration.platform} value={integration.platform}>
                      {integration.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="account">
                  Account
                </label>
                <select
                  id="account"
                  className="flex h-11 w-full rounded-2xl border border-input bg-white/85 px-4 py-2 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:bg-card"
                  disabled
                  defaultValue=""
                >
                  <option value="">Loaded from connected accounts</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="destination">
                  Tag / List / Form
                </label>
                <select
                  id="destination"
                  className="flex h-11 w-full rounded-2xl border border-input bg-white/85 px-4 py-2 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:bg-card"
                  disabled
                  defaultValue=""
                >
                  <option value="">Loaded from selected account</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="dedupe">
                  Cleanup
                </label>
                <select
                  id="dedupe"
                  className="flex h-11 w-full rounded-2xl border border-input bg-white/85 px-4 py-2 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:bg-card"
                  defaultValue="strict"
                >
                  <option value="strict">Strict email dedupe</option>
                </select>
              </div>
            </div>
            <div className="rounded-3xl border border-dashed border-primary/25 bg-primary/5 p-4 text-sm leading-6 text-muted-foreground">
              Kit exports are live in this build. The same destination contract now supports
              Mailchimp, Brevo, Beehiiv, HubSpot, MailerLite, Constant Contact, SendGrid
              Marketing, ActiveCampaign, and Campaign Monitor as adapters are completed.
            </div>
          </CardContent>
        </Card>
        <KitSyncPanel syncResult={filteredSyncResult} />
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Folder Sheets</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{filteredSyncResult.folders.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Export Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {filteredSyncResult.allContacts.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Filtered Folder Rows</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{totalFilteredFolderContacts}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Last Seen Filter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-5 md:grid-cols-[minmax(0,220px)_minmax(0,220px)_1fr]">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="last-seen-mode">
                Filter mode
              </label>
              <select
                id="last-seen-mode"
                className="flex h-11 w-full rounded-2xl border border-input bg-white/85 px-4 py-2 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                value={filter.mode}
                onChange={(event) =>
                  setFilter((current) => ({
                    ...current,
                    mode: event.target.value as LastSeenFilter["mode"],
                  }))
                }
              >
                <option value="all">Export all contacts</option>
                <option value="after">Last seen on or after date</option>
                <option value="before">Last seen on or before date</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="last-seen-date">
                Selected date
              </label>
              <input
                id="last-seen-date"
                type="date"
                className="flex h-11 w-full rounded-2xl border border-input bg-white/85 px-4 py-2 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={filter.mode === "all"}
                value={filter.date ?? ""}
                onChange={(event) =>
                  setFilter((current) => ({
                    ...current,
                    date: event.target.value || undefined,
                  }))
                }
              />
            </div>

            <div className="rounded-3xl border border-dashed border-primary/20 bg-primary/5 p-5 text-sm leading-7 text-muted-foreground">
              {filter.mode === "all"
                ? "The workbook will include every synced contact."
                : filter.mode === "after"
                  ? "The workbook will include contacts whose Last Seen date is on or after the selected date."
                  : "The workbook will include contacts whose Last Seen date is on or before the selected date."}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <Card className="border border-border/70 shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Duplicate Emails</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">
                  {filteredSyncResult.duplicatesAcrossFolders.length}
                </p>
              </CardContent>
            </Card>
            <Card className="border border-border/70 shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Folders With Matches</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">
                  {
                    filteredSyncResult.folders.filter((folder) => folder.contacts.length > 0)
                      .length
                  }
                </p>
              </CardContent>
            </Card>
            <Card className="border border-border/70 shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Selected Date</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">
                  {filter.date || "Not required"}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-3 text-sm text-muted-foreground">
            <p>
              Included columns: Name, Email, Source Folder, Source Type, Forwarded By,
              Original Sender, Subject, First Seen, Last Seen, Email Count.
            </p>
            <p>Each sheet includes bold headers, auto-sized columns, and Excel filters.</p>
            <p>The date filter is applied to the Last Seen column before the workbook is created.</p>
            <p>
              Sync data is kept in browser session storage only unless password
              persistence was explicitly enabled on the settings page.
            </p>
          </div>

          <ExportButton filter={filter} syncResult={syncResult} />
        </CardContent>
      </Card>
    </main>
  );
}

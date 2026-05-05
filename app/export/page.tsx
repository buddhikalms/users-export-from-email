"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { ExportButton } from "@/components/ExportButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getStoredSyncResult } from "@/lib/storage";
import type { SyncResult } from "@/types/email";

export default function ExportPage() {
  const router = useRouter();
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
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
      <main className="mx-auto max-w-5xl px-6 py-12 lg:px-10">
        <div className="rounded-[1.75rem] border border-dashed border-border bg-white/70 p-8 text-sm text-muted-foreground">
          Preparing workbook export data...
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12 lg:px-10">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Step 4
          </p>
          <h1 className="text-4xl">Export Workbook</h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">
            Create one Excel workbook with an All Contacts sheet and one sheet for
            every Outlook folder you synced.
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

      <div className="grid gap-5 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Folder Sheets</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{syncResult.folders.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">All Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{syncResult.allContacts.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Duplicate Emails</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {syncResult.duplicatesAcrossFolders.length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Workbook Structure</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-3 text-sm text-muted-foreground">
            <p>Included columns: Name, Email, Source Folder, First Seen, Last Seen, Email Count.</p>
            <p>Each sheet includes bold headers, auto-sized columns, and Excel filters.</p>
            <p>
              Sync data is kept in browser session storage only unless password
              persistence was explicitly enabled on the settings page.
            </p>
          </div>

          <ExportButton syncResult={syncResult} />
        </CardContent>
      </Card>
    </main>
  );
}

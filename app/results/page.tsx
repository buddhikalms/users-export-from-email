"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RefreshCcw } from "lucide-react";

import { ResultsTable } from "@/components/ResultsTable";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { getSelectedFolders, getStoredConnectionSettings, saveSyncResult } from "@/lib/storage";
import type { ConnectionSettings, SyncResult } from "@/types/email";

export default function ResultsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<ConnectionSettings | null>(null);
  const [folders, setFolders] = useState<string[]>([]);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const runSync = useCallback(async (currentSettings: ConnectionSettings, currentFolders: string[]) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/imap/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          settings: currentSettings,
          folders: currentFolders,
        }),
      });

      const payload = (await response.json()) as SyncResult & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to sync Outlook folders.");
      }

      setSyncResult(payload);
      saveSyncResult(payload);
    } catch (syncError) {
      setError(
        syncError instanceof Error
          ? syncError.message
          : "Something went wrong during folder sync.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const storedSettings = getStoredConnectionSettings();
    const selectedFolders = getSelectedFolders();

    if (!storedSettings) {
      router.replace("/settings");
      return;
    }

    if (selectedFolders.length === 0) {
      router.replace("/folders");
      return;
    }

    setSettings(storedSettings);
    setFolders(selectedFolders);
    void runSync(storedSettings, selectedFolders);
  }, [router, runSync]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 lg:px-10">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Step 3
          </p>
          <h1 className="text-4xl">Sync Results</h1>
          <p className="max-w-3xl text-base leading-7 text-muted-foreground">
            The app scans message headers from the selected folders, extracts unique
            users from sender and recipient fields, and groups them folder-wise for
            review before export.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            disabled={loading || !settings || folders.length === 0}
            onClick={() => settings && void runSync(settings, folders)}
            variant="outline"
          >
            <RefreshCcw className="h-4 w-4" />
            Re-sync
          </Button>
          <Button asChild variant="outline">
            <Link href="/folders">Change Folders</Link>
          </Button>
          <Button asChild>
            <Link href="/export">Go To Export</Link>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-[1.75rem] border border-dashed border-border bg-white/70 p-10 text-center text-sm text-muted-foreground">
          Scanning selected folders and aggregating contacts...
        </div>
      ) : null}

      {error ? (
        <Alert className="mb-6 border-destructive/25 bg-destructive/5">
          <AlertTitle>Sync failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {!loading && syncResult ? <ResultsTable syncResult={syncResult} /> : null}
    </main>
  );
}

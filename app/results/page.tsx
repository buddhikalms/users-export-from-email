"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RefreshCcw } from "lucide-react";

import { ResultsTable } from "@/components/ResultsTable";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  getSelectedFolders,
  getStoredActiveConnection,
  saveSyncResult,
} from "@/lib/storage";
import { getActiveVaultConnection } from "@/lib/vault-session";
import type { ActiveConnection, SyncResult } from "@/types/email";

export default function ResultsPage() {
  const router = useRouter();
  const [connection, setConnection] = useState<ActiveConnection | null>(null);
  const [folders, setFolders] = useState<string[]>([]);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const runSync = useCallback(
    async (activeConnection: ActiveConnection, currentFolders: string[]) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/imap/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...(activeConnection.mode === "manual"
              ? { settings: getActiveVaultConnection() }
              : activeConnection.mode === "vault"
                ? { settings: getActiveVaultConnection() }
              : { savedAccountId: activeConnection.account.id }),
            folders: currentFolders,
          }),
        });

        const payload = (await response.json()) as SyncResult & { error?: string };

        if (!response.ok) {
          throw new Error(payload.error ?? "Unable to sync mail folders.");
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
    },
    [],
  );

  useEffect(() => {
    const activeConnection = getStoredActiveConnection();
    const selectedFolders = getSelectedFolders();

    if (!activeConnection) {
      router.replace("/settings");
      return;
    }

    if (selectedFolders.length === 0) {
      router.replace("/folders");
      return;
    }

    setConnection(activeConnection);
    setFolders(selectedFolders);
    void runSync(activeConnection, selectedFolders);
  }, [router, runSync]);

  return (
    <main className="w-full">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Step 3
          </p>
          <h1 className="text-4xl">Sync Results</h1>
          <p className="max-w-3xl text-base leading-7 text-muted-foreground">
            The app scans selected folders, extracts unique senders from current
            and forwarded message chains, and groups them folder-wise for review
            before export.
          </p>
          {connection ? (
            <p className="text-xs uppercase tracking-[0.18em] text-primary">
              {connection.mode === "manual"
                ? `Manual session: ${connection.account.email}`
                : connection.mode === "vault"
                  ? `Vault account: ${connection.account.name} (${connection.account.email})`
                : `Saved account: ${connection.account.label} (${connection.account.email})`}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            disabled={loading || !connection || folders.length === 0}
            onClick={() => connection && void runSync(connection, folders)}
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

      {!loading && syncResult ? (
        <ResultsTable
          syncResult={syncResult}
          onFilteredResultChange={(filteredSyncResult) => saveSyncResult(filteredSyncResult)}
        />
      ) : null}
    </main>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RefreshCcw } from "lucide-react";

import { ResultsTable } from "@/components/ResultsTable";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  getSyncDateRange,
  getSelectedFolders,
  getStoredActiveConnection,
  saveSyncResult,
} from "@/lib/storage";
import { getActiveVaultConnection } from "@/lib/vault-session";
import type { ActiveConnection, SyncResult } from "@/types/email";

type BackgroundSyncStatus = {
  jobId: string;
  syncRunId: string;
  status: "queued" | "running" | "completed" | "failed" | "cancelled";
  currentFolder: string | null;
  totalMessages: number;
  processedMessages: number;
  contactsFound: number;
  duplicatesRemoved: number;
  progressPercent: number;
  errorMessage: string | null;
  startedAt: string | null;
  finishedAt: string | null;
};

function isRedisUnavailable(error: string | undefined) {
  return Boolean(error && /redis is not reachable|redis is unavailable/i.test(error));
}

export default function ResultsPage() {
  const router = useRouter();
  const [connection, setConnection] = useState<ActiveConnection | null>(null);
  const [folders, setFolders] = useState<string[]>([]);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [backgroundStatus, setBackgroundStatus] = useState<BackgroundSyncStatus | null>(null);
  const [backgroundJobId, setBackgroundJobId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const runSync = useCallback(
    async (activeConnection: ActiveConnection, currentFolders: string[]) => {
      const dateRange = getSyncDateRange();
      setLoading(true);
      setError(null);
      setSyncResult(null);

      try {
        if (activeConnection.mode === "saved") {
          const response = await fetch("/api/sync/start", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              savedAccountId: activeConnection.account.id,
              folders: currentFolders,
              extractForwardedChains: true,
              dateRange,
            }),
          });
          const payload = (await response.json()) as {
            jobId?: string;
            syncRunId?: string;
            status?: BackgroundSyncStatus["status"];
            error?: string;
          };

          if (!response.ok && response.status === 503 && isRedisUnavailable(payload.error)) {
            const fallbackResponse = await fetch("/api/imap/sync", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                savedAccountId: activeConnection.account.id,
                folders: currentFolders,
                dateRange,
              }),
            });
            const fallbackPayload = (await fallbackResponse.json()) as SyncResult & {
              error?: string;
            };

            if (!fallbackResponse.ok) {
              throw new Error(fallbackPayload.error ?? "Unable to sync mail folders.");
            }

            setSyncResult(fallbackPayload);
            saveSyncResult(fallbackPayload);
            return;
          }

          if (!response.ok || !payload.jobId || !payload.syncRunId) {
            throw new Error(payload.error ?? "Unable to start background sync.");
          }

          setBackgroundJobId(payload.jobId);
          setBackgroundStatus({
            jobId: payload.jobId,
            syncRunId: payload.syncRunId,
            status: payload.status ?? "queued",
            currentFolder: null,
            totalMessages: 0,
            processedMessages: 0,
            contactsFound: 0,
            duplicatesRemoved: 0,
            progressPercent: 0,
            errorMessage: null,
            startedAt: null,
            finishedAt: null,
          });
          setLoading(false);
          return;
        }

        const response = await fetch("/api/imap/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...(activeConnection.mode === "manual"
              ? { settings: getActiveVaultConnection() }
              : { settings: getActiveVaultConnection() }),
            folders: currentFolders,
            dateRange,
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

  useEffect(() => {
    if (!backgroundJobId) {
      return;
    }

    let stopped = false;
    const poll = async () => {
      try {
        const response = await fetch(`/api/sync/status/${encodeURIComponent(backgroundJobId)}`, {
          cache: "no-store",
        });
        const payload = (await response.json()) as BackgroundSyncStatus & { error?: string };

        if (!response.ok) {
          throw new Error(payload.error ?? "Unable to load sync status.");
        }

        if (stopped) {
          return;
        }

        setBackgroundStatus(payload);
        if (["completed", "failed", "cancelled"].includes(payload.status)) {
          setBackgroundJobId(null);
        }
      } catch (statusError) {
        if (!stopped) {
          setError(
            statusError instanceof Error
              ? statusError.message
              : "Unable to load sync status.",
          );
          setBackgroundJobId(null);
        }
      }
    };

    void poll();
    const interval = window.setInterval(() => void poll(), 2_000);

    return () => {
      stopped = true;
      window.clearInterval(interval);
    };
  }, [backgroundJobId]);

  async function cancelBackgroundSync() {
    if (!backgroundStatus?.jobId) {
      return;
    }

    try {
      const response = await fetch(
        `/api/sync/cancel/${encodeURIComponent(backgroundStatus.jobId)}`,
        { method: "POST" },
      );
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to cancel sync.");
      }

      setBackgroundStatus((current) =>
        current ? { ...current, status: "cancelled" } : current,
      );
      setBackgroundJobId(null);
    } catch (cancelError) {
      setError(cancelError instanceof Error ? cancelError.message : "Unable to cancel sync.");
    }
  }

  return (
    <main className="w-full">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Step 3
          </p>
          <h1 className="text-4xl">Sync Results</h1>
          <p className="max-w-3xl text-base leading-7 text-muted-foreground">
            Saved account syncs now run in the background. Manual and vault sessions still
            use the immediate sync path because their plaintext credentials are not stored
            in Redis.
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
            onClick={() => {
              setBackgroundStatus(null);
              setBackgroundJobId(null);
              connection && void runSync(connection, folders);
            }}
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
        <div className="empty-panel p-10">
          Starting sync...
        </div>
      ) : null}

      {error ? (
        <Alert className="mb-6 border-destructive/25 bg-destructive/5">
          <AlertTitle>Sync issue</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {backgroundStatus ? (
        <div className="mb-6 surface-panel rounded-[1.75rem] p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Background Sync
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                {backgroundStatus.status === "completed"
                  ? "Sync completed"
                  : backgroundStatus.status === "failed"
                    ? "Sync failed"
                    : backgroundStatus.status === "cancelled"
                      ? "Sync cancelled"
                      : "Sync running"}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {backgroundStatus.currentFolder
                  ? `Current folder: ${backgroundStatus.currentFolder}`
                  : "Preparing mailbox scan..."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {["queued", "running"].includes(backgroundStatus.status) ? (
                <Button variant="outline" onClick={() => void cancelBackgroundSync()}>
                  Cancel Sync
                </Button>
              ) : null}
              {backgroundStatus.status === "completed" ? (
                <Button asChild>
                  <Link href="/contacts">View Contacts</Link>
                </Button>
              ) : null}
            </div>
          </div>

          <div className="mt-6 h-3 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${backgroundStatus.progressPercent}%` }}
            />
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-4">
            {[
              ["Progress", `${backgroundStatus.progressPercent}%`],
              [
                "Messages",
                `${backgroundStatus.processedMessages} / ${backgroundStatus.totalMessages}`,
              ],
              ["Contacts found", String(backgroundStatus.contactsFound)],
              ["Duplicates removed", String(backgroundStatus.duplicatesRemoved)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-border/70 bg-secondary/40 p-4">
                <div className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  {label}
                </div>
                <div className="mt-2 text-xl font-semibold">{value}</div>
              </div>
            ))}
          </div>

          {backgroundStatus.errorMessage ? (
            <Alert className="mt-5 border-destructive/25 bg-destructive/5">
              <AlertTitle>Worker error</AlertTitle>
              <AlertDescription>{backgroundStatus.errorMessage}</AlertDescription>
            </Alert>
          ) : null}

          {backgroundStatus.status === "completed" ? (
            <p className="mt-5 text-sm text-muted-foreground">
              Contacts were saved to the database. Open Contacts or Export to work with
              the latest synced data.
            </p>
          ) : null}
        </div>
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

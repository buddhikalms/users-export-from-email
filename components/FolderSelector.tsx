"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FolderOpen, RefreshCcw } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { saveSelectedFolders } from "@/lib/storage";
import type { ActiveConnection, MailFolder } from "@/types/email";

interface FolderSelectorProps {
  connection: ActiveConnection;
  initialSelection?: string[];
}

export function FolderSelector({
  connection,
  initialSelection = [],
}: FolderSelectorProps) {
  const router = useRouter();
  const [folders, setFolders] = useState<MailFolder[]>([]);
  const [selected, setSelected] = useState<string[]>(initialSelection);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadFolders() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/imap/folders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          connection.mode === "manual"
            ? { settings: connection.settings }
            : { savedAccountId: connection.account.id },
        ),
      });

      const payload = (await response.json()) as
        | { folders?: MailFolder[]; error?: string }
        | undefined;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to fetch Outlook folders.");
      }

      const nextFolders = payload?.folders ?? [];
      setFolders(nextFolders);

      setSelected((current) => {
        if (current.length > 0) {
          return current;
        }

        const inbox = nextFolders.find((folder) => folder.specialUse === "\\Inbox");
        return inbox ? [inbox.path] : nextFolders.slice(0, 1).map((folder) => folder.path);
      });
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Something went wrong while loading folders.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadFolders();
  }, []);

  const selectedCount = selected.length;
  const folderCountLabel = useMemo(() => {
    if (folders.length === 0) {
      return "No folders loaded";
    }

    return `${selectedCount} of ${folders.length} selected`;
  }, [folders.length, selectedCount]);

  function toggleFolder(path: string) {
    setSelected((current) =>
      current.includes(path)
        ? current.filter((value) => value !== path)
        : [...current, path],
    );
  }

  function continueToSync() {
    if (selected.length === 0) {
      setError("Select at least one Outlook folder before syncing.");
      return;
    }

    setSubmitting(true);
    saveSelectedFolders(selected);
    router.push("/results");
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <CardTitle>Select Folders To Sync</CardTitle>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Choose the Outlook folders whose message headers should be scanned for
            unique contacts.
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-primary">
            {connection.mode === "manual"
              ? `Manual session: ${connection.settings.email}`
              : `Saved account: ${connection.account.label} (${connection.account.email})`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge>{folderCountLabel}</Badge>
          <Button size="sm" type="button" variant="outline" onClick={() => void loadFolders()}>
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {error ? (
          <Alert className="border-destructive/25 bg-destructive/5">
            <AlertTitle>Folder loading issue</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button
            size="sm"
            type="button"
            variant="secondary"
            onClick={() => setSelected(folders.map((folder) => folder.path))}
          >
            Select All
          </Button>
          <Button
            size="sm"
            type="button"
            variant="outline"
            onClick={() => setSelected([])}
          >
            Clear
          </Button>
        </div>

        <div className="grid gap-3">
          {loading ? (
            <div className="rounded-3xl border border-dashed border-border bg-white/60 p-8 text-center text-sm text-muted-foreground">
              Loading folders from Outlook...
            </div>
          ) : folders.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-white/60 p-8 text-center text-sm text-muted-foreground">
              No mail folders were returned for this account.
            </div>
          ) : (
            folders.map((folder) => (
              <label
                key={folder.path}
                className="flex cursor-pointer items-start gap-4 rounded-3xl border border-white/70 bg-white/80 p-4 transition hover:border-primary/25"
              >
                <Checkbox
                  checked={selected.includes(folder.path)}
                  onCheckedChange={() => toggleFolder(folder.path)}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-primary" />
                    <span className="font-medium">{folder.name}</span>
                    {folder.specialUse ? (
                      <Badge className="bg-primary/10">{folder.specialUse}</Badge>
                    ) : null}
                  </div>
                  <p className="mt-1 break-all text-sm text-muted-foreground">
                    {folder.path}
                  </p>
                </div>
              </label>
            ))
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button disabled={loading || submitting} onClick={continueToSync}>
            {submitting ? "Opening sync..." : "Sync Selected Folders"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/settings")}>
            Back To Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

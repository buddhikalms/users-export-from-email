"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { RefreshCcw, Send, X } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SyncResult } from "@/types/email";
import type { KitForm, KitSettingsSummary, KitSyncSummary, KitTag } from "@/types/kit";

type Status = {
  type: "success" | "error";
  message: string;
};

function emptySettings(): KitSettingsSummary {
  return {
    connected: false,
    folderTagMappings: [],
  };
}

export function KitSyncPanel({ syncResult }: { syncResult: SyncResult }) {
  const [settings, setSettings] = useState<KitSettingsSummary>(emptySettings);
  const [tags, setTags] = useState<KitTag[]>([]);
  const [forms, setForms] = useState<KitForm[]>([]);
  const [selectedTagId, setSelectedTagId] = useState("");
  const [selectedFormId, setSelectedFormId] = useState("");
  const [status, setStatus] = useState<Status | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [summary, setSummary] = useState<KitSyncSummary | null>(null);
  const [showModal, setShowModal] = useState(false);

  const folderCount = useMemo(() => syncResult.folders.length, [syncResult.folders.length]);

  async function loadKitState() {
    try {
      const settingsResponse = await fetch("/api/kit/connect");
      const settingsPayload = (await settingsResponse.json()) as {
        settings?: KitSettingsSummary;
        error?: string;
      };

      if (!settingsResponse.ok || !settingsPayload.settings) {
        throw new Error(settingsPayload.error ?? "Unable to load Kit settings.");
      }

      setSettings(settingsPayload.settings);
      setSelectedTagId(settingsPayload.settings.defaultTagId ?? "");
      setSelectedFormId(settingsPayload.settings.defaultFormId ?? "");

      if (!settingsPayload.settings.connected) {
        return;
      }

      const [tagsResponse, formsResponse] = await Promise.all([
        fetch("/api/kit/tags"),
        fetch("/api/kit/forms"),
      ]);
      const tagsPayload = (await tagsResponse.json()) as {
        tags?: KitTag[];
        error?: string;
      };
      const formsPayload = (await formsResponse.json()) as {
        forms?: KitForm[];
        error?: string;
      };

      if (!tagsResponse.ok) {
        throw new Error(tagsPayload.error ?? "Unable to load Kit tags.");
      }

      if (!formsResponse.ok) {
        throw new Error(formsPayload.error ?? "Unable to load Kit forms.");
      }

      setTags(tagsPayload.tags ?? []);
      setForms(formsPayload.forms ?? []);
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to load Kit settings.",
      });
    }
  }

  useEffect(() => {
    void loadKitState();
  }, []);

  async function syncToKit() {
    setStatus(null);
    setSummary(null);
    setShowModal(true);
    setSyncing(true);

    try {
      const response = await fetch("/api/kit/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          syncResult,
          defaultTagId: selectedTagId || undefined,
          defaultFormId: selectedFormId || undefined,
          folderTagMappings: settings.folderTagMappings,
        }),
      });
      const payload = (await response.json()) as {
        summary?: KitSyncSummary;
        error?: string;
      };

      if (!response.ok || !payload.summary) {
        throw new Error(payload.error ?? "Unable to sync contacts to Kit.");
      }

      setSummary(payload.summary);
      setStatus({
        type: "success",
        message: `Kit sync finished: ${payload.summary.uploaded} uploaded, ${payload.summary.failedUploads} failed.`,
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to sync contacts to Kit.",
      });
    } finally {
      setSyncing(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>Sync To Kit</CardTitle>
          <Badge
            className={
              settings.connected
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
            }
          >
            {settings.connected ? "Kit connected" : "Kit not connected"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="kit-sync-tag">
              Select Kit Tag
            </label>
            <select
              id="kit-sync-tag"
              className="flex h-11 w-full rounded-2xl border border-input bg-white/85 px-4 py-2 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              disabled={!settings.connected}
              value={selectedTagId}
              onChange={(event) => setSelectedTagId(event.target.value)}
            >
              <option value="">No default tag</option>
              {tags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="kit-sync-form">
              Select Kit Form
            </label>
            <select
              id="kit-sync-form"
              className="flex h-11 w-full rounded-2xl border border-input bg-white/85 px-4 py-2 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              disabled={!settings.connected}
              value={selectedFormId}
              onChange={(event) => setSelectedFormId(event.target.value)}
            >
              <option value="">No default form</option>
              {forms.map((form) => (
                <option key={form.id} value={form.id}>
                  {form.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
          <div className="rounded-3xl border border-border/70 bg-white/75 p-4">
            <div className="text-2xl font-semibold text-foreground">
              {syncResult.allContacts.length}
            </div>
            contacts ready for cleaning
          </div>
          <div className="rounded-3xl border border-border/70 bg-white/75 p-4">
            <div className="text-2xl font-semibold text-foreground">{folderCount}</div>
            synced folders
          </div>
          <div className="rounded-3xl border border-border/70 bg-white/75 p-4">
            <div className="text-2xl font-semibold text-foreground">
              {settings.folderTagMappings.length}
            </div>
            saved folder mappings
          </div>
        </div>

        {status ? (
          <Alert
            className={
              status.type === "error"
                ? "border-destructive/25 bg-destructive/5"
                : "border-primary/20 bg-primary/5"
            }
          >
            <AlertTitle>{status.type === "error" ? "Kit sync failed" : "Kit sync complete"}</AlertTitle>
            <AlertDescription>{status.message}</AlertDescription>
          </Alert>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button disabled={!settings.connected || syncing} onClick={() => void syncToKit()}>
            <Send className="h-4 w-4" />
            {syncing ? "Syncing to Kit..." : "Sync to Kit"}
          </Button>
          <Button variant="outline" onClick={() => void loadKitState()}>
            <RefreshCcw className="h-4 w-4" />
            Refresh Kit Status
          </Button>
          <Button asChild variant="ghost">
            <Link href={"/settings/kit" as "/settings"}>Kit Settings</Link>
          </Button>
        </div>

        {showModal ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 px-4 backdrop-blur-sm">
            <div className="max-h-[82vh] w-full max-w-3xl overflow-hidden rounded-3xl border border-border bg-white shadow-xl">
              <div className="flex items-start justify-between gap-4 border-b border-border/70 p-5">
                <div>
                  <h3 className="text-xl font-semibold">Kit Sync Progress</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Contacts are cleaned, deduped, uploaded, and tagged server-side.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={syncing}
                  onClick={() => setShowModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-5 overflow-y-auto p-5">
                <div className="h-3 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full bg-primary transition-all ${
                      syncing ? "w-2/3 animate-pulse" : "w-full"
                    }`}
                  />
                </div>

                {summary ? (
                  <div className="grid gap-3 md:grid-cols-3">
                    {[
                      ["Total", summary.totalContacts],
                      ["Uploaded", summary.uploaded],
                      ["Duplicates", summary.skippedDuplicates],
                      ["Invalid", summary.invalidEmails],
                      ["Ignored", summary.ignoredEmails],
                      ["Failed", summary.failedUploads],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-2xl border border-border/70 bg-white/80 p-4"
                      >
                        <div className="text-2xl font-semibold">{value}</div>
                        <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                          {label}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-dashed border-border bg-white/60 p-8 text-center text-sm text-muted-foreground">
                    Uploading in batches. This can take a moment for larger contact lists.
                  </div>
                )}

                <div className="rounded-2xl border border-border/70 bg-secondary/30 p-4">
                  <div className="mb-3 text-sm font-semibold">Upload Logs</div>
                  <div className="max-h-56 space-y-2 overflow-y-auto text-xs text-muted-foreground">
                    {summary?.logs.length ? (
                      summary.logs.map((log, index) => <p key={`${log}-${index}`}>{log}</p>)
                    ) : (
                      <p>Waiting for server response...</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

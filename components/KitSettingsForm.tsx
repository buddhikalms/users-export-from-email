"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, KeyRound, Link2Off, RefreshCcw, Save } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getStoredSyncResult } from "@/lib/storage";
import type { KitFolderTagMapping, KitForm, KitSettingsSummary, KitTag } from "@/types/kit";

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

export function KitSettingsForm() {
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [apiVersion, setApiVersion] = useState<"v4" | "v3">("v4");
  const [settings, setSettings] = useState<KitSettingsSummary>(emptySettings);
  const [tags, setTags] = useState<KitTag[]>([]);
  const [forms, setForms] = useState<KitForm[]>([]);
  const [folderPaths, setFolderPaths] = useState<string[]>([]);
  const [defaultTagId, setDefaultTagId] = useState("");
  const [defaultFormId, setDefaultFormId] = useState("");
  const [mappings, setMappings] = useState<KitFolderTagMapping[]>([]);
  const [status, setStatus] = useState<Status | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);

  const tagsById = useMemo(
    () => new Map(tags.map((tag) => [tag.id, tag])),
    [tags],
  );

  async function loadSettings() {
    setBusyAction("load-settings");

    try {
      const response = await fetch("/api/kit/connect");
      const payload = (await response.json()) as {
        settings?: KitSettingsSummary;
        error?: string;
      };

      if (!response.ok || !payload.settings) {
        throw new Error(payload.error ?? "Unable to load Kit settings.");
      }

      setSettings(payload.settings);
      setApiVersion(payload.settings.apiVersion ?? "v4");
      setDefaultTagId(payload.settings.defaultTagId ?? "");
      setDefaultFormId(payload.settings.defaultFormId ?? "");
      setMappings(payload.settings.folderTagMappings);
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to load Kit settings.",
      });
    } finally {
      setBusyAction(null);
    }
  }

  async function loadKitResources() {
    if (!settings.connected) {
      return;
    }

    setBusyAction("load-resources");

    try {
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
        message: error instanceof Error ? error.message : "Unable to load Kit resources.",
      });
    } finally {
      setBusyAction(null);
    }
  }

  useEffect(() => {
    void loadSettings();

    const stored = getStoredSyncResult();
    const paths = stored?.folders.map((folder) => folder.folderPath) ?? [];
    setFolderPaths(paths);
  }, []);

  useEffect(() => {
    void loadKitResources();
  }, [settings.connected]);

  function updateMapping(folderPath: string, tagId: string) {
    const tag = tagsById.get(tagId);
    setMappings((current) => {
      const rest = current.filter((mapping) => mapping.folderPath !== folderPath);
      if (!tagId || !tag) {
        return rest;
      }

      return [
        ...rest,
        {
          folderPath,
          tagId,
          tagName: tag.name,
        },
      ].sort((left, right) => left.folderPath.localeCompare(right.folderPath));
    });
  }

  async function connectKit() {
    setStatus(null);

    if (!apiKey.trim()) {
      setStatus({ type: "error", message: "Enter your Kit API key first." });
      return;
    }

    setBusyAction("connect");

    try {
      const response = await fetch("/api/kit/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey,
          apiSecret: apiSecret || undefined,
          apiVersion,
          defaultTagId: defaultTagId || undefined,
          defaultFormId: defaultFormId || undefined,
        }),
      });
      const payload = (await response.json()) as {
        settings?: KitSettingsSummary;
        message?: string;
        error?: string;
      };

      if (!response.ok || !payload.settings) {
        throw new Error(payload.error ?? "Unable to connect Kit.");
      }

      setApiKey("");
      setApiSecret("");
      setSettings(payload.settings);
      setStatus({
        type: "success",
        message: payload.message ?? "Kit account connected successfully.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to connect Kit.",
      });
    } finally {
      setBusyAction(null);
    }
  }

  async function savePreferences() {
    setStatus(null);
    setBusyAction("save-preferences");

    try {
      const response = await fetch("/api/kit/connect", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          defaultTagId: defaultTagId || undefined,
          defaultFormId: defaultFormId || undefined,
          folderTagMappings: mappings,
        }),
      });
      const payload = (await response.json()) as {
        settings?: KitSettingsSummary;
        message?: string;
        error?: string;
      };

      if (!response.ok || !payload.settings) {
        throw new Error(payload.error ?? "Unable to save Kit settings.");
      }

      setSettings(payload.settings);
      setStatus({
        type: "success",
        message: payload.message ?? "Kit settings saved.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to save Kit settings.",
      });
    } finally {
      setBusyAction(null);
    }
  }

  async function disconnectKit() {
    setStatus(null);
    setBusyAction("disconnect");

    try {
      const response = await fetch("/api/kit/connect", {
        method: "DELETE",
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Unable to disconnect Kit.");
      }

      setSettings(emptySettings());
      setTags([]);
      setForms([]);
      setDefaultTagId("");
      setDefaultFormId("");
      setApiVersion("v4");
      setMappings([]);
      setStatus({ type: "success", message: "Kit account disconnected." });
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to disconnect Kit.",
      });
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>Kit Connection</CardTitle>
            <Badge
              className={
                settings.connected
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              }
            >
              {settings.connected ? "Connected" : "Not connected"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="kit-api-version">Kit API key type</Label>
            <select
              id="kit-api-version"
              className="flex h-11 w-full rounded-2xl border border-input bg-white/85 px-4 py-2 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              value={apiVersion}
              onChange={(event) => setApiVersion(event.target.value as "v4" | "v3")}
            >
              <option value="v4">V4 API key</option>
              <option value="v3">Legacy V3 key + secret</option>
            </select>
            <p className="text-xs leading-5 text-muted-foreground">
              V4 keys are under Developer settings / V4 Keys. The older V3 section uses
              an API key plus API secret.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="kit-api-key">Kit API key</Label>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="kit-api-key"
                type="password"
                className="pl-10"
                placeholder={
                  settings.connected
                    ? "Enter a new key to replace saved key"
                    : apiVersion === "v4"
                      ? "Paste Kit V4 API key"
                      : "Paste Kit V3 API key"
                }
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
              />
            </div>
          </div>

          {apiVersion === "v3" ? (
            <div className="space-y-2">
              <Label htmlFor="kit-api-secret">Kit API secret</Label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="kit-api-secret"
                  type="password"
                  className="pl-10"
                  placeholder="Paste Kit V3 API secret"
                  value={apiSecret}
                  onChange={(event) => setApiSecret(event.target.value)}
                />
              </div>
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <Button disabled={busyAction === "connect"} onClick={() => void connectKit()}>
              <CheckCircle2 className="h-4 w-4" />
              {settings.connected ? "Test & Replace Credentials" : "Test & Save Credentials"}
            </Button>
            <Button
              disabled={!settings.connected || busyAction === "disconnect"}
              variant="outline"
              onClick={() => void disconnectKit()}
            >
              <Link2Off className="h-4 w-4" />
              Disconnect
            </Button>
          </div>

          {settings.connected ? (
            <Button
              type="button"
              variant="ghost"
              disabled={busyAction === "load-resources"}
              onClick={() => void loadKitResources()}
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh Tags & Forms
            </Button>
          ) : null}

          {status ? (
            <Alert
              className={
                status.type === "error"
                  ? "border-destructive/25 bg-destructive/5"
                  : "border-primary/20 bg-primary/5"
              }
            >
              <AlertTitle>{status.type === "error" ? "Kit issue" : "Kit updated"}</AlertTitle>
              <AlertDescription>{status.message}</AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Export Targets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="default-tag">Select Export Tag</Label>
              <select
                id="default-tag"
                className="flex h-11 w-full rounded-2xl border border-input bg-white/85 px-4 py-2 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                disabled={!settings.connected}
                value={defaultTagId}
                onChange={(event) => setDefaultTagId(event.target.value)}
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
              <Label htmlFor="default-form">Select Export Form</Label>
              <select
                id="default-form"
                className="flex h-11 w-full rounded-2xl border border-input bg-white/85 px-4 py-2 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                disabled={!settings.connected}
                value={defaultFormId}
                onChange={(event) => setDefaultFormId(event.target.value)}
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

          <div className="space-y-3">
            <div>
              <h3 className="font-semibold">Folder To Kit Tag Mapping</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Folder rows appear after you run an email sync in this browser session.
              </p>
            </div>

            {folderPaths.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border bg-white/60 p-8 text-center text-sm text-muted-foreground">
                No synced folder list is available yet.
              </div>
            ) : (
              <div className="grid gap-3">
                {folderPaths.map((folderPath) => {
                  const selectedTagId =
                    mappings.find((mapping) => mapping.folderPath === folderPath)?.tagId ??
                    "";

                  return (
                    <div
                      key={folderPath}
                      className="grid gap-3 rounded-3xl border border-border/70 bg-white/80 p-4 md:grid-cols-[1fr_260px]"
                    >
                      <div className="min-w-0 break-all text-sm font-medium">
                        {folderPath}
                      </div>
                      <select
                        className="flex h-11 w-full rounded-2xl border border-input bg-white/85 px-4 py-2 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                        disabled={!settings.connected}
                        value={selectedTagId}
                        onChange={(event) => updateMapping(folderPath, event.target.value)}
                      >
                        <option value="">No mapped tag</option>
                        {tags.map((tag) => (
                          <option key={tag.id} value={tag.id}>
                            {tag.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <Button
            disabled={!settings.connected || busyAction === "save-preferences"}
            onClick={() => void savePreferences()}
          >
            <Save className="h-4 w-4" />
            Save Kit Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { RefreshCcw, Send, X } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VaultUnlock } from "@/components/vault/VaultUnlock";
import { readJsonResponse } from "@/lib/fetch-json";
import { useVault } from "@/hooks/useVault";
import { integrationRegistry } from "@/lib/integrations/registry";
import type { IntegrationDestinationType } from "@/lib/integrations/types";
import type { SyncResult } from "@/types/email";
import type { KitAccountSummary, KitForm, KitSyncSummary, KitTag } from "@/types/kit";
import type { VaultMarketingAccount } from "@/types/vault";

type DestinationType = "tag" | "form";

type Status = {
  type: "success" | "error";
  message: string;
};

function getKitCredentials(account: VaultMarketingAccount) {
  return {
    apiVersion: account.apiSecret ? ("v3" as const) : ("v4" as const),
    apiKey: account.apiKey,
    apiSecret: account.apiSecret,
  };
}

function VaultKitExportPanel({ syncResult }: { syncResult: SyncResult }) {
  const vault = useVault();
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [destinationType, setDestinationType] = useState<DestinationType>("tag");
  const [tags, setTags] = useState<KitTag[]>([]);
  const [forms, setForms] = useState<KitForm[]>([]);
  const [selectedTagId, setSelectedTagId] = useState("");
  const [selectedFormId, setSelectedFormId] = useState("");
  const [status, setStatus] = useState<Status | null>(null);
  const [loadingDestinations, setLoadingDestinations] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const vaultKitAccounts =
    vault.vaultData?.marketingAccounts.filter((account) => account.platform === "kit") ?? [];
  const selectedAccount =
    vaultKitAccounts.find((account) => account.id === selectedAccountId) ?? null;

  useEffect(() => {
    setSelectedAccountId((current) => current || vaultKitAccounts[0]?.id || "");
  }, [vaultKitAccounts]);

  async function loadVaultDestinations(account: VaultMarketingAccount) {
    setLoadingDestinations(true);
    setStatus(null);
    setTags([]);
    setForms([]);
    setSelectedTagId("");
    setSelectedFormId("");

    try {
      const response = await fetch("/api/kit/vault/destinations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credentials: getKitCredentials(account) }),
      });
      const payload = await readJsonResponse<{
        tags?: KitTag[];
        forms?: KitForm[];
        error?: string;
      }>(response);

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to load Kit destinations.");
      }

      setTags(payload.tags ?? []);
      setForms(payload.forms ?? []);
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error ? error.message : "Unable to load Kit destinations.",
      });
    } finally {
      setLoadingDestinations(false);
    }
  }

  useEffect(() => {
    if (selectedAccount) {
      void loadVaultDestinations(selectedAccount);
    }
  }, [selectedAccountId]);

  async function exportWithVaultAccount() {
    if (!selectedAccount) {
      setStatus({ type: "error", message: "Select a Kit account from the vault." });
      return;
    }

    if (destinationType === "tag" && !selectedTagId) {
      setStatus({ type: "error", message: "Select a Kit tag." });
      return;
    }

    if (destinationType === "form" && !selectedFormId) {
      setStatus({ type: "error", message: "Select a Kit form." });
      return;
    }

    setSyncing(true);
    setStatus(null);

    try {
      const response = await fetch("/api/kit/vault/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountName: selectedAccount.name,
          credentials: getKitCredentials(selectedAccount),
          syncResult,
          destinationType,
          tagId: destinationType === "tag" ? selectedTagId : undefined,
          formId: destinationType === "form" ? selectedFormId : undefined,
          destinationName:
            destinationType === "tag"
              ? tags.find((tag) => tag.id === selectedTagId)?.name
              : forms.find((form) => form.id === selectedFormId)?.name,
        }),
      });
      const payload = await readJsonResponse<{ summary?: KitSyncSummary; error?: string }>(
        response,
      );

      if (!response.ok || !payload.summary) {
        throw new Error(payload.error ?? "Unable to export contacts to Kit.");
      }

      setStatus({
        type: "success",
        message: `Export complete for ${selectedAccount.name}: ${payload.summary.uploaded} uploaded, ${payload.summary.failedUploads} failed.`,
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to export contacts to Kit.",
      });
    } finally {
      setSyncing(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Secure Vault Export to Kit</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {!vault.hasVault ? (
          <div className="rounded-3xl border border-dashed border-border bg-white/60 dark:bg-card/70 p-6 text-sm text-muted-foreground">
            Create a Security Vault before using encrypted platform credentials.
          </div>
        ) : !vault.isUnlocked ? (
          <VaultUnlock
            onUnlock={async (masterPassword) => {
              await vault.unlockVault(masterPassword);
            }}
          />
        ) : vaultKitAccounts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-white/60 dark:bg-card/70 p-6 text-sm text-muted-foreground">
            Add a Kit account to the unlocked vault before exporting.
          </div>
        ) : (
          <>
            <div className="grid gap-5 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="vault-kit-account">
                  Vault account
                </label>
                <select
                  id="vault-kit-account"
                  className="flex h-11 w-full rounded-2xl border border-input bg-white/85 dark:bg-card/85 px-4 py-2 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  value={selectedAccountId}
                  onChange={(event) => setSelectedAccountId(event.target.value)}
                >
                  {vaultKitAccounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="vault-kit-destination-type">
                  Destination
                </label>
                <select
                  id="vault-kit-destination-type"
                  className="flex h-11 w-full rounded-2xl border border-input bg-white/85 dark:bg-card/85 px-4 py-2 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  value={destinationType}
                  onChange={(event) => setDestinationType(event.target.value as DestinationType)}
                >
                  <option value="tag">Tag</option>
                  <option value="form">Form</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="vault-kit-destination">
                  Tag / Form
                </label>
                <select
                  id="vault-kit-destination"
                  className="flex h-11 w-full rounded-2xl border border-input bg-white/85 dark:bg-card/85 px-4 py-2 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  disabled={loadingDestinations}
                  value={destinationType === "tag" ? selectedTagId : selectedFormId}
                  onChange={(event) =>
                    destinationType === "tag"
                      ? setSelectedTagId(event.target.value)
                      : setSelectedFormId(event.target.value)
                  }
                >
                  <option value="">
                    {loadingDestinations ? "Loading..." : "Select destination"}
                  </option>
                  {(destinationType === "tag" ? tags : forms).map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
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
                <AlertTitle>
                  {status.type === "error" ? "Vault export failed" : "Vault export complete"}
                </AlertTitle>
                <AlertDescription>{status.message}</AlertDescription>
              </Alert>
            ) : null}

            <Button disabled={syncing || loadingDestinations} onClick={() => void exportWithVaultAccount()}>
              <Send className="h-4 w-4" />
              {syncing ? "Exporting..." : "Export With Vault Account"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function VaultPlatformExportPanel({ syncResult }: { syncResult: SyncResult }) {
  const vault = useVault();
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [destinationType, setDestinationType] = useState<IntegrationDestinationType>("list");
  const [destinationName, setDestinationName] = useState("");
  const [status, setStatus] = useState<Status | null>(null);
  const [syncing, setSyncing] = useState(false);

  const accounts =
    vault.vaultData?.marketingAccounts.filter(
      (account) => account.platform === "zoho_campaigns" || account.platform === "brevo",
    ) ?? [];
  const selectedAccount = accounts.find((account) => account.id === selectedAccountId) ?? null;
  const selectedAdapter = selectedAccount
    ? integrationRegistry.find((adapter) => adapter.platform === selectedAccount.platform)
    : null;
  const destinationTypes = selectedAdapter?.destinationTypes ?? ["list"];

  useEffect(() => {
    setSelectedAccountId((current) => current || accounts[0]?.id || "");
  }, [accounts]);

  useEffect(() => {
    setDestinationType(destinationTypes[0] ?? "list");
  }, [selectedAccount?.platform]);

  async function exportWithVaultAccount() {
    if (!selectedAccount || !selectedAdapter) {
      setStatus({ type: "error", message: "Select a platform account from the vault." });
      return;
    }

    if (!destinationName.trim()) {
      setStatus({ type: "error", message: "Enter the destination name or ID." });
      return;
    }

    setSyncing(true);
    setStatus(null);

    try {
      const response = await fetch("/api/integrations/vault/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: selectedAccount.platform,
          accountName: selectedAccount.name,
          credentials: {
            apiKey: selectedAccount.apiKey,
            apiSecret: selectedAccount.apiSecret,
            serverPrefix: selectedAccount.serverPrefix,
            accountId: selectedAccount.accountId,
          },
          syncResult,
          destination: {
            id: destinationName.trim(),
            name: destinationName.trim(),
            type: destinationType,
          },
        }),
      });
      const payload = await readJsonResponse<{
        summary?: { uploaded: number; failed: number; skippedDuplicates: number };
        error?: string;
      }>(response);

      if (!response.ok || !payload.summary) {
        throw new Error(payload.error ?? "Unable to export contacts.");
      }

      setStatus({
        type: "success",
        message: `${selectedAdapter.label} export queued: ${payload.summary.skippedDuplicates} duplicates skipped, ${payload.summary.failed} failed.`,
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to export contacts.",
      });
    } finally {
      setSyncing(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Secure Vault Export to Other Platforms</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {!vault.hasVault ? (
          <div className="rounded-3xl border border-dashed border-border bg-white/60 dark:bg-card/70 p-6 text-sm text-muted-foreground">
            Create a Security Vault before using encrypted platform credentials.
          </div>
        ) : !vault.isUnlocked ? (
          <VaultUnlock
            onUnlock={async (masterPassword) => {
              await vault.unlockVault(masterPassword);
            }}
          />
        ) : accounts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-white/60 dark:bg-card/70 p-6 text-sm text-muted-foreground">
            Add Mailchimp, Brevo, HubSpot, Beehiiv, or ActiveCampaign credentials to
            the unlocked vault before exporting.
          </div>
        ) : (
          <>
            <div className="grid gap-5 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="vault-platform-account">
                  Vault account
                </label>
                <select
                  id="vault-platform-account"
                  className="flex h-11 w-full rounded-2xl border border-input bg-white/85 dark:bg-card/85 px-4 py-2 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  value={selectedAccountId}
                  onChange={(event) => setSelectedAccountId(event.target.value)}
                >
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name} / {account.platform}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="vault-platform-destination-type">
                  Destination type
                </label>
                <select
                  id="vault-platform-destination-type"
                  className="flex h-11 w-full rounded-2xl border border-input bg-white/85 dark:bg-card/85 px-4 py-2 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  value={destinationType}
                  onChange={(event) =>
                    setDestinationType(event.target.value as IntegrationDestinationType)
                  }
                >
                  {destinationTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="vault-platform-destination">
                  Destination name or ID
                </label>
                <input
                  id="vault-platform-destination"
                  className="flex h-11 w-full rounded-2xl border border-input bg-white/85 dark:bg-card/85 px-4 py-2 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  value={destinationName}
                  onChange={(event) => setDestinationName(event.target.value)}
                />
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
                <AlertTitle>
                  {status.type === "error" ? "Vault export failed" : "Vault export complete"}
                </AlertTitle>
                <AlertDescription>{status.message}</AlertDescription>
              </Alert>
            ) : null}

            <Button disabled={syncing} onClick={() => void exportWithVaultAccount()}>
              <Send className="h-4 w-4" />
              {syncing ? "Exporting..." : "Export With Vault Account"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function KitSyncPanel({ syncResult }: { syncResult: SyncResult }) {
  const [accounts, setAccounts] = useState<KitAccountSummary[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [destinationType, setDestinationType] = useState<DestinationType>("tag");
  const [tags, setTags] = useState<KitTag[]>([]);
  const [forms, setForms] = useState<KitForm[]>([]);
  const [selectedTagId, setSelectedTagId] = useState("");
  const [selectedFormId, setSelectedFormId] = useState("");
  const [loadingDestinations, setLoadingDestinations] = useState(false);
  const [status, setStatus] = useState<Status | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [summary, setSummary] = useState<KitSyncSummary | null>(null);
  const [showModal, setShowModal] = useState(false);

  const selectedAccount = useMemo(
    () => accounts.find((account) => account.id === selectedAccountId) ?? null,
    [accounts, selectedAccountId],
  );
  const selectedDestinationName = useMemo(() => {
    if (destinationType === "tag") {
      return tags.find((tag) => tag.id === selectedTagId)?.name;
    }

    return forms.find((form) => form.id === selectedFormId)?.name;
  }, [destinationType, forms, selectedFormId, selectedTagId, tags]);

  async function loadAccounts() {
    try {
      const response = await fetch("/api/kit/accounts");
      const payload = await readJsonResponse<{
        accounts?: KitAccountSummary[];
        error?: string;
      }>(response);

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to load Kit accounts.");
      }

      const nextAccounts = payload.accounts ?? [];
      setAccounts(nextAccounts);
      setSelectedAccountId((current) => {
        if (current && nextAccounts.some((account) => account.id === current)) {
          return current;
        }

        return nextAccounts.find((account) => account.isDefault)?.id ?? nextAccounts[0]?.id ?? "";
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to load Kit accounts.",
      });
    }
  }

  async function loadDestinations(accountId: string) {
    if (!accountId) {
      setTags([]);
      setForms([]);
      return;
    }

    setLoadingDestinations(true);
    setStatus(null);
    setTags([]);
    setForms([]);
    setSelectedTagId("");
    setSelectedFormId("");

    try {
      const [tagsResponse, formsResponse] = await Promise.all([
        fetch(`/api/kit/accounts/${accountId}/tags`),
        fetch(`/api/kit/accounts/${accountId}/forms`),
      ]);
      const tagsPayload = await readJsonResponse<{
        tags?: KitTag[];
        error?: string;
      }>(tagsResponse);
      const formsPayload = await readJsonResponse<{
        forms?: KitForm[];
        error?: string;
      }>(formsResponse);

      if (!tagsResponse.ok) {
        throw new Error(tagsPayload.error ?? "Unable to load tags for this Kit account.");
      }

      if (!formsResponse.ok) {
        throw new Error(formsPayload.error ?? "Unable to load forms for this Kit account.");
      }

      setTags(tagsPayload.tags ?? []);
      setForms(formsPayload.forms ?? []);
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to load Kit destinations for this account.",
      });
    } finally {
      setLoadingDestinations(false);
    }
  }

  useEffect(() => {
    void loadAccounts();
  }, []);

  useEffect(() => {
    void loadDestinations(selectedAccountId);
  }, [selectedAccountId]);

  async function exportToSelectedKitAccount() {
    setStatus(null);
    setSummary(null);

    if (!selectedAccountId) {
      setStatus({ type: "error", message: "Select a Kit account first." });
      return;
    }

    if (destinationType === "tag" && !selectedTagId) {
      setStatus({ type: "error", message: "Select a Kit tag." });
      return;
    }

    if (destinationType === "form" && !selectedFormId) {
      setStatus({ type: "error", message: "Select a Kit form." });
      return;
    }

    setShowModal(true);
    setSyncing(true);

    try {
      const response = await fetch(`/api/kit/accounts/${selectedAccountId}/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          syncResult,
          destinationType,
          tagId: destinationType === "tag" ? selectedTagId : undefined,
          formId: destinationType === "form" ? selectedFormId : undefined,
          destinationName: selectedDestinationName,
        }),
      });
      const payload = await readJsonResponse<{
        summary?: KitSyncSummary;
        error?: string;
      }>(response);

      if (!response.ok || !payload.summary) {
        throw new Error(payload.error ?? "Unable to export contacts to Kit.");
      }

      setSummary(payload.summary);
      setStatus({
        type: "success",
        message: `Export complete for ${payload.summary.kitAccountName}: ${payload.summary.uploaded} uploaded, ${payload.summary.failedUploads} failed.`,
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to export contacts to Kit.",
      });
    } finally {
      setSyncing(false);
    }
  }

  return (
    <>
    <VaultKitExportPanel syncResult={syncResult} />
    <VaultPlatformExportPanel syncResult={syncResult} />
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>Export Contacts to Kit</CardTitle>
          <Badge
            className={
              accounts.length > 0
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
            }
          >
            {accounts.length} Kit account{accounts.length === 1 ? "" : "s"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="kit-account">
              Kit Account
            </label>
            <select
              id="kit-account"
              className="flex h-11 w-full rounded-2xl border border-input bg-white/85 dark:bg-card/85 px-4 py-2 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              value={selectedAccountId}
              onChange={(event) => setSelectedAccountId(event.target.value)}
            >
              <option value="">Select Kit account</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                  {account.isDefault ? " (Default)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="destination-type">
              Destination Type
            </label>
            <select
              id="destination-type"
              className="flex h-11 w-full rounded-2xl border border-input bg-white/85 dark:bg-card/85 px-4 py-2 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              value={destinationType}
              onChange={(event) => setDestinationType(event.target.value as DestinationType)}
            >
              <option value="tag">Tag</option>
              <option value="form">Form</option>
            </select>
          </div>

          {destinationType === "tag" ? (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="kit-tag">
                Kit Tag
              </label>
              <select
                id="kit-tag"
                className="flex h-11 w-full rounded-2xl border border-input bg-white/85 dark:bg-card/85 px-4 py-2 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                disabled={!selectedAccountId || loadingDestinations}
                value={selectedTagId}
                onChange={(event) => setSelectedTagId(event.target.value)}
              >
                <option value="">
                  {loadingDestinations ? "Loading tags..." : "Select tag"}
                </option>
                {tags.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="kit-form">
                Kit Form
              </label>
              <select
                id="kit-form"
                className="flex h-11 w-full rounded-2xl border border-input bg-white/85 dark:bg-card/85 px-4 py-2 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                disabled={!selectedAccountId || loadingDestinations}
                value={selectedFormId}
                onChange={(event) => setSelectedFormId(event.target.value)}
              >
                <option value="">
                  {loadingDestinations ? "Loading forms..." : "Select form"}
                </option>
                {forms.map((form) => (
                  <option key={form.id} value={form.id}>
                    {form.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
          <div className="rounded-3xl border border-border/70 bg-white/75 dark:bg-card/75 p-4">
            <div className="text-2xl font-semibold text-foreground">
              {syncResult.allContacts.length}
            </div>
            contacts ready for cleaning
          </div>
          <div className="rounded-3xl border border-border/70 bg-white/75 dark:bg-card/75 p-4">
            <div className="text-2xl font-semibold text-foreground">
              {syncResult.folders.length}
            </div>
            synced folders
          </div>
          <div className="rounded-3xl border border-border/70 bg-white/75 dark:bg-card/75 p-4">
            <div className="text-2xl font-semibold text-foreground">
              {selectedAccount?.apiVersion.toUpperCase() ?? "-"}
            </div>
            selected account API
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
            <AlertTitle>
              {status.type === "error" ? "Kit export failed" : "Kit export complete"}
            </AlertTitle>
            <AlertDescription>{status.message}</AlertDescription>
          </Alert>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button
            disabled={!selectedAccountId || loadingDestinations || syncing}
            onClick={() => void exportToSelectedKitAccount()}
          >
            <Send className="h-4 w-4" />
            {syncing ? "Exporting..." : "Export to Selected Kit Account"}
          </Button>
          <Button variant="outline" onClick={() => void loadAccounts()}>
            <RefreshCcw className="h-4 w-4" />
            Refresh Accounts
          </Button>
          <Button asChild variant="ghost">
            <Link href={"/settings/kit" as "/settings"}>Kit Accounts</Link>
          </Button>
        </div>

        {showModal ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 px-4 backdrop-blur-sm">
            <div className="max-h-[82vh] w-full max-w-3xl overflow-hidden rounded-3xl border border-border bg-white dark:bg-card shadow-xl">
              <div className="flex items-start justify-between gap-4 border-b border-border/70 p-5">
                <div>
                  <h3 className="text-xl font-semibold">Export Contacts to Kit</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Contacts are cleaned, deduped, uploaded, and assigned to the selected destination.
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
                  <>
                    <div className="rounded-2xl border border-border/70 bg-white/80 dark:bg-card/80 p-4 text-sm">
                      <div className="font-semibold">{summary.kitAccountName}</div>
                      <div className="text-muted-foreground">
                        {summary.destinationType} / {summary.destinationName}
                      </div>
                    </div>
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
                          className="rounded-2xl border border-border/70 bg-white/80 dark:bg-card/80 p-4"
                        >
                          <div className="text-2xl font-semibold">{value}</div>
                          <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                            {label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="rounded-3xl border border-dashed border-border bg-white/60 dark:bg-card/70 p-8 text-center text-sm text-muted-foreground">
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
    </>
  );
}

"use client";

import { useMemo, useState } from "react";
import { KeyRound, Mail, Plus, Trash2 } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { VaultData, VaultEmailAccount, VaultMarketingAccount } from "@/types/vault";

type MarketingPlatform = VaultMarketingAccount["platform"];

const platformLabels: Record<MarketingPlatform, string> = {
  activecampaign: "ActiveCampaign",
  beehiiv: "Beehiiv",
  brevo: "Brevo",
  hubspot: "HubSpot",
  kit: "Kit",
  mailchimp: "Mailchimp",
  zoho_campaigns: "Zoho Campaigns",
};

function newId() {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function maskSecret(value?: string) {
  if (!value) {
    return "Not set";
  }

  if (value.length <= 8) {
    return "********";
  }

  return `${value.slice(0, 8)}${"x".repeat(8)}${value.slice(-4)}`;
}

const emptyEmailForm = {
  name: "",
  email: "",
  host: "outlook.office365.com",
  port: "993",
  secure: true,
  username: "",
  password: "",
};

const emptyMarketingForm = {
  platform: "kit" as MarketingPlatform,
  name: "",
  apiKey: "",
  apiSecret: "",
  serverPrefix: "",
  accountId: "",
};

export function CredentialManager({
  vaultData,
  onSave,
  onDeleteCredential,
}: {
  vaultData: VaultData;
  onSave: (vaultData: VaultData) => Promise<void>;
  onDeleteCredential: (credentialId: string) => Promise<void>;
}) {
  const [emailForm, setEmailForm] = useState(emptyEmailForm);
  const [marketingForm, setMarketingForm] = useState(emptyMarketingForm);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );
  const [busy, setBusy] = useState(false);

  const sortedMarketing = useMemo(
    () =>
      [...vaultData.marketingAccounts].sort((left, right) =>
        left.platform.localeCompare(right.platform) || left.name.localeCompare(right.name),
      ),
    [vaultData.marketingAccounts],
  );

  async function addEmailAccount() {
    setStatus(null);

    if (!emailForm.name || !emailForm.email || !emailForm.host || !emailForm.password) {
      setStatus({ type: "error", message: "Complete the email account fields first." });
      return;
    }

    setBusy(true);
    try {
      const account: VaultEmailAccount = {
        id: newId(),
        name: emailForm.name,
        type: "imap",
        email: emailForm.email,
        host: emailForm.host,
        port: Number(emailForm.port),
        secure: emailForm.secure,
        security: emailForm.secure ? "ssl_tls" : "starttls",
        username: emailForm.username || emailForm.email,
        password: emailForm.password,
      };

      await onSave({
        ...vaultData,
        emailAccounts: [account, ...vaultData.emailAccounts],
      });
      setEmailForm(emptyEmailForm);
      setStatus({ type: "success", message: "Email account encrypted into the vault." });
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to save email account.",
      });
    } finally {
      setBusy(false);
    }
  }

  async function addMarketingAccount() {
    setStatus(null);

    if (!marketingForm.name || !marketingForm.apiKey) {
      setStatus({ type: "error", message: "Add a name and API key first." });
      return;
    }

    setBusy(true);
    try {
      const account: VaultMarketingAccount = {
        id: newId(),
        platform: marketingForm.platform,
        name: marketingForm.name,
        apiKey: marketingForm.apiKey,
        apiSecret: marketingForm.apiSecret || undefined,
        serverPrefix: marketingForm.serverPrefix || undefined,
        accountId: marketingForm.accountId || undefined,
      };

      await onSave({
        ...vaultData,
        marketingAccounts: [account, ...vaultData.marketingAccounts],
      });
      setMarketingForm(emptyMarketingForm);
      setStatus({
        type: "success",
        message: `${platformLabels[account.platform]} account encrypted into the vault.`,
      });
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error ? error.message : "Unable to save marketing account.",
      });
    } finally {
      setBusy(false);
    }
  }

  async function removeCredential(credentialId: string) {
    setBusy(true);
    setStatus(null);

    try {
      await onDeleteCredential(credentialId);
      setStatus({ type: "success", message: "Credential removed from the vault." });
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to remove credential.",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {status ? (
        <Alert
          className={
            status.type === "error"
              ? "border-destructive/25 bg-destructive/5"
              : "border-primary/20 bg-primary/5"
          }
        >
          <AlertTitle>{status.type === "error" ? "Vault update failed" : "Vault saved"}</AlertTitle>
          <AlertDescription>{status.message}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add Email Account</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="vault-email-name">Account name</Label>
              <Input
                id="vault-email-name"
                value={emailForm.name}
                onChange={(event) =>
                  setEmailForm((current) => ({ ...current, name: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vault-email-address">Email</Label>
              <Input
                id="vault-email-address"
                value={emailForm.email}
                onChange={(event) =>
                  setEmailForm((current) => ({
                    ...current,
                    email: event.target.value,
                    username: current.username || event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vault-email-username">Username</Label>
              <Input
                id="vault-email-username"
                value={emailForm.username}
                onChange={(event) =>
                  setEmailForm((current) => ({ ...current, username: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vault-email-host">IMAP host</Label>
              <Input
                id="vault-email-host"
                value={emailForm.host}
                onChange={(event) =>
                  setEmailForm((current) => ({ ...current, host: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vault-email-port">Port</Label>
              <Input
                id="vault-email-port"
                inputMode="numeric"
                value={emailForm.port}
                onChange={(event) =>
                  setEmailForm((current) => ({ ...current, port: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="vault-email-password">Password or app password</Label>
              <Input
                id="vault-email-password"
                autoComplete="new-password"
                type="password"
                value={emailForm.password}
                onChange={(event) =>
                  setEmailForm((current) => ({ ...current, password: event.target.value }))
                }
              />
            </div>
            <Button className="md:col-span-2" disabled={busy} onClick={() => void addEmailAccount()}>
              <Plus className="h-4 w-4" />
              Save Email Account
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add Marketing Platform Account</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="vault-platform">Platform</Label>
              <select
                id="vault-platform"
                className="flex h-11 w-full rounded-2xl border border-input bg-white/85 px-4 py-2 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                value={marketingForm.platform}
                onChange={(event) =>
                  setMarketingForm((current) => ({
                    ...current,
                    platform: event.target.value as MarketingPlatform,
                  }))
                }
              >
                {Object.entries(platformLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="vault-platform-name">Account name</Label>
              <Input
                id="vault-platform-name"
                value={marketingForm.name}
                onChange={(event) =>
                  setMarketingForm((current) => ({ ...current, name: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="vault-api-key">API key</Label>
              <Input
                id="vault-api-key"
                autoComplete="new-password"
                type="password"
                value={marketingForm.apiKey}
                onChange={(event) =>
                  setMarketingForm((current) => ({ ...current, apiKey: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vault-api-secret">API secret</Label>
              <Input
                id="vault-api-secret"
                autoComplete="new-password"
                type="password"
                value={marketingForm.apiSecret}
                onChange={(event) =>
                  setMarketingForm((current) => ({ ...current, apiSecret: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vault-server-prefix">Server prefix</Label>
              <Input
                id="vault-server-prefix"
                placeholder="us21"
                value={marketingForm.serverPrefix}
                onChange={(event) =>
                  setMarketingForm((current) => ({
                    ...current,
                    serverPrefix: event.target.value,
                  }))
                }
              />
            </div>
            <Button
              className="md:col-span-2"
              disabled={busy}
              onClick={() => void addMarketingAccount()}
            >
              <Plus className="h-4 w-4" />
              Save Platform Account
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Saved Accounts List</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...vaultData.emailAccounts].map((account) => (
            <div
              key={account.id}
              className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-border/70 bg-white/80 p-4"
            >
              <div>
                <div className="flex items-center gap-2 font-semibold">
                  <Mail className="h-4 w-4 text-primary" />
                  {account.name}
                  <Badge>Email</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {account.email} / {account.host}:{account.port} / {account.username}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Password: {maskSecret(account.password)}
                </p>
              </div>
              <Button
                disabled={busy}
                size="sm"
                variant="outline"
                onClick={() => void removeCredential(account.id)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          ))}

          {sortedMarketing.map((account) => (
            <div
              key={account.id}
              className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-border/70 bg-white/80 p-4"
            >
              <div>
                <div className="flex items-center gap-2 font-semibold">
                  <KeyRound className="h-4 w-4 text-primary" />
                  {account.name}
                  <Badge>{platformLabels[account.platform]}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  API key: {maskSecret(account.apiKey)}
                  {account.serverPrefix ? ` / ${account.serverPrefix}` : ""}
                </p>
              </div>
              <Button
                disabled={busy}
                size="sm"
                variant="outline"
                onClick={() => void removeCredential(account.id)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          ))}

          {vaultData.emailAccounts.length + vaultData.marketingAccounts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-white/60 p-8 text-center text-sm text-muted-foreground">
              No credentials are saved in this encrypted vault yet.
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

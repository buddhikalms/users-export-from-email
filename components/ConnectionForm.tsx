"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Database,
  LockKeyhole,
  Mail,
  PlayCircle,
  Save,
  Server,
  ShieldCheck,
  Trash2,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  clearSyncArtifacts,
  saveActiveConnection,
  saveConnectionSettings,
} from "@/lib/storage";
import {
  connectionSettingsSchema,
  defaultConnectionSettings,
  savedEmailAccountSchema,
} from "@/lib/validation";
import type { SavedEmailAccountSummary } from "@/types/email";

type FormState = {
  label: string;
  email: string;
  host: string;
  port: string;
  security: "ssl_tls" | "starttls";
  username: string;
  password: string;
  rememberPassword: boolean;
};

type ProviderPreset = {
  id: "outlook" | "zoho" | "zoho_pro" | "custom";
  name: string;
  host: string;
  port: number;
  security: FormState["security"];
  description: string;
  usernamePlaceholder: string;
  passwordPlaceholder: string;
};

const providerPresets: ProviderPreset[] = [
  {
    id: "outlook",
    name: "Outlook / Microsoft 365",
    host: "outlook.office365.com",
    port: 993,
    security: "ssl_tls",
    description: "Use for Outlook.com, Hotmail, and Microsoft 365 IMAP mailboxes.",
    usernamePlaceholder: "Usually the full Outlook email",
    passwordPlaceholder: "Enter account password or Outlook app password",
  },
  {
    id: "zoho",
    name: "Zoho Mail",
    host: "imap.zoho.com",
    port: 993,
    security: "ssl_tls",
    description: "Use for Zoho personal mailboxes and free organization accounts.",
    usernamePlaceholder: "Usually the full Zoho email",
    passwordPlaceholder: "Enter Zoho password or app-specific password",
  },
  {
    id: "zoho_pro",
    name: "Zoho Mail domain / paid",
    host: "imappro.zoho.com",
    port: 993,
    security: "ssl_tls",
    description: "Use for paid Zoho organization users with domain-based addresses.",
    usernamePlaceholder: "Full mailbox email address",
    passwordPlaceholder: "Enter Zoho app-specific password if required",
  },
  {
    id: "custom",
    name: "Custom IMAP",
    host: "",
    port: 993,
    security: "ssl_tls",
    description: "Enter the incoming IMAP settings from your email provider.",
    usernamePlaceholder: "Usually your full email address",
    passwordPlaceholder: "Enter account password or app password",
  },
];

function toFormState(): FormState {
  return {
    label: "",
    ...defaultConnectionSettings,
    port: String(defaultConnectionSettings.port),
  };
}

export function ConnectionForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(toFormState);
  const [providerId, setProviderId] = useState<ProviderPreset["id"]>("outlook");
  const [savedAccounts, setSavedAccounts] = useState<SavedEmailAccountSummary[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);

  async function loadAccounts() {
    setLoadingAccounts(true);

    try {
      const response = await fetch("/api/accounts");
      const payload = (await response.json()) as {
        accounts?: SavedEmailAccountSummary[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to load saved email accounts.");
      }

      setSavedAccounts(payload.accounts ?? []);
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to load saved email accounts.",
      });
    } finally {
      setLoadingAccounts(false);
    }
  }

  useEffect(() => {
    void loadAccounts();
  }, []);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function updateEmail(value: string) {
    setForm((current) => ({
      ...current,
      email: value,
      username:
        !current.username || current.username === current.email ? value : current.username,
    }));
  }

  function applyProviderPreset(nextProviderId: ProviderPreset["id"]) {
    const preset =
      providerPresets.find((item) => item.id === nextProviderId) ??
      providerPresets[0];

    setProviderId(nextProviderId);
    setForm((current) => ({
      ...current,
      host: nextProviderId === "custom" ? "" : preset.host,
      port: String(preset.port),
      security: preset.security,
      username: current.username || current.email,
    }));
  }

  const selectedPreset =
    providerPresets.find((preset) => preset.id === providerId) ?? providerPresets[0];

  async function useSavedAccount(account: SavedEmailAccountSummary) {
    clearSyncArtifacts();
    saveActiveConnection({
      mode: "saved",
      account,
    });
    router.push("/folders");
  }

  async function testSavedAccount(account: SavedEmailAccountSummary) {
    setBusyAction(`test-${account.id}`);
    setStatus(null);

    try {
      const response = await fetch("/api/imap/test-connection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          savedAccountId: account.id,
        }),
      });

      const payload = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to validate the saved account.");
      }

      setStatus({
        type: "success",
        message:
          payload.message ??
          `Connection validated successfully for ${account.label}.`,
      });
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to validate the saved account.",
      });
    } finally {
      setBusyAction(null);
    }
  }

  async function deleteSavedAccount(account: SavedEmailAccountSummary) {
    setBusyAction(`delete-${account.id}`);
    setStatus(null);

    try {
      const response = await fetch(`/api/accounts/${account.id}`, {
        method: "DELETE",
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to delete the saved account.");
      }

      setSavedAccounts((current) => current.filter((item) => item.id !== account.id));
      setStatus({
        type: "success",
        message: `${account.label} was removed from the database.`,
      });
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to delete the saved account.",
      });
    } finally {
      setBusyAction(null);
    }
  }

  async function handleManualConnect() {
    setStatus(null);

    const parsed = connectionSettingsSchema.safeParse({
      ...form,
      port: Number(form.port),
    });

    if (!parsed.success) {
      setStatus({
        type: "error",
        message:
          parsed.error.issues[0]?.message ?? "Please review the connection details.",
      });
      return;
    }

    setBusyAction("manual-connect");

    try {
      const response = await fetch("/api/imap/test-connection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          settings: parsed.data,
        }),
      });

      const payload = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to connect over IMAP.");
      }

      clearSyncArtifacts();
      saveConnectionSettings(parsed.data);
      setStatus({
        type: "success",
        message: payload.message ?? "Connection successful. Loading folders next.",
      });
      router.push("/folders");
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong while testing the connection.",
      });
    } finally {
      setBusyAction(null);
    }
  }

  async function saveAccount(useAfterSave: boolean) {
    setStatus(null);

    const parsed = savedEmailAccountSchema.safeParse({
      ...form,
      port: Number(form.port),
    });

    if (!parsed.success) {
      setStatus({
        type: "error",
        message:
          parsed.error.issues[0]?.message ?? "Please review the saved account details.",
      });
      return;
    }

    setBusyAction(useAfterSave ? "save-use" : "save");

    try {
      const response = await fetch("/api/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsed.data),
      });

      const payload = (await response.json()) as {
        account?: SavedEmailAccountSummary;
        error?: string;
        message?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to save the email account.");
      }

      const account = payload.account;
      if (!account) {
        throw new Error("The saved account response was incomplete.");
      }

      setSavedAccounts((current) => [account, ...current.filter((item) => item.id !== account.id)]);
      setStatus({
        type: "success",
        message: payload.message ?? "Email account saved successfully.",
      });

      if (useAfterSave) {
        clearSyncArtifacts();
        saveActiveConnection({
          mode: "saved",
          account,
        });
        router.push("/folders");
        return;
      }

      setForm((current) => ({
        ...current,
        password: "",
      }));
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to save the email account.",
      });
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <Card className="border-white/80">
        <CardHeader>
          <CardTitle>Saved Email Accounts</CardTitle>
          <p className="text-sm leading-6 text-muted-foreground">
            Keep multiple IMAP accounts in the database and choose any one when
            you want to sync folders.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingAccounts ? (
            <div className="rounded-3xl border border-dashed border-border bg-white/60 p-8 text-center text-sm text-muted-foreground">
              Loading saved accounts...
            </div>
          ) : savedAccounts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-white/60 p-8 text-center text-sm text-muted-foreground">
              No email accounts are saved yet. Use the form to add your first one.
            </div>
          ) : (
            savedAccounts.map((account) => (
              <div
                key={account.id}
                className="rounded-[1.5rem] border border-white/70 bg-white/85 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold">{account.label}</h3>
                      {account.isDefault ? <Badge>Default</Badge> : null}
                    </div>
                    <p className="text-sm text-muted-foreground">{account.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {account.host}:{account.port} / {account.security} / {account.username}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() => void useSavedAccount(account)}
                    >
                      <PlayCircle className="h-4 w-4" />
                      Use
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busyAction === `test-${account.id}`}
                      onClick={() => void testSavedAccount(account)}
                    >
                      Test
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busyAction === `delete-${account.id}`}
                      onClick={() => void deleteSavedAccount(account)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="border-white/80">
        <CardHeader>
          <CardTitle>Add Email Account Or Use One-Time Connection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-3xl border border-dashed border-primary/20 bg-primary/5 p-5 text-sm leading-7 text-muted-foreground">
            Choose a provider to fill the incoming IMAP host, port, and security.
            For Zoho, make sure IMAP access is enabled in Zoho Mail settings and
            use an app-specific password when your account requires it. Saved
            account passwords are encrypted before they are stored in the database.
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="provider">Email provider</Label>
              <select
                id="provider"
                className="flex h-11 w-full rounded-2xl border border-input bg-white/85 px-4 py-2 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                value={providerId}
                onChange={(event) =>
                  applyProviderPreset(event.target.value as ProviderPreset["id"])
                }
              >
                {providerPresets.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name}
                  </option>
                ))}
              </select>
              <p className="text-xs leading-5 text-muted-foreground">
                {selectedPreset.description}
              </p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="label">Account label</Label>
              <div className="relative">
                <Database className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="label"
                  className="pl-10"
                  placeholder="Account label"
                  value={form.label}
                  onChange={(event) => updateField("label", event.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  autoComplete="email"
                  className="pl-10"
                  placeholder="Email address"
                  value={form.email}
                  onChange={(event) => updateEmail(event.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <ShieldCheck className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  autoComplete="username"
                  className="pl-10"
                  placeholder={selectedPreset.usernamePlaceholder}
                  value={form.username}
                  onChange={(event) => updateField("username", event.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="host">Incoming mail server host</Label>
              <div className="relative">
                <Server className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="host"
                  className="pl-10"
                  placeholder={selectedPreset.host || "IMAP host"}
                  value={form.host}
                  onChange={(event) => updateField("host", event.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="port">Port</Label>
              <Input
                id="port"
                inputMode="numeric"
                placeholder="993"
                value={form.port}
                onChange={(event) => updateField("port", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="security">Security type</Label>
              <select
                id="security"
                className="flex h-11 w-full rounded-2xl border border-input bg-white/85 px-4 py-2 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                value={form.security}
                onChange={(event) =>
                  updateField("security", event.target.value as FormState["security"])
                }
              >
                <option value="ssl_tls">SSL/TLS</option>
                <option value="starttls">STARTTLS</option>
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="password">Password or app password</Label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  className="pl-10"
                  placeholder={selectedPreset.passwordPlaceholder}
                  value={form.password}
                  onChange={(event) => updateField("password", event.target.value)}
                />
              </div>
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
                {status.type === "error" ? "Action failed" : "Workspace updated"}
              </AlertTitle>
              <AlertDescription>{status.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="flex flex-col gap-3">
            <Button
              disabled={busyAction === "manual-connect"}
              onClick={() => void handleManualConnect()}
            >
              {busyAction === "manual-connect"
                ? "Testing connection..."
                : "Test Manual Connection & Continue"}
            </Button>
            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                variant="outline"
                disabled={busyAction === "save"}
                onClick={() => void saveAccount(false)}
              >
                <Save className="h-4 w-4" />
                Save Account
              </Button>
              <Button
                variant="outline"
                disabled={busyAction === "save-use"}
                onClick={() => void saveAccount(true)}
              >
                <PlayCircle className="h-4 w-4" />
                Save & Use Account
              </Button>
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setProviderId("outlook");
                setForm(toFormState());
              }}
            >
              Reset Form
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

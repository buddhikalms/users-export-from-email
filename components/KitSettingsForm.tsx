"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, KeyRound, Pencil, Save, Star, Trash2 } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { readJsonResponse } from "@/lib/fetch-json";
import type { KitAccountSummary } from "@/types/kit";

type FormState = {
  id?: string;
  name: string;
  apiVersion: "v4" | "v3";
  apiKey: string;
  apiSecret: string;
  isDefault: boolean;
};

type Status = {
  type: "success" | "error";
  message: string;
};

const emptyForm: FormState = {
  name: "",
  apiVersion: "v4",
  apiKey: "",
  apiSecret: "",
  isDefault: false,
};

export function KitSettingsForm() {
  const [accounts, setAccounts] = useState<KitAccountSummary[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [status, setStatus] = useState<Status | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);

  async function loadAccounts() {
    setBusyAction("load");

    try {
      const response = await fetch("/api/kit/accounts");
      const payload = await readJsonResponse<{
        accounts?: KitAccountSummary[];
        error?: string;
      }>(response);

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to load Kit accounts.");
      }

      setAccounts(payload.accounts ?? []);
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to load Kit accounts.",
      });
    } finally {
      setBusyAction(null);
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

  function editAccount(account: KitAccountSummary) {
    setForm({
      id: account.id,
      name: account.name,
      apiVersion: account.apiVersion,
      apiKey: "",
      apiSecret: "",
      isDefault: account.isDefault,
    });
    setStatus(null);
  }

  async function saveAccount() {
    setStatus(null);

    if (!form.name.trim()) {
      setStatus({ type: "error", message: "Enter a Kit account name." });
      return;
    }

    if (!form.id && !form.apiKey.trim()) {
      setStatus({ type: "error", message: "Enter a Kit API key." });
      return;
    }

    if (form.apiVersion === "v3" && !form.id && !form.apiSecret.trim()) {
      setStatus({ type: "error", message: "Enter the Kit V3 API secret." });
      return;
    }

    setBusyAction("save");

    try {
      const response = await fetch(
        form.id ? `/api/kit/accounts/${form.id}` : "/api/kit/accounts",
        {
          method: form.id ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name,
            apiVersion: form.apiVersion,
            apiKey: form.apiKey || undefined,
            apiSecret: form.apiSecret || undefined,
            isDefault: form.isDefault,
          }),
        },
      );
      const payload = await readJsonResponse<{
        account?: KitAccountSummary;
        message?: string;
        error?: string;
      }>(response);

      if (!response.ok || !payload.account) {
        throw new Error(payload.error ?? "Unable to save Kit account.");
      }

      await loadAccounts();
      setForm(emptyForm);
      setStatus({
        type: "success",
        message: payload.message ?? "Kit account saved.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to save Kit account.",
      });
    } finally {
      setBusyAction(null);
    }
  }

  async function testAccount(account: KitAccountSummary) {
    setBusyAction(`test-${account.id}`);
    setStatus(null);

    try {
      const response = await fetch(`/api/kit/accounts/${account.id}/test`, {
        method: "POST",
      });
      const payload = await readJsonResponse<{ message?: string; error?: string }>(
        response,
      );

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to test Kit account.");
      }

      setStatus({
        type: "success",
        message: payload.message ?? `${account.name} connected successfully.`,
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to test Kit account.",
      });
    } finally {
      setBusyAction(null);
    }
  }

  async function setDefaultAccount(account: KitAccountSummary) {
    setBusyAction(`default-${account.id}`);
    setStatus(null);

    try {
      const response = await fetch(`/api/kit/accounts/${account.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isDefault: true }),
      });
      const payload = await readJsonResponse<{ error?: string }>(response);

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to set default Kit account.");
      }

      await loadAccounts();
      setStatus({ type: "success", message: `${account.name} is now the default.` });
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error ? error.message : "Unable to set default Kit account.",
      });
    } finally {
      setBusyAction(null);
    }
  }

  async function deleteAccount(account: KitAccountSummary) {
    setBusyAction(`delete-${account.id}`);
    setStatus(null);

    try {
      const response = await fetch(`/api/kit/accounts/${account.id}`, {
        method: "DELETE",
      });
      const payload = await readJsonResponse<{ error?: string }>(response);

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to delete Kit account.");
      }

      await loadAccounts();
      setStatus({ type: "success", message: `${account.name} was deleted.` });
      if (form.id === account.id) {
        setForm(emptyForm);
      }
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to delete Kit account.",
      });
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <Card>
        <CardHeader>
          <CardTitle>{form.id ? "Edit Kit Account" : "Add Kit Account"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="kit-account-name">Account name</Label>
            <Input
              id="kit-account-name"
              placeholder="Account name"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="kit-api-version">Kit API key type</Label>
            <select
              id="kit-api-version"
              className="flex h-11 w-full rounded-2xl border border-input bg-white/80 dark:bg-card/80 px-4 py-2 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              value={form.apiVersion}
              onChange={(event) =>
                updateField("apiVersion", event.target.value as FormState["apiVersion"])
              }
            >
              <option value="v4">V4 API key</option>
              <option value="v3">Legacy V3 key + secret</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="kit-api-key">Kit API key</Label>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="kit-api-key"
                className="pl-10"
                type="password"
                placeholder={
                  form.id ? "Leave blank to keep existing key" : "Paste Kit API key"
                }
                value={form.apiKey}
                onChange={(event) => updateField("apiKey", event.target.value)}
              />
            </div>
          </div>

          {form.apiVersion === "v3" ? (
            <div className="space-y-2">
              <Label htmlFor="kit-api-secret">Kit API secret</Label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="kit-api-secret"
                  className="pl-10"
                  type="password"
                  placeholder={
                    form.id ? "Leave blank to keep existing secret" : "Paste Kit API secret"
                  }
                  value={form.apiSecret}
                  onChange={(event) => updateField("apiSecret", event.target.value)}
                />
              </div>
            </div>
          ) : null}

          <label className="flex items-center gap-3 text-sm font-medium">
            <input
              checked={form.isDefault}
              type="checkbox"
              onChange={(event) => updateField("isDefault", event.target.checked)}
            />
            Set as default Kit account
          </label>

          <div className="flex flex-wrap gap-3">
            <Button disabled={busyAction === "save"} onClick={() => void saveAccount()}>
              <Save className="h-4 w-4" />
              {form.id ? "Save Changes" : "Test & Save Account"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setForm(emptyForm)}>
              Clear
            </Button>
          </div>

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
          <CardTitle>Connected Kit Accounts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {accounts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-white/60 dark:bg-card/70 p-8 text-center text-sm text-muted-foreground">
              No Kit accounts are connected yet.
            </div>
          ) : (
            accounts.map((account) => (
              <div
                key={account.id}
                className="rounded-3xl border border-border/70 bg-white/80 dark:bg-card/80 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold">{account.name}</h3>
                      {account.isDefault ? <Badge>Default</Badge> : null}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {account.apiVersion.toUpperCase()} / API key encrypted /{" "}
                      {account.hasApiSecret ? "secret saved" : "no secret"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busyAction === `test-${account.id}`}
                      onClick={() => void testAccount(account)}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Test
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => editAccount(account)}>
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={account.isDefault || busyAction === `default-${account.id}`}
                      onClick={() => void setDefaultAccount(account)}
                    >
                      <Star className="h-4 w-4" />
                      Default
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busyAction === `delete-${account.id}`}
                      onClick={() => void deleteAccount(account)}
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
    </div>
  );
}

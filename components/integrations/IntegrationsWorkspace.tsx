"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ElementType } from "react";
import {
  Activity,
  CheckCircle2,
  CircleDashed,
  KeyRound,
  Layers3,
  PlugZap,
  RefreshCcw,
  Send,
  X,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatCount } from "@/lib/dashboard-data";
import type { IntegrationDestinationType, MarketingPlatformId } from "@/lib/integrations/types";

type IntegrationCard = {
  platform: MarketingPlatformId;
  label: string;
  description: string;
  destinationTypes: IntegrationDestinationType[];
  accounts: number;
  syncs: number;
  health: string;
};

type FormState = {
  platform: MarketingPlatformId;
  name: string;
  apiKey: string;
  apiSecret: string;
  serverPrefix: string;
  externalAccountId: string;
  isDefault: boolean;
};

const emptyForm: FormState = {
  platform: "mailchimp",
  name: "",
  apiKey: "",
  apiSecret: "",
  serverPrefix: "",
  externalAccountId: "",
  isDefault: true,
};

export function IntegrationsWorkspace({
  connectedCount,
  integrations,
  platformCount,
  queuedJobs,
  syncHealth,
}: {
  connectedCount: number;
  integrations: IntegrationCard[];
  platformCount: number;
  queuedJobs: number;
  syncHealth: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );
  const selectedIntegration = integrations.find((item) => item.platform === form.platform);
  const statCards: Array<[string, string | number, ElementType]> = useMemo(
    () => [
      ["Connected Accounts", connectedCount, KeyRound],
      ["Platforms Available", platformCount, Layers3],
      ["Platform Sync Jobs", queuedJobs, Send],
      ["Sync Success", syncHealth, Activity],
    ],
    [connectedCount, platformCount, queuedJobs, syncHealth],
  );

  function openConnect(platform?: MarketingPlatformId) {
    const nextPlatform = platform ?? integrations[0]?.platform ?? "mailchimp";
    const label = integrations.find((item) => item.platform === nextPlatform)?.label ?? "";

    setForm({
      ...emptyForm,
      platform: nextPlatform,
      name: label ? `${label} account` : "",
    });
    setStatus(null);
    setModalOpen(true);
  }

  async function saveAccount() {
    setSaving(true);
    setStatus(null);

    try {
      const response = await fetch("/api/integrations/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to connect integration account.");
      }

      setStatus({
        type: "success",
        message: payload.message ?? "Integration account connected.",
      });
      setModalOpen(false);
      setForm(emptyForm);
      router.refresh();
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error ? error.message : "Unable to connect integration account.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-5 rounded-[2rem] border border-border/70 bg-card/82 p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <Badge className="bg-primary/10 text-primary">Integration Center</Badge>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">Marketing Sync Hub</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            Connect multiple accounts per platform, test API health, select audiences, and route
            deduped contacts into the right marketing destination.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => openConnect()}>
            <PlugZap className="h-4 w-4" />
            Add Account
          </Button>
          <Button variant="outline" onClick={() => router.refresh()}>
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </section>

      {status ? (
        <Alert
          className={
            status.type === "error"
              ? "border-destructive/25 bg-destructive/5"
              : "border-primary/20 bg-primary/5"
          }
        >
          <AlertTitle>{status.type === "error" ? "Connection failed" : "Connected"}</AlertTitle>
          <AlertDescription>{status.message}</AlertDescription>
        </Alert>
      ) : null}

      <section className="grid gap-4 md:grid-cols-4">
        {statCards.map(([label, value, Icon]) => (
          <Card key={label}>
            <CardContent className="flex items-start justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-3 text-3xl font-semibold">
                  {typeof value === "number" ? formatCount(value) : value}
                </p>
              </div>
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {integrations.map((integration) => (
          <Card key={integration.platform} className="overflow-hidden">
            <CardHeader className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-foreground">
                    {integration.label.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{integration.label}</CardTitle>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {integration.destinationTypes.map((type) => (
                        <Badge key={type} className="bg-secondary text-secondary-foreground">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                {integration.accounts > 0 ? (
                  <Badge className="bg-accent/15 text-accent-foreground dark:text-accent">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Connected
                  </Badge>
                ) : (
                  <Badge className="bg-secondary text-secondary-foreground">
                    <CircleDashed className="h-3.5 w-3.5" />
                    Not connected
                  </Badge>
                )}
              </div>
              <p className="text-sm leading-6 text-muted-foreground">{integration.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-secondary/70 p-3">
                  <div className="text-lg font-semibold">{formatCount(integration.accounts)}</div>
                  <div className="text-xs text-muted-foreground">accounts</div>
                </div>
                <div className="rounded-2xl bg-secondary/70 p-3">
                  <div className="text-lg font-semibold">{formatCount(integration.syncs)}</div>
                  <div className="text-xs text-muted-foreground">syncs</div>
                </div>
                <div className="rounded-2xl bg-secondary/70 p-3">
                  <div className="text-lg font-semibold">{integration.health}</div>
                  <div className="text-xs text-muted-foreground">success</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={integration.accounts > 0 ? "outline" : "default"}
                  onClick={() => openConnect(integration.platform)}
                >
                  {integration.accounts > 0 ? "Add Account" : "Connect"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => openConnect(integration.platform)}>
                  Test API
                </Button>
                <Button size="sm" variant="ghost" onClick={() => openConnect(integration.platform)}>
                  Destinations
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 px-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl border border-border bg-card shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-border/70 p-5">
              <div>
                <h2 className="text-xl font-semibold">Connect Integration Account</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  API credentials are encrypted before they are stored.
                </p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setModalOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid gap-4 p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="platform">
                    Platform
                  </label>
                  <select
                    id="platform"
                    className="flex h-11 w-full rounded-2xl border border-input bg-white/85 px-4 py-2 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:bg-card"
                    value={form.platform}
                    onChange={(event) => {
                      const platform = event.target.value as MarketingPlatformId;
                      const label = integrations.find((item) => item.platform === platform)?.label ?? "";
                      setForm((current) => ({
                        ...current,
                        platform,
                        name: current.name || (label ? `${label} account` : ""),
                      }));
                    }}
                  >
                    {integrations.map((integration) => (
                      <option key={integration.platform} value={integration.platform}>
                        {integration.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="account-name">
                    Account name
                  </label>
                  <Input
                    id="account-name"
                    value={form.name}
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="api-key">
                  API key
                </label>
                <Input
                  id="api-key"
                  type="password"
                  value={form.apiKey}
                  onChange={(event) => setForm((current) => ({ ...current, apiKey: event.target.value }))}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="api-secret">
                    API secret
                  </label>
                  <Input
                    id="api-secret"
                    type="password"
                    value={form.apiSecret}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, apiSecret: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="server-prefix">
                    Server prefix / region
                  </label>
                  <Input
                    id="server-prefix"
                    value={form.serverPrefix}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, serverPrefix: event.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="external-account">
                  External account id
                </label>
                <Input
                  id="external-account"
                  value={form.externalAccountId}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, externalAccountId: event.target.value }))
                  }
                />
              </div>

              <label className="flex items-center gap-3 text-sm font-medium">
                <input
                  checked={form.isDefault}
                  type="checkbox"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, isDefault: event.target.checked }))
                  }
                />
                Set as default {selectedIntegration?.label ?? "platform"} account
              </label>

              <div className="rounded-2xl bg-secondary/70 p-4 text-sm text-muted-foreground">
                {selectedIntegration?.description}
              </div>

              <div className="flex flex-wrap justify-end gap-3">
                <Button variant="outline" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button disabled={saving} onClick={() => void saveAccount()}>
                  {saving ? "Connecting..." : "Test & Connect"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ElementType } from "react";
import {
  Bot,
  CalendarClock,
  CheckCircle2,
  FolderSync,
  GitBranch,
  Sparkles,
  Tags,
  Workflow,
  X,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  automationSchedulePresets,
  type AutomationTriggerValue,
} from "@/lib/automation";
import { formatCount, formatDateTime } from "@/lib/dashboard-data";

type AutomationRuleView = {
  id: string;
  name: string;
  trigger: string;
  enabled: boolean;
  schedule: string | null;
  lastRunAt: string | null;
  nextRunAt: string | null;
  emailAccountId: string | null;
  marketingAccountId: string | null;
  marketingAccountType: string | null;
  marketingPlatform: string | null;
};

type EmailAccountOption = {
  id: string;
  label: string;
  email: string;
  isDefault: boolean;
};

type PlatformAccountOption = {
  id: string;
  name: string;
  platform: string;
  platformLabel: string;
  accountType: "kit" | "integration";
  isDefault: boolean;
};

type FormState = {
  name: string;
  trigger: AutomationTriggerValue;
  enabled: boolean;
  schedule: string;
  emailAccountId: string;
  marketingAccountId: string;
  marketingAccountType: "kit" | "integration" | "";
  marketingPlatform: string;
  conditionText: string;
  actionText: string;
  nextRunAt: string;
};

const emptyForm: FormState = {
  name: "",
  trigger: "MANUAL",
  enabled: true,
  schedule: "",
  emailAccountId: "",
  marketingAccountId: "",
  marketingAccountType: "",
  marketingPlatform: "",
  conditionText: "",
  actionText: "",
  nextRunAt: "",
};

const ruleTemplates: Array<{
  title: string;
  description: string;
  trigger: AutomationTriggerValue;
  name: string;
  schedule?: string;
  conditionText?: string;
  actionText?: string;
}> = [
  {
    title: "Scheduled platform export",
    description: "Export users from a selected mailbox into Kit or another connected platform.",
    trigger: "SCHEDULED",
    name: "Scheduled platform export",
    schedule: "hourly",
    actionText: "Export users from the selected email account to the selected platform.",
  },
  {
    title: "New contact cleanup",
    description: "Prepare contacts for review as soon as they are created.",
    trigger: "CONTACT_CREATED",
    name: "Clean up new contacts",
    conditionText: "When a new contact is created",
    actionText: "Normalize contact fields and mark duplicates for review.",
  },
  {
    title: "Folder destination rule",
    description: "Keep a folder-based workflow ready for marketing syncs.",
    trigger: "FOLDER_SYNCED",
    name: "Folder sync follow-up",
    conditionText: "When a watched folder finishes syncing",
    actionText: "Apply folder tags and queue marketing destination sync.",
  },
];

function titleCase(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}

function toDateTimeLocalValue(date: Date) {
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function getDefaultNextRun(minutesFromNow = 60) {
  return toDateTimeLocalValue(new Date(Date.now() + minutesFromNow * 60 * 1000));
}

function getPresetMinutes(schedule: string) {
  return automationSchedulePresets.find((preset) => preset.schedule === schedule)?.minutes ?? 60;
}

export function AutomationWorkspace({
  aiJobCount,
  emailAccounts,
  jobCount,
  platformAccounts,
  rules,
  scheduledCount,
}: {
  aiJobCount: number;
  emailAccounts: EmailAccountOption[];
  jobCount: number;
  platformAccounts: PlatformAccountOption[];
  rules: AutomationRuleView[];
  scheduledCount: number;
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );
  const statCards: Array<[string, string, ElementType]> = useMemo(
    () => [
      ["Scheduled Syncs", formatCount(scheduledCount), CalendarClock],
      ["Automation Rules", formatCount(rules.length), Tags],
      ["Background Jobs", formatCount(jobCount), FolderSync],
      ["AI Jobs", formatCount(aiJobCount), Bot],
    ],
    [aiJobCount, jobCount, rules.length, scheduledCount],
  );
  const emailAccountById = useMemo(
    () => new Map(emailAccounts.map((account) => [account.id, account])),
    [emailAccounts],
  );
  const platformAccountByKey = useMemo(
    () =>
      new Map(
        platformAccounts.map((account) => [`${account.accountType}:${account.id}`, account]),
      ),
    [platformAccounts],
  );
  const selectedPlatformAccount = form.marketingAccountId
    ? platformAccountByKey.get(`${form.marketingAccountType}:${form.marketingAccountId}`)
    : null;

  function getDefaultRoute() {
    const emailAccount = emailAccounts.find((account) => account.isDefault) ?? emailAccounts[0];
    const platformAccount =
      platformAccounts.find((account) => account.isDefault) ?? platformAccounts[0];

    return {
      emailAccountId: emailAccount?.id ?? "",
      marketingAccountId: platformAccount?.id ?? "",
      marketingAccountType: platformAccount?.accountType ?? "",
      marketingPlatform: platformAccount?.platform ?? "",
    };
  }

  function openRuleForm(trigger: AutomationTriggerValue) {
    const schedule = trigger === "SCHEDULED" ? "hourly" : "";
    const route = getDefaultRoute();

    setForm({
      ...emptyForm,
      ...route,
      trigger,
      schedule,
      name: trigger === "SCHEDULED" ? "Scheduled platform export" : "",
      actionText:
        trigger === "SCHEDULED" ? "Export users from the selected email account to the selected platform." : "",
      nextRunAt: trigger === "SCHEDULED" ? getDefaultNextRun(60) : "",
    });
    setStatus(null);
    setModalOpen(true);
  }

  function openTemplate(template: (typeof ruleTemplates)[number]) {
    const schedule = template.schedule ?? "";
    const route = getDefaultRoute();

    setForm({
      ...emptyForm,
      ...route,
      trigger: template.trigger,
      name: template.name,
      schedule,
      conditionText: template.conditionText ?? "",
      actionText: template.actionText ?? "",
      nextRunAt:
        template.trigger === "SCHEDULED" ? getDefaultNextRun(getPresetMinutes(schedule)) : "",
    });
    setStatus(null);
    setModalOpen(true);
  }

  async function saveRule() {
    setSaving(true);
    setStatus(null);

    try {
      const response = await fetch("/api/automation/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to create automation rule.");
      }

      setStatus({ type: "success", message: payload.message ?? "Automation rule created." });
      setModalOpen(false);
      setForm(emptyForm);
      router.refresh();
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to create automation rule.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-border/70 bg-card/82 p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Badge className="bg-primary/10 text-primary">Automation</Badge>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight">Lead Workflow Engine</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
              Schedule mailbox syncs, map folders to marketing destinations, auto-tag contacts,
              and queue long-running exports with retry-ready background jobs.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => openRuleForm("MANUAL")}>
              <Workflow className="h-4 w-4" />
              New Rule
            </Button>
            <Button variant="outline" onClick={() => openRuleForm("SCHEDULED")}>
              <CalendarClock className="h-4 w-4" />
              Schedule Sync
            </Button>
          </div>
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
          <AlertTitle>{status.type === "error" ? "Action failed" : "Automation saved"}</AlertTitle>
          <AlertDescription>{status.message}</AlertDescription>
        </Alert>
      ) : null}

      <section className="grid gap-4 md:grid-cols-4">
        {statCards.map(([label, value, Icon]) => (
          <Card key={label}>
            <CardContent className="flex items-start justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-3 text-3xl font-semibold">{value}</p>
              </div>
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {ruleTemplates.map((template) => (
          <button
            key={template.title}
            className="rounded-[1.75rem] border border-border/80 bg-card/80 p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            onClick={() => openTemplate(template)}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">{template.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {template.description}
                </p>
              </div>
              <Badge className="shrink-0 bg-secondary text-secondary-foreground">
                {titleCase(template.trigger)}
              </Badge>
            </div>
          </button>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Rules</CardTitle>
          </CardHeader>
          <CardContent>
            {rules.length ? (
              <div className="divide-y divide-border/70">
                {rules.map((rule) => (
                  <div
                    key={rule.id}
                    className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold">{rule.name}</h2>
                        <Badge className={rule.enabled ? "" : "bg-secondary text-secondary-foreground"}>
                          {rule.enabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Next run: {formatDateTime(rule.nextRunAt ? new Date(rule.nextRunAt) : null)}
                      </p>
                      {rule.schedule ? (
                        <p className="mt-1 text-xs text-muted-foreground">Schedule: {rule.schedule}</p>
                      ) : null}
                      {rule.emailAccountId && rule.marketingAccountId ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Export route:{" "}
                          {emailAccountById.get(rule.emailAccountId)?.label ?? "Selected email"} to{" "}
                          {platformAccountByKey.get(
                            `${rule.marketingAccountType}:${rule.marketingAccountId}`,
                          )?.platformLabel ?? rule.marketingPlatform ?? "selected platform"}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <Badge className="bg-secondary text-secondary-foreground">
                        {titleCase(rule.trigger)}
                      </Badge>
                      Last run: {formatDateTime(rule.lastRunAt ? new Date(rule.lastRunAt) : null)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-border bg-secondary/30 p-8 text-center text-sm text-muted-foreground">
                No automation rules have been created yet.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Queue Architecture</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              {[
                `Background jobs saved: ${formatCount(jobCount)}`,
                `AI enrichment jobs saved: ${formatCount(aiJobCount)}`,
                `Scheduled rules saved: ${formatCount(scheduledCount)}`,
              ].map((item) => (
                <div key={item} className="flex gap-3 rounded-2xl bg-secondary/70 p-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Readiness</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                ["Contacts with AI category", Sparkles],
                ["Contacts with lead score", GitBranch],
                ["Contacts with company", Bot],
                ["Cleanup logs", CheckCircle2],
              ].map(([label, Icon]) => (
                <div
                  key={label as string}
                  className="flex items-center justify-between rounded-2xl border border-border/70 p-3"
                >
                  <span className="text-sm font-medium">{label as string}</span>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 px-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-border bg-card shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-border/70 p-5">
              <div>
                <h2 className="text-xl font-semibold">Create Automation Rule</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Save a rule to your automation workspace.
                </p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setModalOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid gap-4 p-5">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="rule-name">
                  Rule name
                </label>
                <Input
                  id="rule-name"
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="rule-trigger">
                    Trigger
                  </label>
                  <select
                    id="rule-trigger"
                    className="flex h-11 w-full rounded-2xl border border-input bg-white/85 px-4 py-2 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:bg-card"
                    value={form.trigger}
                    onChange={(event) =>
                      setForm((current) => {
                        const trigger = event.target.value as AutomationTriggerValue;
                        const schedule = trigger === "SCHEDULED" ? current.schedule || "hourly" : "";

                        return {
                          ...current,
                          trigger,
                          schedule,
                          nextRunAt:
                            trigger === "SCHEDULED" && !current.nextRunAt
                              ? getDefaultNextRun(getPresetMinutes(schedule))
                              : current.nextRunAt,
                        };
                      })
                    }
                  >
                    <option value="MANUAL">Manual</option>
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="FOLDER_SYNCED">Folder synced</option>
                    <option value="CONTACT_CREATED">Contact created</option>
                    <option value="TAG_MATCHED">Tag matched</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="next-run">
                    Next run
                  </label>
                  <Input
                    id="next-run"
                    type="datetime-local"
                    value={form.nextRunAt}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, nextRunAt: event.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="email-account">
                    Email account
                  </label>
                  <select
                    id="email-account"
                    className="flex h-11 w-full rounded-2xl border border-input bg-white/85 px-4 py-2 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:bg-card"
                    value={form.emailAccountId}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, emailAccountId: event.target.value }))
                    }
                  >
                    <option value="">Select email account</option>
                    {emailAccounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.label} ({account.email}){account.isDefault ? " - default" : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="platform-account">
                    Platform account
                  </label>
                  <select
                    id="platform-account"
                    className="flex h-11 w-full rounded-2xl border border-input bg-white/85 px-4 py-2 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:bg-card"
                    value={
                      form.marketingAccountId
                        ? `${form.marketingAccountType}:${form.marketingAccountId}`
                        : ""
                    }
                    onChange={(event) => {
                      const account = platformAccountByKey.get(event.target.value);

                      setForm((current) => ({
                        ...current,
                        marketingAccountId: account?.id ?? "",
                        marketingAccountType: account?.accountType ?? "",
                        marketingPlatform: account?.platform ?? "",
                      }));
                    }}
                  >
                    <option value="">Select Kit or other account</option>
                    {platformAccounts.map((account) => (
                      <option key={`${account.accountType}:${account.id}`} value={`${account.accountType}:${account.id}`}>
                        {account.platformLabel} - {account.name}
                        {account.isDefault ? " - default" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="rounded-2xl bg-secondary/70 p-4 text-sm text-muted-foreground">
                {selectedPlatformAccount
                  ? `Users will be exported to ${selectedPlatformAccount.platformLabel} using ${selectedPlatformAccount.name}.`
                  : "Select a platform account to enable automatic user export."}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="schedule">
                  Schedule
                </label>
                <select
                  className="flex h-11 w-full rounded-2xl border border-input bg-white/85 px-4 py-2 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60 dark:bg-card"
                  disabled={form.trigger !== "SCHEDULED"}
                  id="schedule"
                  value={form.schedule}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      schedule: event.target.value,
                      nextRunAt: getDefaultNextRun(getPresetMinutes(event.target.value)),
                    }))
                  }
                >
                  <option value="">Manual or event based</option>
                  {automationSchedulePresets.map((preset) => (
                    <option key={preset.value} value={preset.schedule}>
                      {preset.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="conditions">
                  Conditions
                </label>
                <Input
                  id="conditions"
                  value={form.conditionText}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, conditionText: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="actions">
                  Actions
                </label>
                <Input
                  id="actions"
                  value={form.actionText}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, actionText: event.target.value }))
                  }
                />
              </div>
              <label className="flex items-center gap-3 text-sm font-medium">
                <input
                  checked={form.enabled}
                  type="checkbox"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, enabled: event.target.checked }))
                  }
                />
                Enabled
              </label>
              <div className="flex flex-wrap justify-end gap-3">
                <Button variant="outline" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button disabled={saving} onClick={() => void saveRule()}>
                  {saving ? "Saving..." : "Create Rule"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

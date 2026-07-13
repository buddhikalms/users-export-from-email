"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, RefreshCw, ShieldCheck, Wand2 } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type PackageStatus = {
  id: string;
  code: string | null;
  slug: string;
  name: string;
  price: string | null;
  currency: string;
  billingInterval: string;
  billingIntervalCount: number;
  paypalProductId: string | null;
  paypalPlanId: string | null;
  paypalStatus: string | null;
  lastSyncedAt: string | Date | null;
};

type SyncResult = {
  packageId: string;
  packageCode: string;
  packageName: string;
  productStatus: string;
  planStatus: string;
  paypalProductId?: string;
  paypalPlanId?: string;
  paypalStatus?: string;
  warnings: string[];
  errors: string[];
};

type SyncReport = {
  success: boolean;
  environment: "sandbox" | "live";
  syncedAt: string;
  summary: {
    total: number;
    synced: number;
    created: number;
    reused: number;
    warnings: number;
    failed: number;
  };
  results: SyncResult[];
};

type ConnectionResult = {
  success: boolean;
  environment: "sandbox" | "live";
  connectedAt: string;
  durationMs: number;
  clientId: string | null;
};

type StatusResponse = {
  success: boolean;
  environment: "sandbox" | "live";
  clientId: string | null;
  lastConnectionTest: { createdAt: string | Date; status: string; message: string | null } | null;
  lastSync: { createdAt: string | Date; status: string; message: string | null } | null;
  packages: PackageStatus[];
};

function formatDate(value: string | Date | null | undefined) {
  if (!value) return "Never";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function statusClass(status: string | null | undefined) {
  if (status === "ACTIVE" || status === "SYNCED" || status === "REUSED" || status === "CREATED") {
    return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
  }
  if (status?.includes("MISMATCH") || status === "INACTIVE" || status === "MISSING") {
    return "bg-amber-500/15 text-amber-700 dark:text-amber-300";
  }
  if (status === "FAILED") return "bg-red-500/15 text-red-700 dark:text-red-300";
  return "bg-muted text-muted-foreground";
}

export function PayPalSyncPanel({ initialStatus }: { initialStatus: StatusResponse }) {
  const [status, setStatus] = useState(initialStatus);
  const [report, setReport] = useState<SyncReport | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  async function refreshStatus() {
    const response = await fetch("/api/admin/paypal/status", { cache: "no-store" });
    const next = (await response.json()) as StatusResponse & { error?: string };
    if (!response.ok) throw new Error(next.error ?? "Unable to refresh PayPal status.");
    setStatus(next);
  }

  async function runAction(action: string, request: () => Promise<Response>) {
    setLoadingAction(action);
    setMessage(null);
    try {
      const response = await request();
      const body = (await response.json()) as (SyncReport | ConnectionResult) & { error?: string };
      if (!response.ok && response.status !== 207) throw new Error(body.error ?? "PayPal action failed.");
      if ("results" in body) {
        setReport(body);
        setMessage(body.success ? "PayPal synchronization completed." : "PayPal synchronization completed with issues.");
      } else {
        setMessage(`PayPal connection succeeded at ${formatDate(body.connectedAt)}.`);
      }
      await refreshStatus();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "PayPal action failed.");
    } finally {
      setLoadingAction(null);
    }
  }

  function syncAll(mode: "sync" | "products" | "plans" | "validate") {
    if (mode !== "validate" && !window.confirm("This may create missing PayPal products or subscription plans. Continue?")) {
      return;
    }
    void runAction(mode, () =>
      fetch("/api/admin/paypal/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      }),
    );
  }

  function syncPackage(packageId: string) {
    if (!window.confirm("Sync this package with PayPal now? Missing resources may be created.")) return;
    void runAction(`package:${packageId}`, () =>
      fetch(`/api/admin/paypal/sync/${encodeURIComponent(packageId)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "sync" }),
      }),
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Environment</p>
          <p className="mt-2 text-2xl font-semibold capitalize">{status.environment}</p>
          <p className="mt-1 break-all text-xs text-muted-foreground">Client ID {status.clientId ?? "not configured"}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Connection</p>
          <p className="mt-2 text-2xl font-semibold capitalize">{status.lastConnectionTest?.status ?? "untested"}</p>
          <p className="mt-1 text-xs text-muted-foreground">{formatDate(status.lastConnectionTest?.createdAt)}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Last Sync</p>
          <p className="mt-2 text-2xl font-semibold capitalize">{status.lastSync?.status ?? "none"}</p>
          <p className="mt-1 text-xs text-muted-foreground">{formatDate(status.lastSync?.createdAt)}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          disabled={Boolean(loadingAction)}
          onClick={() => void runAction("test", () => fetch("/api/admin/paypal/test-connection", { method: "POST" }))}
          variant="outline"
        >
          {loadingAction === "test" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
          Test Connection
        </Button>
        <Button disabled={Boolean(loadingAction)} onClick={() => syncAll("sync")}>
          {loadingAction === "sync" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
          Sync PayPal Plans
        </Button>
        <Button disabled={Boolean(loadingAction)} onClick={() => syncAll("products")} variant="outline">
          Create Missing Products
        </Button>
        <Button disabled={Boolean(loadingAction)} onClick={() => syncAll("plans")} variant="outline">
          Create Missing Plans
        </Button>
        <Button disabled={Boolean(loadingAction)} onClick={() => syncAll("validate")} variant="outline">
          Validate Existing
        </Button>
        <Button disabled={Boolean(loadingAction)} onClick={() => void runAction("refresh", () => fetch("/api/admin/paypal/status"))} variant="ghost">
          {loadingAction === "refresh" ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Refresh Status
        </Button>
      </div>

      {message ? (
        <Alert className={report?.success === false ? "border-amber-500/30 bg-amber-500/10" : "border-emerald-500/30 bg-emerald-500/10"}>
          {report?.success === false ? <AlertCircle className="mb-2 h-5 w-5" /> : <CheckCircle2 className="mb-2 h-5 w-5" />}
          <AlertTitle>{report ? "Sync Result" : "PayPal Status"}</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}

      {report ? (
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold">Synchronization Report</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {report.summary.synced} synced, {report.summary.created} created, {report.summary.reused} reused, {report.summary.warnings} warnings, {report.summary.failed} failed
              </p>
            </div>
            <Badge className={report.success ? statusClass("ACTIVE") : statusClass("FAILED")}>{report.environment}</Badge>
          </div>
          <div className="mt-4 space-y-3">
            {report.results.map((result) => (
              <div key={result.packageId} className="rounded-xl border border-border bg-background/70 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{result.packageName}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge className={statusClass(result.productStatus)}>Product {result.productStatus}</Badge>
                    <Badge className={statusClass(result.planStatus)}>Plan {result.planStatus}</Badge>
                  </div>
                </div>
                <p className="mt-2 break-all text-xs text-muted-foreground">
                  {result.packageCode} · Product {result.paypalProductId ?? "none"} · Plan {result.paypalPlanId ?? "none"} · {result.paypalStatus ?? "unknown"}
                </p>
                {[...result.warnings, ...result.errors].length ? (
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                    {[...result.warnings, ...result.errors].map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="border-b border-border bg-secondary/40 text-xs uppercase tracking-[0.16em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Package</th>
                <th className="px-4 py-3">Local Price</th>
                <th className="px-4 py-3">Billing</th>
                <th className="px-4 py-3">Product ID</th>
                <th className="px-4 py-3">Plan ID</th>
                <th className="px-4 py-3">PayPal Status</th>
                <th className="px-4 py-3">Last Sync</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {status.packages.map((pkg) => (
                <tr key={pkg.id} className="border-b border-border/70 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium">{pkg.name}</p>
                    <p className="text-xs text-muted-foreground">{pkg.code ?? pkg.slug}</p>
                  </td>
                  <td className="px-4 py-3">{pkg.price ? `${pkg.currency} ${pkg.price}` : "Custom"}</td>
                  <td className="px-4 py-3">
                    {pkg.billingIntervalCount} {pkg.billingInterval.toLowerCase()}
                  </td>
                  <td className="max-w-44 break-all px-4 py-3 text-xs">{pkg.paypalProductId ?? "Missing"}</td>
                  <td className="max-w-44 break-all px-4 py-3 text-xs">{pkg.paypalPlanId ?? "Missing"}</td>
                  <td className="px-4 py-3">
                    <Badge className={statusClass(pkg.paypalStatus ?? "MISSING")}>{pkg.paypalStatus ?? "Missing"}</Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(pkg.lastSyncedAt)}</td>
                  <td className="px-4 py-3">
                    <Button disabled={Boolean(loadingAction)} onClick={() => syncPackage(pkg.id)} size="sm" variant="outline">
                      {loadingAction === `package:${pkg.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      Sync Package
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

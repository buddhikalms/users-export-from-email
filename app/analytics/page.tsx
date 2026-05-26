import { getServerSession } from "next-auth";
import type { ElementType } from "react";
import { BarChart3, CheckCircle2, Layers3, ShieldCheck, TrendingUp } from "lucide-react";

import { authOptions } from "@/auth";
import { ContactGrowthChart, FolderActivityChart } from "@/components/charts/DashboardCharts";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { db } from "@/lib/db";
import {
  formatCount,
  getContactGrowthData,
  getFolderActivityData,
  getTopDomainData,
} from "@/lib/dashboard-data";

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const [
    contactCount,
    duplicateCleanupCount,
    exportCount,
    folderActivity,
    growthData,
    successfulSyncCount,
    syncCount,
    topDomains,
    usedPlatformCount,
  ] = userId
    ? await Promise.all([
        db.contact.count({ where: { ownerId: userId } }),
        db.duplicateCleanupLog.count({ where: { ownerId: userId } }),
        db.exportRun.count(),
        getFolderActivityData(userId),
        getContactGrowthData(userId),
        db.syncRun.count({ where: { status: "SUCCESS" } }),
        db.syncRun.count(),
        getTopDomainData(userId),
        db.integrationAccount
          .groupBy({
            by: ["platform"],
            where: { ownerId: userId },
          })
          .then((groups) => groups.length),
      ])
    : [0, 0, 0, [], [], 0, 0, [], 0];
  const syncSuccessRate =
    syncCount > 0 ? `${Math.round((successfulSyncCount / syncCount) * 100)}%` : "0%";
  const statCards: Array<[string, string, ElementType]> = [
    ["Contacts", formatCount(contactCount), TrendingUp],
    ["Sync success", syncSuccessRate, CheckCircle2],
    ["Duplicates cleaned", formatCount(duplicateCleanupCount), ShieldCheck],
    ["Platforms used", formatCount(usedPlatformCount), Layers3],
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Analytics</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Contact Intelligence</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
          Track contact growth, export trends, sync success rates, platform usage,
          top domains, duplicate cleanup, folder yield, and sender intelligence.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {statCards.map(([label, value, Icon]) => (
          <div key={label} className="rounded-3xl border border-border/70 bg-card/82 p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-3 text-3xl font-semibold">{value}</p>
              </div>
              <Icon className="h-5 w-5 text-primary" />
            </div>
          </div>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-3xl border border-border/70 bg-card/82 p-5 shadow-sm">
          <h2 className="text-xl font-semibold">Contacts Growth</h2>
          <ContactGrowthChart data={growthData} />
        </div>
        <div className="rounded-3xl border border-border/70 bg-card/82 p-5 shadow-sm">
          <h2 className="text-xl font-semibold">Folder Activity</h2>
          <FolderActivityChart data={folderActivity} />
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-border/70 bg-card/82 p-5 shadow-sm">
          <h2 className="text-xl font-semibold">Platform Usage</h2>
          <div className="mt-4 rounded-3xl border border-dashed border-border bg-secondary/30 p-8 text-center text-sm text-muted-foreground">
            Platform usage appears after integration sync runs are saved.
          </div>
        </div>
        <div className="rounded-3xl border border-border/70 bg-card/82 p-5 shadow-sm">
          <h2 className="text-xl font-semibold">Top Domains</h2>
          <div className="mt-4 space-y-3">
            {topDomains.length ? (
              topDomains.map((domain) => (
                <div key={domain.domain} className="rounded-2xl bg-secondary/70 p-3 text-sm">
                  {domain.domain}: {formatCount(domain.count)}
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-border bg-secondary/30 p-8 text-center text-sm text-muted-foreground">
                No contact domains saved yet.
              </div>
            )}
          </div>
        </div>
        <div className="rounded-3xl border border-border/70 bg-card/82 p-5 shadow-sm">
          <h2 className="text-xl font-semibold">Cleanup Funnel</h2>
          <div className="mt-4 space-y-3">
            {[
              `Saved contacts: ${formatCount(contactCount)}`,
              `Duplicate cleanup logs: ${formatCount(duplicateCleanupCount)}`,
              `Recorded exports: ${formatCount(exportCount)}`,
            ].map((row) => (
              <div key={row} className="rounded-2xl bg-secondary/70 p-3 text-sm">
                {row}
              </div>
            ))}
          </div>
        </div>
      </div>
      <EmptyState
        actionHref="/export"
        actionLabel="Open export center"
        description="Additional analytics populate as sync and export history is persisted."
        icon={BarChart3}
        title="Analytics are using saved system data only"
      />
    </div>
  );
}

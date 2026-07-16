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

function titleCase(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}

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
    platformUsage,
    topDomains,
    usedPlatformCount,
  ] = userId
    ? await Promise.all([
        db.contact.count({ where: { ownerId: userId } }),
        db.duplicateCleanupLog.count({ where: { ownerId: userId } }),
        db.exportRun.count({ where: { ownerId: userId } }),
        getFolderActivityData(userId),
        getContactGrowthData(userId),
        db.syncRun.count({ where: { ownerId: userId, status: "SUCCESS" } }),
        db.syncRun.count({ where: { ownerId: userId } }),
        db.syncRun.groupBy({
          by: ["platform"],
          where: { ownerId: userId, platform: { not: null } },
          _count: { _all: true },
          orderBy: { _count: { platform: "desc" } },
        }),
        getTopDomainData(userId),
        Promise.all([
          db.integrationAccount.groupBy({ by: ["platform"], where: { ownerId: userId } }),
          db.kitAccount.count({ where: { ownerId: userId } }),
        ]).then(([groups, kitAccounts]) => groups.length + (kitAccounts > 0 ? 1 : 0)),
      ])
    : [0, 0, 0, [], [], 0, 0, [], [], 0];
  const syncSuccessRate =
    syncCount > 0 ? `${Math.round((successfulSyncCount / syncCount) * 100)}%` : "0%";
  const statCards: Array<[string, string, ElementType]> = [
    ["Contacts", formatCount(contactCount), TrendingUp],
    ["Sync success", syncSuccessRate, CheckCircle2],
    ["Duplicates cleaned", formatCount(duplicateCleanupCount), ShieldCheck],
    ["Platforms used", formatCount(usedPlatformCount), Layers3],
  ];
  const maxPlatformSyncs = Math.max(1, ...platformUsage.map((item) => item._count._all));

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
          <div key={label} className="rounded-3xl border border-border/70 bg-card/80 p-5 shadow-sm">
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
        <div className="rounded-3xl border border-border/70 bg-card/80 p-5 shadow-sm">
          <h2 className="text-xl font-semibold">Contacts Growth</h2>
          <ContactGrowthChart data={growthData} />
        </div>
        <div className="rounded-3xl border border-border/70 bg-card/80 p-5 shadow-sm">
          <h2 className="text-xl font-semibold">Folder Activity</h2>
          <FolderActivityChart data={folderActivity} />
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-border/70 bg-card/80 p-5 shadow-sm">
          <h2 className="text-xl font-semibold">Platform Usage</h2>
          <div className="mt-5 space-y-4">
            {platformUsage.length ? platformUsage.map((item) => (
              <div key={item.platform ?? "unknown"}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium">{titleCase(item.platform ?? "Unknown")}</span>
                  <span className="text-muted-foreground">{formatCount(item._count._all)} syncs</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(8, (item._count._all / maxPlatformSyncs) * 100)}%` }} />
                </div>
              </div>
            )) : (
              <div className="rounded-3xl border border-dashed border-border bg-secondary/30 p-8 text-center text-sm text-muted-foreground">
                No platform syncs recorded yet.
              </div>
            )}
          </div>
        </div>
        <div className="rounded-3xl border border-border/70 bg-card/80 p-5 shadow-sm">
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
        <div className="rounded-3xl border border-border/70 bg-card/80 p-5 shadow-sm">
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
      {contactCount === 0 && syncCount === 0 && exportCount === 0 ? (
        <EmptyState
          actionHref="/export"
          actionLabel="Open export center"
          description="Analytics populate after your first mailbox sync or export."
          icon={BarChart3}
          title="No analytics recorded yet"
        />
      ) : null}
    </div>
  );
}

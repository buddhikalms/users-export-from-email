import { BarChart3 } from "lucide-react";

import { ContactGrowthChart, FolderActivityChart } from "@/components/charts/DashboardCharts";
import { EmptyState } from "@/components/dashboard/EmptyState";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Analytics</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Contact Intelligence</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
          Track growth, export trends, duplicate cleanup, folder yield, Kit success rate, domains, and senders.
        </p>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-3xl border border-border/70 bg-card/82 p-5 shadow-sm">
          <h2 className="text-xl font-semibold">Contacts Growth</h2>
          <ContactGrowthChart />
        </div>
        <div className="rounded-3xl border border-border/70 bg-card/82 p-5 shadow-sm">
          <h2 className="text-xl font-semibold">Folder Activity</h2>
          <FolderActivityChart />
        </div>
      </div>
      <EmptyState
        actionHref="/export"
        actionLabel="Open export center"
        description="Additional analytics populate as sync and export history is persisted."
        icon={BarChart3}
        title="Advanced cohorts are ready for history data"
      />
    </div>
  );
}

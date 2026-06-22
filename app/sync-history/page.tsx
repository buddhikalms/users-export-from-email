import { History } from "lucide-react";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { SyncHistoryTable, type SyncRow } from "@/components/tables/SyncHistoryTable";
import { db } from "@/lib/db";

function formatDuration(startedAt: Date | null, completedAt: Date | null) {
  if (!startedAt || !completedAt) {
    return "-";
  }

  const seconds = Math.max(0, Math.round((completedAt.getTime() - startedAt.getTime()) / 1000));
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}

function titleCase(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}

export default async function SyncHistoryPage() {
  const session = await getServerSession(authOptions);
  const syncRuns = await db.syncRun.findMany({
    where: { ownerId: session?.user?.id ?? "__missing_user__" },
    orderBy: { createdAt: "desc" },
    take: 500,
  });
  const rows: SyncRow[] = syncRuns.map((run) => ({
    workflow: run.platform
      ? `${titleCase(run.platform)} sync`
      : run.targetName || run.targetType || "Sync run",
    status: titleCase(run.status),
    duration: formatDuration(run.startedAt, run.completedAt),
    processed: run.totalContacts,
    duplicates: run.skippedDuplicates,
    invalid: run.failed,
  }));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Operations</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Sync History</h1>
      </div>
      {rows.length ? (
        <SyncHistoryTable data={rows} />
      ) : (
        <EmptyState
          actionHref="/folders"
          actionLabel="Run a sync"
          description="Every sync and export can be tracked here with status, duration, duplicate counts, and logs."
          icon={History}
          title="No history yet"
        />
      )}
    </div>
  );
}

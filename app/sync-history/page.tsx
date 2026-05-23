import { History } from "lucide-react";

import { EmptyState } from "@/components/dashboard/EmptyState";
import { SyncHistoryTable, type SyncRow } from "@/components/tables/SyncHistoryTable";

const rows: SyncRow[] = [
  { workflow: "Inbox weekly scan", status: "Success", duration: "01:22", processed: 842, duplicates: 96, invalid: 8 },
  { workflow: "Kit export batch", status: "Partial", duration: "03:14", processed: 410, duplicates: 52, invalid: 3 },
];

export default function SyncHistoryPage() {
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

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable, StatusBadge } from "@/components/admin/tables/AdminDataTable";
import { db } from "@/lib/db";

export default async function AdminWorkersPage() {
  const workers = await db.workerHeartbeat.findMany({ orderBy: { lastHeartbeatAt: "desc" }, take: 100 }).catch(() => []);

  return (
    <div>
      <AdminPageHeader action="Request restart" description="Inspect worker heartbeat, queue assignment, concurrency, host, version, resource usage, and last sanitized error. Browser actions are allowlisted only." title="Worker Management" />
      <AdminDataTable
        columns={[
          { key: "workerName", label: "Worker" },
          { key: "queueName", label: "Queue" },
          { key: "state", label: "State", render: (value) => <StatusBadge value={String(value)} /> },
          { key: "lastHeartbeatAt", label: "Heartbeat", render: (value) => new Date(String(value)).toLocaleString() },
          { key: "runningJobs", label: "Running" },
          { key: "completedJobs", label: "Completed" },
          { key: "failedJobs", label: "Failed" },
          { key: "concurrency", label: "Concurrency" },
          { key: "hostname", label: "Host" },
          { key: "appVersion", label: "Version" },
        ]}
        empty="No worker heartbeats recorded yet."
        rows={workers.map((worker) => ({ ...worker, lastHeartbeatAt: worker.lastHeartbeatAt.toISOString() }))}
      />
    </div>
  );
}

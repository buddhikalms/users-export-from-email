import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable, StatusBadge } from "@/components/admin/tables/AdminDataTable";
import { db } from "@/lib/db";

export default async function SystemLogsPage() {
  const incidents = await db.systemIncident.findMany({ orderBy: { createdAt: "desc" }, take: 100 }).catch(() => []);

  return (
    <div>
      <AdminPageHeader description="System incidents, worker crashes, queue outages, Redis errors, and infrastructure notes." title="System Logs" />
      <AdminDataTable
        columns={[
          { key: "severity", label: "Severity", render: (value) => <StatusBadge value={String(value)} /> },
          { key: "title", label: "Title" },
          { key: "status", label: "Status", render: (value) => <StatusBadge value={String(value)} /> },
          { key: "source", label: "Source" },
          { key: "createdAt", label: "Created" },
        ]}
        empty="No system incidents recorded."
        rows={incidents.map((incident) => ({ ...incident, createdAt: incident.createdAt.toLocaleString(), source: incident.source ?? "system" }))}
      />
    </div>
  );
}

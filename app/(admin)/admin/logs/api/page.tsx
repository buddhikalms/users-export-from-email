import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable, StatusBadge } from "@/components/admin/tables/AdminDataTable";
import { db } from "@/lib/db";

export default async function ApiLogsPage() {
  const logs = await db.apiLog.findMany({ orderBy: { createdAt: "desc" }, take: 100, include: { owner: { select: { email: true } }, workspace: { select: { name: true } } } });

  return (
    <div>
      <AdminPageHeader description="API activity with status, platform, request IDs, response time, and sanitized metadata." title="API Logs" />
      <AdminDataTable
        columns={[
          { key: "action", label: "Action" },
          { key: "platform", label: "Platform" },
          { key: "status", label: "Status", render: (value) => <StatusBadge value={String(value)} /> },
          { key: "statusCode", label: "Code" },
          { key: "durationMs", label: "Duration" },
          { key: "workspace", label: "Workspace" },
          { key: "owner", label: "Owner" },
          { key: "createdAt", label: "Time" },
        ]}
        empty="No API logs found."
        rows={logs.map((log) => ({
          id: log.id,
          action: log.action,
          platform: log.platform ?? "internal",
          status: log.status,
          statusCode: log.statusCode ?? "n/a",
          durationMs: log.durationMs ? `${log.durationMs}ms` : "n/a",
          workspace: log.workspace?.name ?? "none",
          owner: log.owner?.email ?? "system",
          createdAt: log.createdAt.toLocaleString(),
        }))}
      />
    </div>
  );
}

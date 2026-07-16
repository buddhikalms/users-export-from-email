import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable } from "@/components/admin/tables/AdminDataTable";
import { db } from "@/lib/db";

export default async function AuditLogsPage() {
  const logs = await db.adminAuditLog.findMany({ orderBy: { createdAt: "desc" }, take: 100, include: { adminUser: { select: { email: true } } } }).catch(() => []);

  return (
    <div>
      <AdminPageHeader description="Every admin mutation is recorded with actor, resource, before/after state, IP address, user agent, timestamp, and request ID." title="Audit Logs" />
      <AdminDataTable
        columns={[
          { key: "admin", label: "Admin" },
          { key: "action", label: "Action" },
          { key: "resourceType", label: "Resource" },
          { key: "resourceId", label: "Resource ID" },
          { key: "ipAddress", label: "IP" },
          { key: "createdAt", label: "Time" },
        ]}
        empty="No audit events recorded yet."
        rows={logs.map((log) => ({
          id: log.id,
          admin: log.adminUser?.email ?? "system",
          action: log.action,
          resourceType: log.resourceType,
          resourceId: log.resourceId ?? "none",
          ipAddress: log.ipAddress ?? "unknown",
          createdAt: log.createdAt.toLocaleString(),
        }))}
      />
    </div>
  );
}

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable, StatusBadge } from "@/components/admin/tables/AdminDataTable";
import { db } from "@/lib/db";

export default async function SecurityPage() {
  const auditLogs = await db.adminAuditLog.findMany({ orderBy: { createdAt: "desc" }, take: 75 }).catch(() => []);

  return (
    <div>
      <AdminPageHeader action="Review incident" description="Review failed logins, suspicious IPs, revoked sessions, rate-limit blocks, licence abuse, invalid APIs, export spikes, and admin actions." title="Security Dashboard" />
      <AdminDataTable
        columns={[
          { key: "event", label: "Event" },
          { key: "risk", label: "Risk", render: (value) => <StatusBadge value={String(value)} /> },
          { key: "resource", label: "Resource" },
          { key: "ip", label: "IP" },
          { key: "createdAt", label: "Time" },
        ]}
        empty="No security events recorded."
        rows={auditLogs.map((log) => ({
          id: log.id,
          event: log.action,
          risk: log.action.includes("delete") || log.action.includes("revoke") ? "high" : "normal",
          resource: `${log.resourceType}:${log.resourceId ?? "none"}`,
          ip: log.ipAddress ?? "unknown",
          createdAt: log.createdAt.toLocaleString(),
        }))}
      />
    </div>
  );
}

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable, StatusBadge } from "@/components/admin/tables/AdminDataTable";
import { db } from "@/lib/db";

export default async function AdminExportsPage() {
  const exports = await db.exportRun.findMany({
    orderBy: { createdAt: "desc" },
    take: 75,
    include: { owner: { select: { email: true } }, workspace: { select: { name: true } }, integrationAccount: { select: { platform: true } } },
  });

  return (
    <div>
      <AdminPageHeader action="Retry failed" description="Monitor export jobs and sanitize export logs. Customer contact files are not downloadable by default." title="Export Administration" />
      <AdminDataTable
        columns={[
          { key: "format", label: "Format" },
          { key: "workspace", label: "Workspace" },
          { key: "user", label: "User" },
          { key: "destination", label: "Destination" },
          { key: "status", label: "Status", render: (value) => <StatusBadge value={String(value)} /> },
          { key: "contacts", label: "Contacts" },
          { key: "duration", label: "Duration" },
          { key: "createdAt", label: "Created" },
          { key: "error", label: "Error" },
        ]}
        empty="No export jobs found."
        rows={exports.map((item) => ({
          id: item.id,
          format: item.format,
          workspace: item.workspace?.name ?? "personal",
          user: item.owner?.email ?? "system",
          destination: item.integrationAccount?.platform ?? "file",
          status: item.status,
          contacts: item.totalContacts,
          duration: item.completedAt ? `${Math.max(1, Math.round((item.completedAt.getTime() - item.createdAt.getTime()) / 1000))}s` : "pending",
          createdAt: item.createdAt.toLocaleString(),
          error: item.errorMessage ? "sanitized error available" : "none",
        }))}
      />
    </div>
  );
}

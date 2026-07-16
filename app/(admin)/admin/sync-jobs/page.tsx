import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable, StatusBadge } from "@/components/admin/tables/AdminDataTable";
import { db } from "@/lib/db";

export default async function AdminSyncJobsPage() {
  const runs = await db.syncRun.findMany({
    orderBy: { createdAt: "desc" },
    take: 75,
    include: { owner: { select: { email: true } }, workspace: { select: { name: true } }, integrationAccount: { select: { name: true, platform: true } } },
  });

  return (
    <div>
      <AdminPageHeader action="Retry selected" description="Inspect sync job status, queue IDs, workspace/user context, priority, progress, extracted contacts, duplicate cleanup, and sanitized failures." title="Sync Jobs" />
      <AdminDataTable
        columns={[
          { key: "jobId", label: "Job ID" },
          { key: "workspace", label: "Workspace" },
          { key: "user", label: "User" },
          { key: "platform", label: "Platform" },
          { key: "status", label: "Status", render: (value) => <StatusBadge value={String(value)} /> },
          { key: "folder", label: "Folder" },
          { key: "progress", label: "Progress" },
          { key: "contacts", label: "Contacts" },
          { key: "createdAt", label: "Created" },
        ]}
        empty="No sync jobs found."
        rows={runs.map((run) => ({
          id: run.id,
          jobId: run.jobId ?? run.id,
          workspace: run.workspace?.name ?? "personal",
          user: run.owner?.email ?? "system",
          platform: run.integrationAccount?.platform ?? run.platform ?? "IMAP",
          status: run.status,
          folder: run.currentFolder ?? "all folders",
          progress: run.totalMessages ? `${Math.round((run.processedMessages / run.totalMessages) * 100)}%` : "0%",
          contacts: run.contactsFound,
          createdAt: run.createdAt.toLocaleString(),
        }))}
      />
    </div>
  );
}

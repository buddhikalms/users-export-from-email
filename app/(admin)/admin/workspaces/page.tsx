import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable } from "@/components/admin/tables/AdminDataTable";
import { db } from "@/lib/db";

export default async function AdminWorkspacesPage() {
  const workspaces = await db.workspace.findMany({
    orderBy: { updatedAt: "desc" },
    take: 50,
    include: {
      organization: { include: { owner: { select: { email: true, name: true } }, members: true } },
      contacts: { select: { id: true } },
      integrationAccounts: { select: { id: true } },
      syncRuns: { select: { id: true, status: true } },
    },
  });

  return (
    <div>
      <AdminPageHeader action="Set override" description="Manage tenant plans, queue limits, scan limits, feature flags, integration caps, and package overrides." title="Workspace Management" />
      <AdminDataTable
        columns={[
          { key: "name", label: "Workspace" },
          { key: "owner", label: "Owner" },
          { key: "plan", label: "Plan" },
          { key: "members", label: "Members" },
          { key: "contacts", label: "Contacts" },
          { key: "integrations", label: "Integrations" },
          { key: "monthlyScans", label: "Sync runs" },
          { key: "errorRate", label: "Error rate" },
          { key: "lastActivity", label: "Last activity" },
        ]}
        empty="No workspaces found."
        rows={workspaces.map((workspace) => {
          const failed = workspace.syncRuns.filter((run) => run.status === "FAILED").length;
          return {
            id: workspace.id,
            name: workspace.name,
            owner: workspace.organization.owner.email,
            plan: workspace.organization.plan,
            members: workspace.organization.members.length,
            contacts: workspace.contacts.length,
            integrations: workspace.integrationAccounts.length,
            monthlyScans: workspace.syncRuns.length,
            errorRate: workspace.syncRuns.length ? `${Math.round((failed / workspace.syncRuns.length) * 100)}%` : "0%",
            lastActivity: workspace.updatedAt.toLocaleDateString(),
          };
        })}
      />
    </div>
  );
}

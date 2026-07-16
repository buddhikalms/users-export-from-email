import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable, StatusBadge } from "@/components/admin/tables/AdminDataTable";
import { db } from "@/lib/db";

export default async function AdminIntegrationsPage() {
  const groups = await db.integrationAccount.groupBy({ by: ["platform", "health"], _count: { _all: true } });

  return (
    <div>
      <AdminPageHeader action="Open incident" description="Track Kit, Mailchimp, Brevo, HubSpot, Beehiiv, ActiveCampaign, Outlook, and IMAP health without exposing customer API keys." title="Integration Administration" />
      <AdminDataTable
        columns={[
          { key: "platform", label: "Platform" },
          { key: "health", label: "Health", render: (value) => <StatusBadge value={String(value)} /> },
          { key: "connectedAccounts", label: "Connected accounts" },
          { key: "successfulExports", label: "Successful exports" },
          { key: "failedExports", label: "Failed exports" },
          { key: "rateLimitErrors", label: "Rate limits" },
          { key: "avgResponse", label: "Avg response" },
        ]}
        empty="No integration accounts found."
        rows={groups.map((group) => ({
          id: `${group.platform}-${group.health}`,
          platform: group.platform,
          health: group.health,
          connectedAccounts: group._count._all,
          successfulExports: "tracked in exports",
          failedExports: "tracked in exports",
          rateLimitErrors: 0,
          avgResponse: "n/a",
        }))}
      />
    </div>
  );
}

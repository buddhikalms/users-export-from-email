import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable, StatusBadge } from "@/components/admin/tables/AdminDataTable";
import { db } from "@/lib/db";

export default async function AdminLicencesPage() {
  const licences = await db.licence.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { user: { select: { email: true } }, package: { select: { name: true } }, activations: true },
  }).catch(() => []);

  return (
    <div>
      <AdminPageHeader action="Generate licence" description="Generate, assign, activate, suspend, revoke, extend, and inspect activation history with suspicious validation warnings." title="Licence Management" />
      <AdminDataTable
        columns={[
          { key: "key", label: "Licence" },
          { key: "customer", label: "Customer" },
          { key: "plan", label: "Plan" },
          { key: "status", label: "Status", render: (value) => <StatusBadge value={String(value)} /> },
          { key: "expiresAt", label: "Expiry" },
          { key: "activationLimit", label: "Limit" },
          { key: "activations", label: "Activations" },
        ]}
        empty="No licences found."
        rows={licences.map((licence) => ({
          id: licence.id,
          key: `${licence.key.slice(0, 8)}...`,
          customer: licence.user?.email ?? "unassigned",
          plan: licence.package?.name ?? licence.plan,
          status: licence.status,
          expiresAt: licence.expiresAt?.toLocaleDateString() ?? "never",
          activationLimit: licence.activationLimit,
          activations: licence.activations.length,
        }))}
      />
    </div>
  );
}

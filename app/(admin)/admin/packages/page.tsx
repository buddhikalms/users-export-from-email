import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable, StatusBadge } from "@/components/admin/tables/AdminDataTable";
import { db } from "@/lib/db";

export default async function AdminPackagesPage() {
  const packages = await db.package.findMany({ orderBy: { sortOrder: "asc" }, include: { features: true } }).catch(() => []);
  const pricingPlans = await db.pricingPlan.findMany({ orderBy: { sortOrder: "asc" } });
  const rows = packages.length
    ? packages.map((item) => ({
        id: item.id,
        name: item.name,
        code: item.code,
        status: item.isActive ? "active" : "inactive",
        monthlyPrice: item.monthlyPrice?.toString() ?? "custom",
        limits: `${item.features.length} features`,
        support: item.supportLevel,
      }))
    : pricingPlans.map((item) => ({
        id: item.id,
        name: item.name,
        code: item.slug,
        status: item.isActive ? "active" : "inactive",
        monthlyPrice: item.monthlyPrice?.toString() ?? "custom",
        limits: "pricing catalog",
        support: item.audience,
      }));

  return (
    <div>
      <AdminPageHeader action="Create package" description="Build plans with enforced limits for email accounts, scans, contacts, exports, integrations, API access, webhooks, and support levels." title="Package Management" />
      <AdminDataTable
        columns={[
          { key: "name", label: "Package" },
          { key: "code", label: "Code" },
          { key: "status", label: "Status", render: (value) => <StatusBadge value={String(value)} /> },
          { key: "monthlyPrice", label: "Monthly price" },
          { key: "limits", label: "Features" },
          { key: "support", label: "Support" },
        ]}
        empty="No packages configured."
        rows={rows}
      />
    </div>
  );
}

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable, StatusBadge } from "@/components/admin/tables/AdminDataTable";
import { db } from "@/lib/db";

export default async function AdminSettingsPage() {
  const flags = await db.featureFlag.findMany({ orderBy: { key: "asc" } }).catch(() => []);

  return (
    <div>
      <AdminPageHeader action="Save settings" description="General, branding, email, queue, worker, security, licence API, payment, feature flag, maintenance, retention, and notification settings." title="System Settings" />
      <section id="feature-flags">
        <h2 className="mb-3 text-base font-semibold">Feature flags</h2>
        <AdminDataTable
          columns={[
            { key: "key", label: "Key" },
            { key: "enabled", label: "Enabled", render: (value) => <StatusBadge value={value ? "enabled" : "disabled"} /> },
            { key: "description", label: "Description" },
            { key: "updatedAt", label: "Updated" },
          ]}
          empty="No feature flags configured."
          rows={flags.map((flag) => ({
            id: flag.id,
            key: flag.key,
            enabled: flag.enabled,
            description: flag.description ?? "none",
            updatedAt: flag.updatedAt.toLocaleString(),
          }))}
        />
      </section>
    </div>
  );
}

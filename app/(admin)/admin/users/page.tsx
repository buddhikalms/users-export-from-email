import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable, StatusBadge } from "@/components/admin/tables/AdminDataTable";
import { db } from "@/lib/db";

export default async function AdminUsersPage() {
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      savedAccounts: { select: { id: true } },
      integrationAccounts: { select: { id: true } },
      contacts: { select: { id: true } },
      subscription: { select: { plan: true, status: true } },
    },
  });

  return (
    <div>
      <AdminPageHeader action="Send notification" description="Search, filter, inspect, suspend, activate, revoke sessions, and manage account limits without exposing customer secrets." title="User Management" />
      <AdminDataTable
        columns={[
          { key: "name", label: "User" },
          { key: "email", label: "Email" },
          { key: "role", label: "Role", render: (value) => <StatusBadge value={String(value)} /> },
          { key: "plan", label: "Plan" },
          { key: "status", label: "Subscription", render: (value) => <StatusBadge value={String(value)} /> },
          { key: "emailAccounts", label: "Email accounts" },
          { key: "integrations", label: "Integrations" },
          { key: "contacts", label: "Contacts" },
          { key: "createdAt", label: "Created", render: (value) => new Date(String(value)).toLocaleDateString() },
        ]}
        empty="No users found."
        rows={users.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          plan: user.subscription?.plan ?? "FREE",
          status: user.subscription?.status ?? "FREE",
          emailAccounts: user.savedAccounts.length,
          integrations: user.integrationAccounts.length,
          contacts: user.contacts.length,
          createdAt: user.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}

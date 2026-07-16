import { AdminShell } from "@/components/admin/layout/AdminShell";
import { requireAdminPage } from "@/lib/admin/require-admin";

export const dynamic = "force-dynamic";

export default async function AdminRouteLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminPage("admin:view");

  return (
    <AdminShell
      user={{
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
      }}
    >
      {children}
    </AdminShell>
  );
}

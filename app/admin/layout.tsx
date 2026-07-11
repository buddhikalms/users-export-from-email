import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/settings");
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-6 shadow-sm">
        <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_center,rgba(3,183,178,0.2),transparent_56%)] lg:block" />
        <div className="relative">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              Admin
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">
              Platform Command Center
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
              Review users, access, billing, PayPal events, syncs, exports,
              integrations, automation jobs, and API logs.
            </p>
          </div>
        </div>
      </section>
      <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <AdminNav />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}

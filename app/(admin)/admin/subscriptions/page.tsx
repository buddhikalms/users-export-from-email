import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable, StatusBadge } from "@/components/admin/tables/AdminDataTable";
import { db } from "@/lib/db";

export default async function AdminSubscriptionsPage() {
  const subscriptions = await db.subscription.findMany({
    orderBy: { updatedAt: "desc" },
    take: 50,
    include: { user: { select: { email: true, name: true } } },
  });

  return (
    <div>
      <AdminPageHeader action="Sync payment status" description="Support PayPal and future providers, plan changes, trials, add-ons, failed payment handling, and licence state alignment." title="Subscriptions" />
      <AdminDataTable
        columns={[
          { key: "customer", label: "Customer" },
          { key: "plan", label: "Plan" },
          { key: "interval", label: "Cycle" },
          { key: "status", label: "Status", render: (value) => <StatusBadge value={String(value)} /> },
          { key: "provider", label: "Provider" },
          { key: "providerId", label: "Provider ID" },
          { key: "nextBilling", label: "Next billing" },
          { key: "lastPayment", label: "Last payment" },
        ]}
        empty="No subscriptions found."
        rows={subscriptions.map((subscription) => ({
          id: subscription.id,
          customer: subscription.user.email,
          plan: subscription.plan,
          interval: subscription.interval,
          status: subscription.status,
          provider: subscription.provider,
          providerId: subscription.paypalSubscriptionId ?? "none",
          nextBilling: subscription.currentPeriodEnd?.toLocaleDateString() ?? "none",
          lastPayment: subscription.lastPaymentAt?.toLocaleDateString() ?? "none",
        }))}
      />
    </div>
  );
}

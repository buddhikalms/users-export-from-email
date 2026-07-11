import { AdminTable, type AdminTableRow } from "@/components/admin/AdminTable";
import { SalesCharts } from "@/components/admin/SalesCharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "Never";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function formatLabel(value: string | null | undefined) {
  return value ? value.replace(/_/g, " ").toLowerCase() : "none";
}

function monthKey(value: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "short", year: "2-digit" }).format(value);
}

function buildSalesData(subscriptions: Array<{ createdAt: Date; lastPaymentAt: Date | null }>) {
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index), 1);
    date.setHours(0, 0, 0, 0);
    return date;
  });

  return months.map((date) => {
    const key = monthKey(date);
    return {
      month: key,
      payments: subscriptions.filter((item) => item.lastPaymentAt && monthKey(item.lastPaymentAt) === key).length,
      subscriptions: subscriptions.filter((item) => monthKey(item.createdAt) === key).length,
    };
  });
}

export default async function AdminBillingPage() {
  const [subscriptions, planGroups, webhookEvents] = await Promise.all([
    db.subscription.findMany({
      orderBy: { updatedAt: "desc" },
      take: 200,
      include: { user: { select: { name: true, email: true, role: true } } },
    }),
    db.subscription.groupBy({
      by: ["plan"],
      _count: { _all: true },
      orderBy: { _count: { plan: "desc" } },
    }),
    db.payPalWebhookEvent.findMany({
      orderBy: { receivedAt: "desc" },
      take: 100,
    }),
  ]);
  const subscriptionRows: AdminTableRow[] = subscriptions.map((subscription) => ({
    id: subscription.id,
    search: [
      subscription.user.name,
      subscription.user.email,
      subscription.plan,
      subscription.status,
      subscription.provider,
      subscription.payerEmail,
      subscription.paypalSubscriptionId,
    ].filter(Boolean).join(" "),
    cells: {
      user: `${subscription.user.name}\n${subscription.user.email}`,
      plan: formatLabel(subscription.plan),
      status: formatLabel(subscription.status),
      provider: subscription.provider,
      payer: subscription.payerEmail ?? "Not captured",
      lastPayment: formatDate(subscription.lastPaymentAt),
      accessUntil: formatDate(subscription.currentPeriodEnd),
      paypal: subscription.paypalSubscriptionId ?? "none",
    },
  }));
  const webhookRows: AdminTableRow[] = webhookEvents.map((event) => ({
    id: event.id,
    search: [event.paypalEventId, event.eventType, event.resourceId].filter(Boolean).join(" "),
    cells: {
      type: event.eventType,
      event: event.paypalEventId,
      resource: event.resourceId ?? "none",
      received: formatDate(event.receivedAt),
    },
  }));

  return (
    <main className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Billing & Sales</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Track subscription mix, payment activity, and PayPal webhook events.
        </p>
      </div>

      <SalesCharts
        planData={planGroups.map((group) => ({ plan: formatLabel(group.plan), count: group._count._all }))}
        salesData={buildSalesData(subscriptions)}
      />

      <Card>
        <CardHeader>
          <CardTitle>Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminTable
            columns={[
              { key: "user", label: "User" },
              { key: "plan", label: "Plan" },
              { key: "status", label: "Status" },
              { key: "provider", label: "Provider" },
              { key: "payer", label: "Payer" },
              { key: "lastPayment", label: "Last Payment" },
              { key: "accessUntil", label: "Access Until" },
              { key: "paypal", label: "PayPal Subscription" },
            ]}
            emptyMessage="No subscriptions match this filter."
            rows={subscriptionRows}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>PayPal Webhook Events</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminTable
            columns={[
              { key: "type", label: "Type" },
              { key: "event", label: "Event ID" },
              { key: "resource", label: "Resource" },
              { key: "received", label: "Received" },
            ]}
            emptyMessage="No PayPal webhooks match this filter."
            rows={webhookRows}
          />
        </CardContent>
      </Card>
    </main>
  );
}

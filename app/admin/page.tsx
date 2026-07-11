import {
  Activity,
  BriefcaseBusiness,
  CreditCard,
  Database,
  MailCheck,
  RefreshCw,
  UsersRound,
  Webhook,
} from "lucide-react";

import { SalesCharts } from "@/components/admin/SalesCharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
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

function formatLabel(value: string | null | undefined) {
  return value ? value.replace(/_/g, " ").toLowerCase() : "none";
}

export default async function AdminOverviewPage() {
  const [
    userCount,
    activeSubscriptionCount,
    savedAccountCount,
    contactCount,
    syncRunCount,
    exportRunCount,
    integrationAccountCount,
    backgroundJobCount,
    automationRuleCount,
    failedSyncCount,
    failedJobCount,
    subscriptions,
    planGroups,
  ] = await Promise.all([
    db.user.count(),
    db.subscription.count({ where: { status: "ACTIVE" } }),
    db.savedEmailAccount.count(),
    db.contact.count(),
    db.syncRun.count(),
    db.exportRun.count(),
    db.integrationAccount.count(),
    db.backgroundJob.count(),
    db.automationRule.count(),
    db.syncRun.count({ where: { status: "FAILED" } }),
    db.backgroundJob.count({ where: { status: "FAILED" } }),
    db.subscription.findMany({
      select: { createdAt: true, lastPaymentAt: true },
    }),
    db.subscription.groupBy({
      by: ["plan"],
      _count: { _all: true },
      orderBy: { _count: { plan: "desc" } },
    }),
  ]);

  const stats = [
    ["Users", userCount, UsersRound],
    ["Active subscriptions", activeSubscriptionCount, CreditCard],
    ["Mailboxes", savedAccountCount, MailCheck],
    ["Contacts", contactCount, Database],
    ["Sync runs", syncRunCount, RefreshCw],
    ["Export runs", exportRunCount, BriefcaseBusiness],
    ["Integrations", integrationAccountCount, Webhook],
    ["Jobs", backgroundJobCount, Activity],
  ] as const;
  const salesData = buildSalesData(subscriptions);
  const planData = planGroups.map((group) => ({
    plan: formatLabel(group.plan),
    count: group._count._all,
  }));

  return (
    <main className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([label, value, Icon]) => (
          <Card key={label}>
            <CardContent className="flex items-start justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-3 text-3xl font-semibold">{formatNumber(value)}</p>
              </div>
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <SalesCharts planData={planData} salesData={salesData} />

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Operations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Automation rules: {formatNumber(automationRuleCount)}</p>
            <p>Failed syncs: {formatNumber(failedSyncCount)}</p>
            <p>Failed jobs: {formatNumber(failedJobCount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Billing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Total subscription records: {formatNumber(subscriptions.length)}</p>
            <p>Payments recorded: {formatNumber(subscriptions.filter((item) => item.lastPaymentAt).length)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Admin-only pages are protected by server-side session checks.</p>
            <p>Encrypted API keys and mailbox passwords are not displayed.</p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

import {
  Activity,
  AlertTriangle,
  BriefcaseBusiness,
  Clock3,
  CreditCard,
  Database,
  KeyRound,
  MailCheck,
  RefreshCw,
  Server,
  TrendingUp,
  UsersRound,
  Webhook,
  Workflow,
} from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminAreaChart, AdminBarChart, AdminLineChart } from "@/components/admin/charts/AdminCharts";
import { MetricCard } from "@/components/admin/MetricCard";
import { AdminDataTable, StatusBadge } from "@/components/admin/tables/AdminDataTable";
import { getAdminOverview } from "@/lib/admin/metrics";

function number(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export default async function AdminOverviewPage() {
  const overview = await getAdminOverview();
  const metrics = overview.metrics;

  return (
    <div>
      <AdminPageHeader
        action="Quick actions"
        description="A full-width command center for customer access, billing, email sync jobs, workers, queues, exports, integrations, security, and platform health."
        title="Platform Command Center"
      />
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={UsersRound} label="Total users" value={number(metrics.totalUsers)} />
        <MetricCard icon={CreditCard} label="Active subscriptions" value={number(metrics.activeSubscriptions)} />
        <MetricCard icon={KeyRound} label="Active licences" value={number(metrics.activeLicences)} />
        <MetricCard icon={MailCheck} label="Connected email accounts" value={number(metrics.connectedEmailAccounts)} />
        <MetricCard icon={Webhook} label="Marketing accounts" value={number(metrics.connectedMarketingAccounts)} />
        <MetricCard icon={Database} label="Contacts processed today" value={number(metrics.contactsProcessedToday)} />
        <MetricCard icon={RefreshCw} label="Queue jobs waiting" value={number(metrics.queueWaiting)} tone="warning" />
        <MetricCard icon={Activity} label="Jobs running" value={number(metrics.queueActive)} />
        <MetricCard icon={AlertTriangle} label="Failed jobs" value={number(metrics.failedJobs)} tone="danger" />
        <MetricCard icon={Workflow} label="Active workers" value={number(metrics.activeWorkers)} tone="success" />
        <MetricCard icon={Clock3} label="Average job duration" value={metrics.averageJobDuration} />
        <MetricCard icon={Server} label="System error rate" value={metrics.systemErrorRate} />
        <MetricCard icon={TrendingUp} label="Monthly recurring revenue" value={metrics.monthlyRecurringRevenue} />
        <MetricCard icon={BriefcaseBusiness} label="Licence renewal alerts" value={number(metrics.licenceRenewalAlerts)} tone="warning" />
      </section>

      <section className="mt-5 grid gap-4 xl:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03] xl:col-span-2">
          <h2 className="mb-4 text-base font-semibold">New users over time</h2>
          <AdminAreaChart data={overview.charts.userGrowth} dataKey="users" />
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
          <h2 className="mb-4 text-base font-semibold">Subscription distribution</h2>
          <AdminBarChart data={overview.charts.subscriptionDistribution} dataKey="count" />
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
          <h2 className="mb-4 text-base font-semibold">Contacts processed</h2>
          <AdminLineChart data={overview.charts.contactsTrend} dataKey="contacts" />
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03] xl:col-span-2">
          <h2 className="mb-4 text-base font-semibold">Queue throughput</h2>
          <AdminBarChart data={overview.charts.queueThroughput} dataKey="throughput" />
        </div>
      </section>

      <section className="mt-5">
        <h2 className="mb-3 text-base font-semibold">Recent activity</h2>
        <AdminDataTable
          columns={[
            { key: "type", label: "Activity", render: (value) => <StatusBadge value={String(value)} /> },
            { key: "label", label: "Details" },
            { key: "createdAt", label: "Time", render: (value) => new Date(String(value)).toLocaleString() },
          ]}
          empty="No recent activity yet."
          rows={overview.recentActivity.map((item) => ({ ...item, createdAt: item.createdAt.toISOString() }))}
        />
      </section>
    </div>
  );
}

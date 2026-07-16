import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminAreaChart, AdminBarChart } from "@/components/admin/charts/AdminCharts";
import { getAdminOverview } from "@/lib/admin/metrics";

export default async function AdminAnalyticsPage() {
  const overview = await getAdminOverview();

  return (
    <div>
      <AdminPageHeader description="Operational analytics for users, contacts, queue throughput, subscription mix, API response time, and worker utilization." title="Analytics" />
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.03]">
          <h2 className="mb-4 font-semibold">Users</h2>
          <AdminAreaChart data={overview.charts.userGrowth} dataKey="users" />
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.03]">
          <h2 className="mb-4 font-semibold">Queue throughput</h2>
          <AdminBarChart data={overview.charts.queueThroughput} dataKey="throughput" />
        </div>
      </div>
    </div>
  );
}

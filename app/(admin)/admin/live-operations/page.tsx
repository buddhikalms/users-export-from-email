import { Activity, AlertTriangle, Database, HardDrive, Server, Workflow } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MetricCard } from "@/components/admin/MetricCard";
import { getAdminOverview } from "@/lib/admin/metrics";

export default async function LiveOperationsPage() {
  const overview = await getAdminOverview();

  return (
    <div>
      <AdminPageHeader description="Safe polling-ready status surface for queues, workers, request load, database, Redis, IMAP, memory, CPU, disk, active users, and recent incidents." title="Live Operations" />
      <section className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <MetricCard icon={Activity} label="Running jobs" value={overview.metrics.queueActive} />
        <MetricCard icon={Workflow} label="Queue depth" value={overview.metrics.queueWaiting} tone="warning" />
        <MetricCard icon={Server} label="Workers" value={overview.metrics.activeWorkers} tone="success" />
        <MetricCard icon={AlertTriangle} label="Error rate" value={overview.metrics.systemErrorRate} />
        <MetricCard icon={Database} label="Database" value="online" tone="success" />
        <MetricCard icon={HardDrive} label="Redis" value={overview.queues.some((queue) => queue.status === "unavailable") ? "check" : "online"} />
      </section>
    </div>
  );
}

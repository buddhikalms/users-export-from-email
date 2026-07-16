import { AlertTriangle, Clock3, Layers3, PauseCircle, PlayCircle, RotateCcw, Workflow } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MetricCard } from "@/components/admin/MetricCard";
import { QueueActionPanel } from "@/components/admin/queues/QueueActionPanel";
import { AdminDataTable, StatusBadge } from "@/components/admin/tables/AdminDataTable";
import { getQueueSummaries } from "@/lib/queues/queue-service";

export default async function QueueControlPage() {
  const queues = await getQueueSummaries();

  return (
    <div>
      <AdminPageHeader
        action="Create queue policy"
        description="Monitor BullMQ queues, apply safe controls, inspect capacity, and prevent one tenant from consuming all worker throughput."
        title="Queue Control"
      />
      <section className="grid gap-3 md:grid-cols-4">
        <MetricCard icon={Layers3} label="Queues" value={queues.length} />
        <MetricCard icon={Clock3} label="Waiting jobs" value={queues.reduce((sum, queue) => sum + queue.waiting, 0)} tone="warning" />
        <MetricCard icon={Workflow} label="Active jobs" value={queues.reduce((sum, queue) => sum + queue.active, 0)} />
        <MetricCard icon={AlertTriangle} label="Failed jobs" value={queues.reduce((sum, queue) => sum + queue.failed, 0)} tone="danger" />
      </section>
      <section className="mt-5 grid gap-3 xl:grid-cols-2">
        {queues.map((queue) => (
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03]" key={queue.name}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold">{queue.name.replace(/_/g, " ")}</h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  <StatusBadge value={queue.status} />
                  <StatusBadge value={`${queue.workers} workers`} />
                </div>
              </div>
              {queue.status === "paused" ? <PauseCircle className="h-5 w-5 text-amber-500" /> : <PlayCircle className="h-5 w-5 text-emerald-500" />}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
              <div><p className="text-slate-500">Waiting</p><p className="font-semibold">{queue.waiting}</p></div>
              <div><p className="text-slate-500">Active</p><p className="font-semibold">{queue.active}</p></div>
              <div><p className="text-slate-500">Delayed</p><p className="font-semibold">{queue.delayed}</p></div>
              <div><p className="text-slate-500">Completed</p><p className="font-semibold">{queue.completed}</p></div>
              <div><p className="text-slate-500">Failed</p><p className="font-semibold">{queue.failed}</p></div>
              <div><p className="text-slate-500">Failure rate</p><p className="font-semibold">{queue.failureRate}%</p></div>
            </div>
            <div className="mt-4 border-t border-slate-100 pt-4 dark:border-white/10">
              <QueueActionPanel queueName={queue.name} />
            </div>
          </div>
        ))}
      </section>
      <section className="mt-5">
        <AdminDataTable
          columns={[
            { key: "name", label: "Queue" },
            { key: "status", label: "Status", render: (value) => <StatusBadge value={String(value)} /> },
            { key: "waiting", label: "Waiting" },
            { key: "active", label: "Active" },
            { key: "delayed", label: "Delayed" },
            { key: "completed", label: "Completed" },
            { key: "failed", label: "Failed" },
            { key: "throughputPerMinute", label: "Throughput/min" },
            { key: "retryCount", label: "Retries" },
          ]}
          empty="No queues found."
          rows={queues.map((queue) => ({ ...queue, id: queue.name }))}
        />
      </section>
    </div>
  );
}

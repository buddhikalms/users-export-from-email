import { z } from "zod";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable, StatusBadge } from "@/components/admin/tables/AdminDataTable";
import { db } from "@/lib/db";

export const queueRuntimeSettingsSchema = z.object({
  queueName: z.string().min(2),
  enabled: z.boolean(),
  concurrency: z.number().int().min(1).max(200),
  maxJobsPerMinute: z.number().int().min(1).max(10000),
  maxJobsPerTenant: z.number().int().min(1).max(1000),
  timeoutMs: z.number().int().min(1000).max(86_400_000),
  maxAttempts: z.number().int().min(1).max(25),
  retryBackoffMs: z.number().int().min(100).max(3_600_000),
  priorityWeight: z.number().int().min(1).max(100),
});

export default async function QueueSettingsPage() {
  const settings = await db.queueConfiguration.findMany({ orderBy: { queueName: "asc" } }).catch(() => []);

  return (
    <div>
      <AdminPageHeader
        action="Save policy"
        description="Configure concurrency, back-pressure, retention, timeout, retry, and tenant fairness limits with Zod-validated server inputs."
        title="Queue Load Balancing"
      />
      <AdminDataTable
        columns={[
          { key: "queueName", label: "Queue" },
          { key: "enabled", label: "Enabled", render: (value) => <StatusBadge value={value ? "enabled" : "disabled"} /> },
          { key: "concurrency", label: "Concurrency" },
          { key: "maxJobsPerMinute", label: "Jobs/min" },
          { key: "maxJobsPerTenant", label: "Tenant limit" },
          { key: "timeoutMs", label: "Timeout ms" },
          { key: "maxAttempts", label: "Attempts" },
          { key: "priorityWeight", label: "Priority weight" },
        ]}
        empty="Queue settings will appear after the first policy is created."
        rows={settings.map((item) => ({ ...item, id: item.id }))}
      />
    </div>
  );
}

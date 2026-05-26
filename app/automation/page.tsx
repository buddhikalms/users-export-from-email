import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { AutomationWorkspace } from "@/components/automation/AutomationWorkspace";
import { db } from "@/lib/db";

export default async function AutomationPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const [rules, scheduledCount, jobCount, aiJobCount] = userId
    ? await Promise.all([
        db.automationRule.findMany({
          where: { ownerId: userId },
          orderBy: [{ enabled: "desc" }, { updatedAt: "desc" }],
          take: 100,
        }),
        db.automationRule.count({ where: { ownerId: userId, trigger: "SCHEDULED" } }),
        db.backgroundJob.count({ where: { ownerId: userId } }),
        db.backgroundJob.count({ where: { ownerId: userId, type: "AI_ENRICHMENT" } }),
      ])
    : [[], 0, 0, 0];

  return (
    <AutomationWorkspace
      aiJobCount={aiJobCount}
      jobCount={jobCount}
      rules={rules.map((rule) => ({
        id: rule.id,
        name: rule.name,
        trigger: rule.trigger,
        enabled: rule.enabled,
        schedule: rule.schedule,
        lastRunAt: rule.lastRunAt?.toISOString() ?? null,
        nextRunAt: rule.nextRunAt?.toISOString() ?? null,
      }))}
      scheduledCount={scheduledCount}
    />
  );
}

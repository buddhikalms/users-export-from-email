import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { AutomationWorkspace } from "@/components/automation/AutomationWorkspace";
import { db } from "@/lib/db";
import { integrationIdByPrismaPlatform } from "@/lib/integrations/platforms";
import { integrationRegistry } from "@/lib/integrations/registry";

const integrationLabels = new Map(
  integrationRegistry.map((integration) => [integration.platform, integration.label]),
);

function readAutomationActionString(actions: unknown, key: string) {
  if (!actions || typeof actions !== "object" || Array.isArray(actions)) {
    return null;
  }

  const value = (actions as Record<string, unknown>)[key];
  return typeof value === "string" && value ? value : null;
}

export default async function AutomationPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const [rules, scheduledCount, jobCount, aiJobCount, emailAccounts, integrationAccounts, kitAccounts] = userId
    ? await Promise.all([
        db.automationRule.findMany({
          where: { ownerId: userId },
          orderBy: [{ enabled: "desc" }, { updatedAt: "desc" }],
          take: 100,
        }),
        db.automationRule.count({ where: { ownerId: userId, trigger: "SCHEDULED" } }),
        db.backgroundJob.count({ where: { ownerId: userId } }),
        db.backgroundJob.count({ where: { ownerId: userId, type: "AI_ENRICHMENT" } }),
        db.savedEmailAccount.findMany({
          where: { ownerId: userId },
          orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
          select: {
            id: true,
            label: true,
            email: true,
            isDefault: true,
          },
        }),
        db.integrationAccount.findMany({
          where: { ownerId: userId },
          orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
          select: {
            id: true,
            name: true,
            platform: true,
            isDefault: true,
          },
        }),
        db.kitAccount.findMany({
          where: { ownerId: userId },
          orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
          select: {
            id: true,
            name: true,
            isDefault: true,
          },
        }),
      ])
    : [[], 0, 0, 0, [], [], []];
  const platformAccounts = [
    ...kitAccounts.map((account) => ({
      id: account.id,
      name: account.name,
      platform: "kit",
      platformLabel: "Kit",
      accountType: "kit" as const,
      isDefault: account.isDefault,
    })),
    ...integrationAccounts.map((account) => {
      const platform = integrationIdByPrismaPlatform[account.platform];

      return {
        id: account.id,
        name: account.name,
        platform,
        platformLabel: integrationLabels.get(platform) ?? account.platform,
        accountType: "integration" as const,
        isDefault: account.isDefault,
      };
    }),
  ];

  return (
    <AutomationWorkspace
      aiJobCount={aiJobCount}
      emailAccounts={emailAccounts.map((account) => ({
        id: account.id,
        label: account.label,
        email: account.email,
        isDefault: account.isDefault,
      }))}
      jobCount={jobCount}
      platformAccounts={platformAccounts}
      rules={rules.map((rule) => ({
        id: rule.id,
        name: rule.name,
        trigger: rule.trigger,
        enabled: rule.enabled,
        schedule: rule.schedule,
        lastRunAt: rule.lastRunAt?.toISOString() ?? null,
        nextRunAt: rule.nextRunAt?.toISOString() ?? null,
        emailAccountId: readAutomationActionString(rule.actions, "emailAccountId"),
        marketingAccountId: readAutomationActionString(rule.actions, "marketingAccountId"),
        marketingAccountType: readAutomationActionString(rule.actions, "marketingAccountType"),
        marketingPlatform: readAutomationActionString(rule.actions, "marketingPlatform"),
      }))}
      scheduledCount={scheduledCount}
    />
  );
}

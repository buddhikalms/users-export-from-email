import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { IntegrationsWorkspace } from "@/components/integrations/IntegrationsWorkspace";
import { db } from "@/lib/db";
import { launchIntegrationRegistry } from "@/lib/integrations/registry";
import { prismaPlatformByIntegrationId } from "@/lib/integrations/platforms";

export const metadata = {
  title: "Integrations - ChatUp",
  description: "Manage connected marketing accounts and platform sync jobs.",
};

export default async function DashboardIntegrationsPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const [integrationAccounts, kitAccountCount, syncRuns, queuedJobs] = userId
    ? await Promise.all([
        db.integrationAccount.groupBy({
          by: ["platform"],
          where: { ownerId: userId },
          _count: { _all: true },
        }),
        db.kitAccount.count({ where: { ownerId: userId } }),
        db.syncRun.groupBy({
          by: ["platform", "status"],
          _count: { _all: true },
        }),
        db.backgroundJob.count({ where: { ownerId: userId, type: "PLATFORM_SYNC" } }),
      ])
    : [[], 0, [], 0];
  const accountCounts = new Map<string, number>();

  for (const account of integrationAccounts) {
    accountCounts.set(account.platform, account._count._all);
  }

  if (kitAccountCount > 0) {
    accountCounts.set("KIT", (accountCounts.get("KIT") ?? 0) + kitAccountCount);
  }

  const connectedCount = Array.from(accountCounts.values()).reduce((sum, count) => sum + count, 0);
  const successfulSyncs = syncRuns
    .filter((run) => run.status === "SUCCESS")
    .reduce((sum, run) => sum + run._count._all, 0);
  const totalSyncs = syncRuns.reduce((sum, run) => sum + run._count._all, 0);
  const syncHealth = totalSyncs > 0 ? `${Math.round((successfulSyncs / totalSyncs) * 100)}%` : "0%";
  const integrations = launchIntegrationRegistry.map((integration) => {
    const platform = prismaPlatformByIntegrationId[integration.platform];
    const platformSyncs = syncRuns
      .filter((run) => run.platform === platform)
      .reduce((sum, run) => sum + run._count._all, 0);
    const platformSuccesses = syncRuns
      .filter((run) => run.platform === platform && run.status === "SUCCESS")
      .reduce((sum, run) => sum + run._count._all, 0);

    return {
      platform: integration.platform,
      label: integration.label,
      description: integration.description,
      destinationTypes: integration.destinationTypes,
      accounts: accountCounts.get(platform) ?? 0,
      syncs: platformSyncs,
      health:
        platformSyncs > 0 ? `${Math.round((platformSuccesses / platformSyncs) * 100)}%` : "No syncs",
    };
  });

  return (
    <IntegrationsWorkspace
      connectedCount={connectedCount}
      integrations={integrations}
      platformCount={launchIntegrationRegistry.length}
      queuedJobs={queuedJobs}
      syncHealth={syncHealth}
    />
  );
}

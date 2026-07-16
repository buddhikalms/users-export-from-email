import { db } from "@/lib/db";
import { getQueueSummaries } from "@/lib/queues/queue-service";

function formatMonth(date: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "short" }).format(date);
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

export async function getAdminOverview() {
  const today = startOfToday();
  const queues = await getQueueSummaries();
  const [
    totalUsers,
    activeSubscriptions,
    activeLicences,
    connectedEmailAccounts,
    connectedMarketingAccounts,
    contactsProcessedToday,
    failedJobs,
    workers,
    recentUsers,
    recentSyncRuns,
    recentExports,
    planGroups,
  ] = await Promise.all([
    db.user.count(),
    db.subscription.count({ where: { status: "ACTIVE" } }),
    db.licence.count({ where: { status: "ACTIVE" } }).catch(() => 0),
    db.savedEmailAccount.count(),
    db.integrationAccount.count(),
    db.syncRun.aggregate({ where: { createdAt: { gte: today } }, _sum: { contactsFound: true } }),
    db.backgroundJob.count({ where: { status: "FAILED" } }),
    db.workerHeartbeat.count({ where: { lastHeartbeatAt: { gte: new Date(Date.now() - 90_000) } } }).catch(() => 0),
    db.user.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { id: true, name: true, email: true, createdAt: true } }),
    db.syncRun.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { id: true, status: true, targetName: true, contactsFound: true, createdAt: true } }),
    db.exportRun.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { id: true, status: true, format: true, totalContacts: true, createdAt: true } }),
    db.subscription.groupBy({ by: ["plan"], _count: { _all: true } }),
  ]);

  const queueWaiting = queues.reduce((sum, queue) => sum + queue.waiting, 0);
  const queueActive = queues.reduce((sum, queue) => sum + queue.active, 0);
  const queueFailed = queues.reduce((sum, queue) => sum + queue.failed, 0);

  const months = Array.from({ length: 8 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (7 - index), 1);
    date.setHours(0, 0, 0, 0);
    return date;
  });

  const userGrowth = await Promise.all(
    months.map(async (date) => {
      const next = new Date(date);
      next.setMonth(next.getMonth() + 1);
      return {
        label: formatMonth(date),
        users: await db.user.count({ where: { createdAt: { gte: date, lt: next } } }),
      };
    }),
  );

  const contactsTrend = await Promise.all(
    months.map(async (date) => {
      const next = new Date(date);
      next.setMonth(next.getMonth() + 1);
      const aggregate = await db.syncRun.aggregate({
        where: { createdAt: { gte: date, lt: next } },
        _sum: { contactsFound: true },
      });
      return { label: formatMonth(date), contacts: aggregate._sum.contactsFound ?? 0 };
    }),
  );

  return {
    metrics: {
      totalUsers,
      activeSubscriptions,
      activeLicences,
      connectedEmailAccounts,
      connectedMarketingAccounts,
      contactsProcessedToday: contactsProcessedToday._sum.contactsFound ?? 0,
      queueWaiting,
      queueActive,
      failedJobs: failedJobs + queueFailed,
      activeWorkers: workers,
      averageJobDuration: "2.4m",
      systemErrorRate: queueActive + queueWaiting > 0 ? `${Math.round((queueFailed / Math.max(queueActive + queueWaiting, 1)) * 100)}%` : "0%",
      monthlyRecurringRevenue: "$0",
      licenceRenewalAlerts: 0,
    },
    queues,
    charts: {
      userGrowth,
      contactsTrend,
      queueThroughput: queues.map((queue) => ({ label: queue.name.replace(/_/g, " "), throughput: queue.throughputPerMinute })),
      subscriptionDistribution: planGroups.map((group) => ({ label: group.plan.toLowerCase(), count: group._count._all })),
    },
    recentActivity: [
      ...recentUsers.map((user) => ({ id: user.id, type: "Registration", label: user.email, createdAt: user.createdAt })),
      ...recentSyncRuns.map((run) => ({ id: run.id, type: `Sync ${run.status.toLowerCase()}`, label: run.targetName ?? `${run.contactsFound} contacts`, createdAt: run.createdAt })),
      ...recentExports.map((run) => ({ id: run.id, type: `Export ${run.status.toLowerCase()}`, label: `${run.format} ${run.totalContacts} contacts`, createdAt: run.createdAt })),
    ]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10),
  };
}

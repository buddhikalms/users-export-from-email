import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { db } from "@/lib/db";
import {
  formatDateTime,
  getContactGrowthData,
  getFolderActivityData,
  getTopDomainData,
} from "@/lib/dashboard-data";

export const metadata = {
  title: "Dashboard - Email Exporter",
  description: "Monitor mailbox syncs, extracted contacts, exports, and marketing integrations.",
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [
    accountCount,
    contactCount,
    exportCount,
    folderActivity,
    growthData,
    ignoredEmailCount,
    kitAccountCount,
    latestContact,
    topDomains,
  ] = await Promise.all([
    db.savedEmailAccount.count({ where: { ownerId: session.user.id } }),
    db.contact.count({ where: { ownerId: session.user.id } }),
    db.exportRun.count(),
    getFolderActivityData(session.user.id),
    getContactGrowthData(session.user.id),
    db.ignoredEmail.count({ where: { ownerId: session.user.id } }),
    db.kitAccount.count({ where: { ownerId: session.user.id } }),
    db.contact.findFirst({
      where: { ownerId: session.user.id },
      orderBy: { lastSeenAt: "desc" },
      select: { lastSeenAt: true, updatedAt: true },
    }),
    getTopDomainData(session.user.id),
  ]);

  return (
    <DashboardOverview
      accountCount={accountCount}
      contactCount={contactCount}
      exportCount={exportCount}
      folderActivity={folderActivity}
      growthData={growthData}
      ignoredEmailCount={ignoredEmailCount}
      kitAccountCount={kitAccountCount}
      latestSyncTime={formatDateTime(latestContact?.lastSeenAt ?? latestContact?.updatedAt)}
      topDomains={topDomains}
      userName={session.user.name}
    />
  );
}

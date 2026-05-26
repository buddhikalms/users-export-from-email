import Link from "next/link";
import { getServerSession } from "next-auth";
import { ArrowRight, FileSpreadsheet, FolderTree, MailCheck, Shield } from "lucide-react";

import { authOptions } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { db } from "@/lib/db";
import {
  formatDateTime,
  getContactGrowthData,
  getFolderActivityData,
  getTopDomainData,
} from "@/lib/dashboard-data";

const features = [
  {
    title: "Database-backed multi-account storage",
    description:
      "Save multiple mailbox and marketing accounts per user with encrypted credentials.",
    icon: Shield,
  },
  {
    title: "IMAP-first mailbox sync",
    description:
      "Connect Outlook or any IMAP mailbox, validate access, and keep extraction server-side.",
    icon: MailCheck,
  },
  {
    title: "Folder-wise extraction",
    description:
      "Scan folders, detect forwarders, preserve original senders, and track contact source history.",
    icon: FolderTree,
  },
  {
    title: "File and marketing exports",
    description:
      "Generate Excel/CSV/JSON files and sync cleaned contacts into marketing destinations.",
    icon: FileSpreadsheet,
  },
];

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.id) {
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

  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-0 bg-hero-grid bg-[size:44px_44px] opacity-30" />

      <div className="relative mx-auto flex min-h-[calc(100vh-120px)] max-w-7xl flex-col px-6 py-12 lg:px-10">
        <div className="grid flex-1 items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="space-y-8">
            <Badge>BuddhiEmailExtractor / CRM / Marketing Sync / Automation</Badge>
            <div className="space-y-5">
              <h1 className="max-w-3xl text-5xl leading-tight text-foreground md:text-6xl">
                BuddhiEmailExtractor turns inboxes into clean CRM-ready leads.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                Extract contacts from Outlook and IMAP, detect original senders,
                clean duplicates, export files, and sync lead lists to Kit,
                Mailchimp, Brevo, Beehiiv, HubSpot, and more.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href={session?.user ? "/settings" : "/register"}>
                  {session?.user ? "Open Workspace" : "Create Secure Workspace"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href={session?.user ? "/export" : "/login"}>
                  {session?.user ? "Resume Export Session" : "Sign In"}
                </Link>
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ["1", "Connect Outlook or IMAP accounts"],
                ["2", "Clean, score, and enrich contacts"],
                ["3", "Export files or sync marketing platforms"],
              ].map(([step, label]) => (
                <div
                  key={step}
                  className="rounded-[1.5rem] border border-white/80 bg-white/75 p-5 shadow-sm backdrop-blur"
                >
                  <div className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                    Step {step}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="bg-white/72">
                  <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                    <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                      <CardDescription className="mt-2">
                        {feature.description}
                      </CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </section>
        </div>
      </div>
    </main>
  );
}

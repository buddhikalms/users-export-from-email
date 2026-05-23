import Link from "next/link";
import { getServerSession } from "next-auth";
import { ArrowRight, FileSpreadsheet, FolderTree, MailCheck, Shield } from "lucide-react";

import { authOptions } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { db } from "@/lib/db";

const features = [
  {
    title: "Database-backed multi-account storage",
    description:
      "Save multiple IMAP accounts per user and keep account passwords encrypted on the server.",
    icon: Shield,
  },
  {
    title: "IMAP-first mailbox sync",
    description:
      "Connect with incoming mail server settings, validate access, and keep mailbox operations on the server only.",
    icon: MailCheck,
  },
  {
    title: "Folder-wise extraction",
    description:
      "Scan Inbox, Sent Items, Archive, Junk Email, and custom folders while organizing contacts per folder.",
    icon: FolderTree,
  },
  {
    title: "Excel export workflow",
    description:
      "Generate an All Contacts sheet plus folder-specific worksheets with filters and formatted headers.",
    icon: FileSpreadsheet,
  },
];

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.id) {
    const [accountCount, kitAccountCount, ignoredEmailCount] = await Promise.all([
      db.savedEmailAccount.count({ where: { ownerId: session.user.id } }),
      db.kitAccount.count({ where: { ownerId: session.user.id } }),
      db.ignoredEmail.count({ where: { ownerId: session.user.id } }),
    ]);

    return (
      <DashboardOverview
        accountCount={accountCount}
        ignoredEmailCount={ignoredEmailCount}
        kitAccountCount={kitAccountCount}
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
            <Badge>Next.js 15 / TypeScript / Auth / Prisma / IMAP</Badge>
            <div className="space-y-5">
              <h1 className="max-w-3xl text-5xl leading-tight text-foreground md:text-6xl">
                Securely manage multiple email accounts and export folder-wise
                contact workbooks.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                This workspace adds authenticated access, database-backed account
                storage, encrypted password handling, IMAP folder sync, last-seen
                filtering, and Excel export.
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
                ["1", "Create a secure authenticated workspace"],
                ["2", "Save one or many IMAP accounts"],
                ["3", "Sync folders, review results, and export"],
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

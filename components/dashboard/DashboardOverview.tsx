import Link from "next/link";
import type { ElementType } from "react";
import {
  CheckCircle2,
  Clock3,
  FileSpreadsheet,
  MailCheck,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";

import { ContactGrowthChart, FolderActivityChart } from "@/components/charts/DashboardCharts";
import type { FolderPoint, GrowthPoint } from "@/components/charts/DashboardCharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DashboardOverviewProps {
  accountCount: number;
  contactCount: number;
  exportCount: number;
  folderActivity: FolderPoint[];
  growthData: GrowthPoint[];
  kitAccountCount: number;
  ignoredEmailCount: number;
  latestSyncTime: string;
  topDomains: Array<{ domain: string; count: number }>;
  userName?: string | null;
}

function StatCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: ElementType;
}) {
  return (
    <div className="rounded-3xl border border-border/70 bg-card/82 p-5 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
          <p className="mt-2 text-xs text-muted-foreground">{detail}</p>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export function DashboardOverview({
  accountCount,
  contactCount,
  exportCount,
  folderActivity,
  growthData,
  kitAccountCount,
  ignoredEmailCount,
  latestSyncTime,
  topDomains,
  userName,
}: DashboardOverviewProps) {
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-border/70 bg-card/82 p-6 shadow-sm backdrop-blur md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <Badge className="bg-primary/10 text-primary">Enterprise contact ops</Badge>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-5xl">
              Welcome back{userName ? `, ${userName}` : ""}.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
              Monitor mailbox syncs, lead intelligence, CRM cleanup, marketing
              platform exports, automations, and workbook delivery from one operating dashboard.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/settings">
                <MailCheck className="h-4 w-4" />
                Connect Mailbox
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={"/integrations" as "/"}>
                <Sparkles className="h-4 w-4" />
                Integrations
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <StatCard detail="Saved in CRM" icon={UsersRound} label="Total Contacts" value={String(contactCount)} />
        <StatCard detail="Unique by saved contact record" icon={ShieldCheck} label="Unique Contacts" value={String(contactCount)} />
        <StatCard detail={`${accountCount} saved mailboxes`} icon={MailCheck} label="Saved Mailboxes" value={String(accountCount)} />
        <StatCard detail="File exports recorded" icon={FileSpreadsheet} label="Exports" value={String(exportCount)} />
        <StatCard detail="Ready for exports" icon={CheckCircle2} label="Marketing Accounts" value={String(kitAccountCount)} />
        <StatCard detail={`${ignoredEmailCount} ignore rules`} icon={Clock3} label="Last Sync" value={latestSyncTime} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-3xl border border-border/70 bg-card/82 p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Contact Growth</h2>
              <p className="text-sm text-muted-foreground">Cleaned contacts over time</p>
            </div>
            <Button size="sm" variant="outline">View analytics</Button>
          </div>
          <ContactGrowthChart data={growthData} />
        </div>

        <div className="rounded-3xl border border-border/70 bg-card/82 p-5 shadow-sm">
          <h2 className="text-xl font-semibold">Folder Activity</h2>
          <p className="mb-5 text-sm text-muted-foreground">Top folders by contact yield</p>
          <FolderActivityChart data={folderActivity} />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-border/70 bg-card/82 p-5 shadow-sm xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Sync Activity</h2>
            <Button asChild size="sm" variant="ghost">
              <Link href="/sync-history">View all</Link>
            </Button>
          </div>
          <div className="rounded-3xl border border-dashed border-border bg-secondary/30 p-8 text-center text-sm text-muted-foreground">
            Sync activity will appear here after mailbox or marketing sync runs are saved.
          </div>
        </div>

        <div className="rounded-3xl border border-border/70 bg-card/82 p-5 shadow-sm">
          <h2 className="text-xl font-semibold">Most Active Domains</h2>
          {topDomains.length ? (
            <div className="mt-4 space-y-3">
              {topDomains.map((domain) => (
                <div key={domain.domain} className="flex items-center justify-between rounded-2xl bg-secondary/70 p-3">
                  <span className="text-sm font-medium">{domain.domain}</span>
                  <span className="text-xs text-muted-foreground">{domain.count} contacts</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-3xl border border-dashed border-border bg-secondary/30 p-8 text-center text-sm text-muted-foreground">
              No contact domains saved yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

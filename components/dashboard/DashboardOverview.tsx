import Link from "next/link";
import type { ElementType } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  FileSpreadsheet,
  MailCheck,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";

import { ContactGrowthChart, FolderActivityChart } from "@/components/charts/DashboardCharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DashboardOverviewProps {
  accountCount: number;
  kitAccountCount: number;
  ignoredEmailCount: number;
  userName?: string | null;
}

const activity = [
  ["Email sync completed", "Inbox and Sales folders scanned", "2 min ago", "Success"],
  ["Kit export queued", "Potential Clients tag selected", "18 min ago", "Partial"],
  ["Duplicate cleanup", "124 repeated addresses skipped", "1 hr ago", "Success"],
  ["Excel workbook generated", "Folder-wise contact workbook", "Yesterday", "Success"],
];

const topSenders = [
  ["partners.example.com", "428 contacts"],
  ["agency.co", "286 contacts"],
  ["gmail.com", "231 contacts"],
  ["linkedin.com", "190 contacts"],
];

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
  kitAccountCount,
  ignoredEmailCount,
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
              Monitor mailbox syncs, clean contact intelligence, Kit exports, and
              workbook delivery from one full-width operating dashboard.
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
              <Link href={"/settings/kit" as "/settings"}>
                <Sparkles className="h-4 w-4" />
                Kit Accounts
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <StatCard detail="Across latest sync sessions" icon={UsersRound} label="Total Contacts" value="2,130" />
        <StatCard detail="After global dedupe" icon={ShieldCheck} label="Unique Contacts" value="1,804" />
        <StatCard detail={`${accountCount} saved mailboxes`} icon={MailCheck} label="Emails Synced" value="18.2k" />
        <StatCard detail="Last 30 days" icon={Sparkles} label="Kit Subscribers Exported" value="742" />
        <StatCard detail="Ready for exports" icon={CheckCircle2} label="Active Kit Accounts" value={String(kitAccountCount)} />
        <StatCard detail={`${ignoredEmailCount} ignore rules`} icon={Clock3} label="Last Sync Time" value="2m" />
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
          <ContactGrowthChart />
        </div>

        <div className="rounded-3xl border border-border/70 bg-card/82 p-5 shadow-sm">
          <h2 className="text-xl font-semibold">Folder Activity</h2>
          <p className="mb-5 text-sm text-muted-foreground">Top folders by contact yield</p>
          <FolderActivityChart />
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
          <div className="divide-y divide-border/70">
            {activity.map(([title, detail, time, status]) => (
              <div key={`${title}-${time}`} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <div className="font-medium">{title}</div>
                  <div className="text-sm text-muted-foreground">{detail}</div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={status === "Success" ? "bg-accent/15 text-accent-foreground dark:text-accent" : "bg-secondary text-secondary-foreground"}>
                    {status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-border/70 bg-card/82 p-5 shadow-sm">
          <h2 className="text-xl font-semibold">Most Active Domains</h2>
          <div className="mt-4 space-y-3">
            {topSenders.map(([domain, count]) => (
              <div key={domain} className="flex items-center justify-between rounded-2xl bg-secondary/70 p-3">
                <span className="text-sm font-medium">{domain}</span>
                <span className="text-xs text-muted-foreground">{count}</span>
              </div>
            ))}
          </div>
          <Button className="mt-5 w-full" variant="outline">
            Domain analytics
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}

import Link from "next/link";
import { ArrowRight, FileSpreadsheet, FolderTree, MailCheck, Shield } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "IMAP-first Outlook connection",
    description:
      "Connect with incoming mail server settings, validate access, and keep credentials server-side for actual mailbox operations.",
    icon: MailCheck,
  },
  {
    title: "Folder-wise extraction",
    description:
      "Scan Inbox, Sent Items, Archive, Junk Email, and custom folders while keeping contact lists organized per folder.",
    icon: FolderTree,
  },
  {
    title: "Excel workbook export",
    description:
      "Generate one workbook with one sheet per folder plus an All Contacts rollup sheet with filters and formatted headers.",
    icon: FileSpreadsheet,
  },
  {
    title: "Safer handling by default",
    description:
      "Passwords stay in the current browser session unless the user explicitly chooses to persist them on the device.",
    icon: Shield,
  },
];

export default function HomePage() {
  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-0 bg-hero-grid bg-[size:44px_44px] opacity-30" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-12 lg:px-10">
        <div className="grid flex-1 items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="space-y-8">
            <Badge>Next.js 15 • TypeScript • IMAP • Excel</Badge>
            <div className="space-y-5">
              <h1 className="max-w-3xl text-5xl leading-tight text-foreground md:text-6xl">
                Sync Outlook folders, extract unique contacts, and export a clean
                workbook in one flow.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                This app connects to Outlook using incoming mail server settings,
                reads message headers from selected folders, groups unique contacts
                folder-wise, and exports them to Excel without relying on Microsoft
                Graph.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/settings">
                  Start Connection Setup
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/export">Open Last Export Session</Link>
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ["1", "Enter Outlook IMAP settings"],
                ["2", "Choose folders to scan"],
                ["3", "Review and export to Excel"],
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

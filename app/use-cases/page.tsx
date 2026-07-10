import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  FileSpreadsheet,
  Megaphone,
  Newspaper,
  Rocket,
  Search,
  Sparkles,
  UsersRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { CTASection } from "@/components/marketing/CTASection";
import { Section, SectionIntro } from "@/components/marketing/Section";

export const metadata: Metadata = {
  title: "Use Cases - OMAZYNC",
  description:
    "Choose the best OMAZYNC plan for agencies, PR teams, publishers, recruiters, sales teams, founders, freelancers, and directories.",
};

const planMatches = [
  {
    plan: "Starter",
    fit: "Solo workflows",
    price: "$19/mo",
    description: "Best for freelancers, founders, and small teams exporting one mailbox to Excel or CSV.",
    featured: false,
  },
  {
    plan: "Professional",
    fit: "Growth teams",
    price: "$49/mo",
    description: "Best for teams using multiple mailboxes, Kit, Zoho Campaigns, Brevo, and scheduled exports.",
    featured: true,
  },
  {
    plan: "Agency",
    fit: "Client operations",
    price: "$129/mo",
    description: "Best for agencies, PR teams, publishers, and client accounts that need automation rules.",
    featured: false,
  },
] as const;

const useCases = [
  {
    title: "Marketing agencies",
    icon: BriefcaseBusiness,
    plan: "Agency",
    pain: "Client contacts are spread across campaign inboxes, team folders, and forwarded leads.",
    outcome: "Build client-ready contact databases, map folders to tags, and sync each client to the correct marketing account.",
    workflow: ["Connect client mailbox", "Scan campaign folders", "Remove duplicates", "Sync to Kit or Zoho"],
    advantages: ["Client-specific exports", "Folder-to-tag mapping", "Less CSV cleanup"],
    result: "Turn inbox history into billable contact lists in one afternoon.",
  },
  {
    title: "PR teams",
    icon: Megaphone,
    plan: "Agency",
    pain: "Journalists, partners, and contributors are buried inside years of replies and forwarded email chains.",
    outcome: "Discover original senders, clean press contacts, and export outreach-ready lists by beat or publication.",
    workflow: ["Scan media folders", "Detect forwarded senders", "Clean duplicates", "Export press list"],
    advantages: ["Find hidden journalists", "Keep publication context", "Refresh old media lists"],
    result: "Build fresher media lists without starting from a blank spreadsheet.",
  },
  {
    title: "Publishers",
    icon: Newspaper,
    plan: "Professional",
    pain: "Subscriber, sponsor, author, and contributor conversations arrive in separate inbox folders.",
    outcome: "Segment contacts by folder and sync newsletter-ready lists to Kit, Zoho Campaigns, or Brevo.",
    workflow: ["Extract submissions", "Segment sponsors", "Clean mailto links", "Sync newsletter contacts"],
    advantages: ["Separate sponsors and authors", "Clean subscriber rows", "Sync to newsletter tools"],
    result: "Convert editorial inboxes into organized audience growth data.",
  },
  {
    title: "Recruiters",
    icon: Search,
    plan: "Professional",
    pain: "Candidate and company details sit inside outreach threads, reply chains, and old project folders.",
    outcome: "Capture candidates, hiring managers, and company contacts with source-folder context.",
    workflow: ["Scan role folders", "Normalize emails", "Remove repeats", "Export company contacts"],
    advantages: ["Recover candidate leads", "Group by role folder", "Build follow-up lists"],
    result: "Recover useful recruiting data from conversations your team already had.",
  },
  {
    title: "Sales teams",
    icon: BarChart3,
    plan: "Professional",
    pain: "Warm leads are scattered across sales, support, partner, and founder inboxes.",
    outcome: "Turn conversations into clean contact lists and send qualified leads into supported campaign tools.",
    workflow: ["Extract lead folders", "Score domains", "Clean duplicates", "Sync to CRM"],
    advantages: ["Find warm leads", "Preserve sales context", "Reduce duplicate CRM rows"],
    result: "Create follow-up lists from real conversations, not cold guesses.",
  },
  {
    title: "Business directories",
    icon: Building2,
    plan: "Starter",
    pain: "Research emails, forwarded notes, and source lists become messy CSV files with repeated addresses.",
    outcome: "Normalize addresses, remove mailto issues, and export clean rows for directory workflows.",
    workflow: ["Scan source folders", "Clean mailto data", "Group by folder", "Export CSV"],
    advantages: ["Cleaner directory files", "Normalized email values", "Source-folder grouping"],
    result: "Produce cleaner directory contact files with less manual cleanup.",
  },
  {
    title: "Freelancers",
    icon: FileSpreadsheet,
    plan: "Starter",
    pain: "Prospects, collaborators, and referrals are spread across old conversations.",
    outcome: "Build a lightweight contact database and export it for follow-up or newsletter outreach.",
    workflow: ["Connect one mailbox", "Scan client folders", "Remove duplicates", "Export to Excel"],
    advantages: ["Simple one-mailbox setup", "Fast lead list creation", "Excel-ready output"],
    result: "Start with one mailbox and get a usable lead list fast.",
  },
  {
    title: "SaaS founders",
    icon: Rocket,
    plan: "Professional",
    pain: "Early customer signals live inside support, sales, demo, and intro emails.",
    outcome: "Extract beta users, partners, and prospects, then sync them into marketing campaigns.",
    workflow: ["Scan support folders", "Segment beta users", "Deduplicate", "Sync to campaigns"],
    advantages: ["Segment beta users", "Capture partner leads", "Feed launch campaigns"],
    result: "Turn early conversations into a growth list you can actually use.",
  },
] as const;

const outcomes = [
  "Extract contacts from Outlook and IMAP folders",
  "Clean duplicates before they reach your CRM",
  "Keep folder context for tags and segments",
  "Sync to Kit, Zoho Campaigns, and Brevo",
] as const;

export default function UseCasesPage() {
  return (
    <main>
      <section className="relative overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#ffffff_54%,#ffffff_100%)] dark:bg-[linear-gradient(180deg,#020617_0%,#0f172a_58%,#020617_100%)]">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary dark:text-secondary">
              Use Cases
            </p>
            <h1 className="mt-4 text-5xl font-semibold tracking-tight text-slate-950 dark:text-white md:text-7xl">
              Find the right plan for the inbox workflow you already have.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              OMAZYNC helps agencies, PR teams, publishers, recruiters, sales teams, and founders
              turn mailbox history into clean exports and marketing syncs.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="bg-gradient-to-r from-slate-950 to-secondary text-white hover:opacity-90">
                <Link href={"/pricing" as any}>
                  Compare Plans
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href={"/contact" as any}>Book a Demo</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-950/10 dark:border-white/10 dark:bg-white/[0.04]">
            <div className="rounded-[1.5rem] bg-slate-950 p-5 text-white">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Plan finder</span>
                <Sparkles className="h-5 w-5 text-secondary" />
              </div>
              <div className="mt-5 grid gap-3">
                {planMatches.map((item) => (
                  <article
                    key={item.plan}
                    className={
                      item.featured
                        ? "rounded-2xl border border-secondary/25 bg-secondary/10 p-4"
                        : "rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                    }
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h2 className="font-semibold">{item.plan}</h2>
                        <p className="mt-1 text-xs text-slate-300">{item.fit}</p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-950">
                        {item.price}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-300">{item.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Section className="py-12">
        <div className="grid gap-4 md:grid-cols-4">
          {outcomes.map((item) => (
            <div key={item} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-secondary dark:text-secondary" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{item}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section className="pt-0">
        <SectionIntro
          eyebrow="Advantages"
          title="Why each team gets value quickly."
          description="Each use case starts with the same simple idea: your inbox already contains useful contacts, but they need structure before they are useful for outreach, reporting, or marketing sync."
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            ["Faster list building", "Create a usable contact list from existing inbox folders instead of rebuilding it manually."],
            ["Better data quality", "Remove duplicates, broken mailto values, repeated senders, and messy forwarded-chain contacts."],
            ["Useful segmentation", "Keep source folders attached so lists can become tags, audiences, client files, or campaign segments."],
            ["Flexible delivery", "Send final contacts to Excel, CSV, JSON, Google Sheets, Kit, Zoho Campaigns, or Brevo."],
          ].map(([title, description]) => (
            <article
              key={title}
              className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]"
            >
              <CheckCircle2 className="h-5 w-5 text-secondary dark:text-secondary" />
              <h2 className="mt-4 font-semibold text-slate-950 dark:text-white">
                {title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {description}
              </p>
            </article>
          ))}
        </div>
      </Section>

      <Section>
        <SectionIntro
          eyebrow="Choose Your Workflow"
          title="Every inbox has a different revenue path."
          description="Pick the scenario closest to your team and see the plan that fits the work."
        />
        <div className="grid gap-5 md:grid-cols-2">
          {useCases.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className="group rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-secondary/25 hover:shadow-xl hover:shadow-secondary/20 dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-secondary/25"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary/10 text-secondary dark:bg-secondary/10 dark:text-secondary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-950 dark:text-white">{item.title}</h2>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Recommended: {item.plan}</p>
                    </div>
                  </div>
                  <Link
                    className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white transition group-hover:bg-secondary dark:bg-white dark:text-slate-950 dark:group-hover:bg-secondary dark:group-hover:text-white"
                    href={"/pricing" as any}
                  >
                    View plan
                  </Link>
                </div>

                <div className="mt-5 grid gap-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  <p><strong className="text-slate-950 dark:text-white">Problem:</strong> {item.pain}</p>
                  <p><strong className="text-slate-950 dark:text-white">How OMAZYNC helps:</strong> {item.outcome}</p>
                </div>

                <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/70">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary dark:text-secondary">
                    Example workflow
                  </p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {item.workflow.map((step) => (
                      <div key={step} className="rounded-xl bg-white px-3 py-2 text-sm text-slate-700 shadow-sm dark:bg-white/10 dark:text-slate-200">
                        {step}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                    Advantages
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.advantages.map((advantage) => (
                      <span
                        key={advantage}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 dark:border-white/10 dark:bg-white/10 dark:text-slate-200"
                      >
                        {advantage}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-3 rounded-2xl border border-secondary/25 bg-secondary/10 p-4 text-sm font-medium text-secondary dark:border-secondary/25 dark:bg-secondary/10 dark:text-secondary">
                  <Sparkles className="h-5 w-5 shrink-0" />
                  {item.result}
                </div>
              </article>
            );
          })}
        </div>
      </Section>

      <Section className="pt-0">
        <div className="grid gap-5 lg:grid-cols-3">
          {planMatches.map((item) => (
            <article
              key={item.plan}
              className={
                item.featured
                  ? "rounded-[1.5rem] border border-secondary/25 bg-slate-950 p-6 text-white shadow-2xl shadow-secondary/20"
                  : "rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]"
              }
            >
              <p className={item.featured ? "text-sm font-semibold text-secondary" : "text-sm font-semibold text-secondary dark:text-secondary"}>
                {item.fit}
              </p>
              <h2 className="mt-3 text-2xl font-semibold">{item.plan}</h2>
              <p className={item.featured ? "mt-3 text-sm leading-6 text-slate-300" : "mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300"}>
                {item.description}
              </p>
              <div className="mt-6 text-3xl font-semibold">{item.price}</div>
              <Button
                asChild
                className={item.featured ? "mt-6 bg-white text-slate-950 hover:bg-slate-100" : "mt-6"}
                variant={item.featured ? "default" : "outline"}
              >
                <Link href={"/pricing" as any}>
                  Choose {item.plan}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </article>
          ))}
        </div>
      </Section>

      <CTASection />
    </main>
  );
}

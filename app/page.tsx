import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Clock3,
  ContactRound,
  FileSpreadsheet,
  FolderTree,
  Layers3,
  MailCheck,
  Newspaper,
  RefreshCw,
  SearchCheck,
  Sparkles,
  Target,
  UserSearch,
  UsersRound,
} from "lucide-react";

import { BenefitCard } from "@/components/marketing/BenefitCard";
import { EcosystemDiagram } from "@/components/marketing/EcosystemDiagram";
import { Hero } from "@/components/marketing/Hero";
import { PlatformCard } from "@/components/marketing/PlatformCard";
import { Reveal, Stagger, StaggerItem } from "@/components/marketing/Motion";
import { Section, SectionIntro } from "@/components/marketing/Section";
import { UseCaseCard } from "@/components/marketing/UseCaseCard";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
<<<<<<< HEAD
  title: "OMAZYNC - Turn Your Inbox Into a Contact Database",
=======
  title: "Omazync - Turn Your Inbox Into a Contact Database",
>>>>>>> 5d8ace5 (security: fix vulnerbilities, load testing)
  description:
    "Extract, clean, organize, export, and sync contacts from Outlook and IMAP mailboxes.",
};

const platformFeatures = [
  [
    "Email Sync",
    "Connect Outlook and IMAP mailboxes, then scan the folders that matter.",
    MailCheck,
  ],
  [
    "Smart Contact Discovery",
    "Find direct senders, reply-to addresses, and contacts inside forwarded threads.",
    SearchCheck,
  ],
  [
    "Duplicate Cleanup",
    "Normalize addresses and merge repeated contacts into one dependable record.",
    Sparkles,
  ],
  [
    "Folder-Based Organization",
    "Keep mailbox context so folders become useful lists, tags, and segments.",
    FolderTree,
  ],
  [
    "Marketing Platform Sync",
    "Send clean contacts to Kit, Zoho Campaigns, and Brevo.",
    RefreshCw,
  ],
  [
    "Export History",
    "See what was exported, where it went, and how your contact database is growing.",
    BarChart3,
  ],
] as const;

const benefits = [
  [
    "Save hours of manual work",
    "Replace copy, paste, and spreadsheet cleanup with a repeatable workflow.",
    Clock3,
  ],
  [
    "Build cleaner marketing lists",
    "Turn scattered conversations into structured, campaign-ready audiences.",
    Target,
  ],
  [
    "Remove duplicates automatically",
    "Keep one accurate contact record without repeated rows or noisy aliases.",
    CheckCircle2,
  ],
  [
    "Sync directly to your tools",
    "Move contacts into your marketing stack without another manual handoff.",
    Layers3,
  ],
] as const;

const useCases = [
  [
    "Marketing Agencies",
    "Build clean audiences from client inboxes and route them to the right account.",
    BriefcaseBusiness,
  ],
  [
    "PR Teams",
    "Find journalists, partners, and media contacts across years of conversations.",
    UsersRound,
  ],
  [
    "Publishers",
    "Turn subscriber and contributor correspondence into organized contact lists.",
    Newspaper,
  ],
  [
    "Recruiters",
    "Surface candidate and company contacts from outreach and hiring folders.",
    UserSearch,
  ],
  [
    "Sales Teams",
    "Recover warm leads and decision-makers already active in your inbox.",
    Building2,
  ],
  [
    "Business Directories",
    "Create structured, exportable records from ongoing email relationships.",
    ContactRound,
  ],
] as const;

export default function MarketingHomePage() {
  return (
    <main className="overflow-hidden bg-white dark:bg-slate-950">
      <Hero />

      <Section>
        <Reveal>
          <SectionIntro
            eyebrow="One connected platform"
            title="Everything Your Contact Workflow Needs"
            description="From first mailbox connection to final campaign sync, every step lives in one clear workflow."
          />
        </Reveal>
        <Stagger className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {platformFeatures.map(([title, description, Icon]) => (
            <StaggerItem key={title}>
              <PlatformCard
                title={title}
                description={description}
                icon={Icon}
              />
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      <section className="relative border-y border-slate-200/70 bg-slate-50/80 py-20 dark:border-white/10 dark:bg-white/[0.025] lg:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,127,212,0.1),transparent_42%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionIntro
<<<<<<< HEAD
              eyebrow="OMAZYNC Ecosystem"
=======
              eyebrow="Omazync Ecosystem"
>>>>>>> 5d8ace5 (security: fix vulnerbilities, load testing)
              title="Your inbox, connected to everything that comes next"
              description="Bring every contact workflow into one coordinated system."
            />
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mx-auto -mt-3 max-w-4xl rounded-2xl border border-secondary/25 bg-secondary/10 px-5 py-4 text-center shadow-sm dark:border-secondary/25 dark:bg-secondary/10">
              <p className="text-sm font-medium leading-6 text-slate-700 dark:text-slate-200 sm:text-base">
                <span className="font-semibold text-secondary dark:text-secondary">
                  One tool
                </span>{" "}
                to import and export email contacts, sync with email marketing
                platforms, clean duplicate records, protect data in a secure
                vault, monitor analytics, and manage multiple connected
                accounts.
              </p>
            </div>
          </Reveal>
          <EcosystemDiagram />
        </div>
      </section>

      <Section>
        <Reveal>
          <SectionIntro
            align="left"
            eyebrow="Immediate impact"
            title="Four things you’ll feel on day one"
            description="Less repetitive work, cleaner data, and a much shorter path from conversation to campaign."
          />
        </Reveal>
        <Stagger className="grid gap-x-8 md:grid-cols-2 lg:grid-cols-4">
          {benefits.map(([title, description, Icon], index) => (
            <StaggerItem key={title}>
              <BenefitCard
                index={index + 1}
                title={title}
                description={description}
                icon={Icon}
              />
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      <Section className="pt-8">
        <Reveal>
          <SectionIntro
            eyebrow="Made for real workflows"
            title="Built for teams that live in email"
<<<<<<< HEAD
            description="Wherever valuable relationships arrive by email, OMAZYNC turns them into usable data."
=======
            description="Wherever valuable relationships arrive by email, Omazync turns them into usable data."
>>>>>>> 5d8ace5 (security: fix vulnerbilities, load testing)
          />
        </Reveal>
        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {useCases.map(([title, description, Icon]) => (
            <StaggerItem key={title}>
              <UseCaseCard
                title={title}
                description={description}
                icon={Icon}
              />
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      <Section className="pb-20 pt-8 lg:pb-28">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary to-secondary px-6 py-16 text-center text-white shadow-[0_32px_90px_-38px_rgba(0,127,212,0.55)] sm:px-12 lg:py-20">
            <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-secondary/10 blur-3xl dark:bg-white/15" />
            <div className="absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
            <FileSpreadsheet className="relative mx-auto h-8 w-8 text-secondary dark:text-white" />
            <h2 className="relative mx-auto mt-6 max-w-3xl text-3xl font-semibold tracking-tight sm:text-5xl">
              Start discovering contacts hidden inside your inbox today.
            </h2>
            <p className="relative mx-auto mt-5 max-w-2xl text-slate-300 dark:text-secondary">
              Connect a mailbox, choose your folders, and build a cleaner
              contact database in minutes.
            </p>
            <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/20 bg-white/10 text-white hover:bg-white/20 dark:bg-white dark:text-secondary"
              >
                <Link href="/contact">View Demo</Link>
              </Button>
              <Button
                asChild
                size="lg"
                className="bg-white text-slate-950 hover:bg-secondary/10 dark:bg-slate-950 dark:text-white"
              >
                <Link href="/register">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </Section>
    </main>
  );
}

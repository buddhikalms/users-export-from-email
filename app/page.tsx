import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  FileSpreadsheet,
  FolderTree,
  KeyRound,
  MailCheck,
  Repeat,
  ShieldCheck,
  Sparkles,
  Tags,
  UsersRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CTASection } from "@/components/marketing/CTASection";
import { DashboardMockup } from "@/components/marketing/DashboardMockup";
import { FAQ } from "@/components/marketing/FAQ";
import { FeatureCard } from "@/components/marketing/FeatureCard";
import { Hero } from "@/components/marketing/Hero";
import { IntegrationCard } from "@/components/marketing/IntegrationCard";
import { Reveal, Stagger, StaggerItem } from "@/components/marketing/Motion";
import { PricingCard } from "@/components/marketing/PricingCard";
import { Section, SectionIntro } from "@/components/marketing/Section";

export const metadata: Metadata = {
  title: "Email Exporter - Extract, Clean & Sync Email Contacts",
  description:
    "Extract contacts from Outlook and IMAP mailboxes, clean duplicates, export to Excel, and sync to Kit, Mailchimp, Brevo, HubSpot, and more.",
};

const features = [
  ["Outlook/IMAP sync", "Connect Outlook or any IMAP mailbox and scan selected folders server-side.", MailCheck],
  ["Folder-wise extraction", "Preserve source folders so lists can become tags, segments, or client exports.", FolderTree],
  ["Forwarded chain detection", "Detect original senders hidden inside forwarded email conversations.", Repeat],
  ["Duplicate cleanup", "Remove repeated contacts, mailto artifacts, and noisy role-based addresses.", CheckCircle2],
  ["Excel/CSV export", "Download clean folder-wise exports for handoff, analysis, or CRM import.", FileSpreadsheet],
  ["Marketing sync", "Push contacts directly into Kit, Mailchimp, Brevo, HubSpot, Beehiiv, and more.", Sparkles],
] as const;

const integrations = ["Kit", "Mailchimp", "Brevo", "HubSpot", "Beehiiv", "ActiveCampaign"];

export default function MarketingHomePage() {
  return (
    <main>
      <Hero />

      <Section className="py-10">
        <Stagger className="flex flex-wrap justify-center gap-3">
          {["Marketing agencies", "PR teams", "Publishers", "Recruiters", "Sales teams"].map((item) => (
            <StaggerItem key={item}>
              <Badge className="rounded-full bg-slate-100 px-4 py-2 text-slate-700 dark:bg-white/10 dark:text-slate-200">
                {item}
              </Badge>
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <Reveal>
            <SectionIntro
              align="left"
              eyebrow="The Problem"
              title="Your best contacts are scattered across inbox folders."
              description="Teams collect valuable leads through direct email, forwarded conversations, subscriptions, replies, introductions, and client handoffs. Without extraction and cleanup, that data stays trapped."
            />
          </Reveal>
          <Stagger className="grid gap-4 sm:grid-cols-2">
            {[
              ["Messy exports", "Manual CSV work creates duplicates and missing source context."],
              ["Hidden senders", "Forwarded chains bury the original contact behind another person."],
              ["Platform drift", "Kit, Mailchimp, Brevo, and HubSpot accounts get updated inconsistently."],
              ["Credential risk", "API keys and mailbox passwords need a secure workflow."],
            ].map(([title, description]) => (
              <StaggerItem key={title}>
                <article className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-950/10 dark:border-white/10 dark:bg-white/[0.04]">
                  <h3 className="font-semibold text-slate-950 dark:text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </Section>

      <Section>
        <Reveal>
          <SectionIntro
            eyebrow="Features"
            title="Everything you need to extract, clean, export, and sync contacts."
            description="Email Exporter turns mailbox activity into organized, marketing-ready data with secure multi-account workflows."
          />
        </Reveal>
        <Stagger className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map(([title, description, Icon]) => (
            <StaggerItem key={title}>
              <FeatureCard description={description} icon={Icon} title={title} />
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center">
          <Reveal>
            <DashboardMockup />
          </Reveal>
          <Reveal delay={0.12}>
            <SectionIntro
              align="left"
              eyebrow="How It Works"
              title="From mailbox folders to clean platform sync in minutes."
            />
            <Stagger className="grid gap-4">
              {[
                ["1", "Select an Outlook or IMAP account and choose the folders to scan."],
                ["2", "Extract contacts, detect forwarded senders, and remove duplicates."],
                ["3", "Export to Excel/CSV or sync to your selected marketing platform."],
              ].map(([step, text]) => (
                <StaggerItem key={step}>
                  <div className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-950/10 dark:border-white/10 dark:bg-white/[0.04]">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue-600 text-sm font-semibold text-white">{step}</span>
                    <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{text}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </Reveal>
        </div>
      </Section>

      <Section>
        <Reveal>
          <SectionIntro
            eyebrow="Integrations"
            title="Sync cleaned contacts to the tools your team already uses."
            description="Connect multiple accounts and route folder-based contacts into lists, tags, forms, audiences, or segments."
          />
        </Reveal>
        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {integrations.map((name) => (
            <StaggerItem key={name}>
              <IntegrationCard description={`Send cleaned contacts and folder context to ${name} workflows.`} name={name} />
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      <Section className="max-w-none bg-slate-950 text-white">
        <Stagger className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
          {[
            [ShieldCheck, "Encrypted credential vault", "Protect mailbox and API credentials with a privacy-first vault workflow."],
            [KeyRound, "No plain-text secrets", "Avoid plain-text IMAP passwords and marketing platform API keys."],
            [BarChart3, "Export and sync history", "Track completed exports, platform jobs, and contact growth over time."],
          ].map(([Icon, title, description]) => (
            <StaggerItem key={title as string}>
              <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition hover:-translate-y-1 hover:bg-white/[0.07]">
                <Icon className="h-6 w-6 text-blue-300" />
                <h3 className="mt-4 text-lg font-semibold">{title as string}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{description as string}</p>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      <Section>
        <Reveal>
          <SectionIntro eyebrow="Use Cases" title="Built for teams that live inside email." />
        </Reveal>
        <Stagger className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            ["Agencies", "Extract client campaign contacts and sync them to the right account."],
            ["PR teams", "Build journalist and partner lists from years of inbox history."],
            ["Recruiters", "Capture candidate and company contacts from outreach folders."],
            ["SaaS founders", "Turn early customer conversations into segmented lead lists."],
          ].map(([title, description]) => (
            <StaggerItem key={title}>
              <article className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-950/10 dark:border-white/10 dark:bg-white/[0.04]">
                <UsersRound className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                <h3 className="mt-4 font-semibold text-slate-950 dark:text-white">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      <Section>
        <Reveal>
          <SectionIntro eyebrow="Pricing" title="Start small, scale into automated marketing sync." />
        </Reveal>
        <Stagger className="grid gap-4 lg:grid-cols-3">
          <StaggerItem>
            <PricingCard description="For one mailbox and clean file exports." features={["1 mailbox", "1 marketing integration", "Excel/CSV export", "Basic duplicate cleanup"]} name="Starter" price="$19/mo" />
          </StaggerItem>
          <StaggerItem>
            <PricingCard description="For teams syncing multiple accounts." featured features={["Multiple mailboxes", "Multiple Kit/Mailchimp/Brevo accounts", "Folder-to-tag mapping", "Scheduled exports"]} name="Professional" price="$49/mo" />
          </StaggerItem>
          <StaggerItem>
            <PricingCard description="For agencies and larger teams." features={["Unlimited mailboxes", "Automation rules", "Advanced analytics", "Priority support"]} name="Agency" price="$129/mo" />
          </StaggerItem>
        </Stagger>
        <Reveal delay={0.15}>
          <div className="mt-8 text-center">
            <Button asChild variant="outline">
              <Link href={"/pricing" as any}>
                View all plans
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Reveal>
      </Section>

      <Section>
        <Reveal>
          <SectionIntro eyebrow="FAQ" title="Questions before turning inboxes into contact lists?" />
        </Reveal>
        <Reveal delay={0.12}>
          <FAQ />
        </Reveal>
      </Section>

      <CTASection />
    </main>
  );
}

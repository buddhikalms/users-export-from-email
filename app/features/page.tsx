import type { Metadata } from "next";
import {
  BarChart3,
  Clock,
  FileSpreadsheet,
  FolderTree,
  History,
  KeyRound,
  MailCheck,
  Repeat,
  ShieldCheck,
  Sparkles,
  Tags,
} from "lucide-react";

import { CTASection } from "@/components/marketing/CTASection";
import { FeatureCard } from "@/components/marketing/FeatureCard";
import { Section, SectionIntro } from "@/components/marketing/Section";

export const metadata: Metadata = {
  title: "Features - ChatUp",
  description:
    "Explore Outlook sync, folder-wise extraction, duplicate cleanup, Excel exports, marketing sync, analytics, and secure credential vault features.",
};

const features = [
  ["Outlook/IMAP Sync", "Connect Outlook and compatible IMAP mailboxes with secure server-side sync.", MailCheck],
  ["Folder-wise contact extraction", "Keep contacts organized by source folder for tags, segments, and exports.", FolderTree],
  ["Forwarded email chain detection", "Find original senders hidden in forwarded conversations.", Repeat],
  ["Duplicate cleanup", "Merge repeated emails and reduce noisy contact lists.", Sparkles],
  ["mailto cleanup", "Strip mailto formatting and normalize contact addresses.", Tags],
  ["Excel/CSV export", "Download polished files for analysis, CRM imports, and client delivery.", FileSpreadsheet],
  ["Marketing platform sync", "Send contacts to Kit, Zoho Campaigns, and Brevo.", Clock],
  ["Multi-account integrations", "Manage multiple platform accounts for teams and clients.", KeyRound],
  ["Sync history", "Track exports, sync runs, statuses, and failures.", History],
  ["Analytics dashboard", "Monitor contact growth, top domains, and folder activity.", BarChart3],
  ["Secure credential vault", "Protect mailbox and API credentials with encrypted vault workflows.", ShieldCheck],
] as const;

export default function FeaturesPage() {
  return (
    <main>
      <Section>
        <SectionIntro
          eyebrow="Features"
          title="A complete workflow for inbox-to-platform contact operations."
          description="ChatUp handles extraction, cleaning, export, sync, security, history, and analytics in one focused workspace."
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map(([title, description, Icon]) => (
            <FeatureCard key={title} description={description} icon={Icon} title={title} />
          ))}
        </div>
      </Section>
      <CTASection />
    </main>
  );
}

import type { Metadata } from "next";

import { CTASection } from "@/components/marketing/CTASection";
import { IntegrationCard } from "@/components/marketing/IntegrationCard";
import { Section, SectionIntro } from "@/components/marketing/Section";

export const metadata: Metadata = {
  title: "Integrations - OMAZYNC",
  description:
    "Sync Outlook and IMAP contacts to Kit, Zoho Campaigns, and Brevo.",
};

const integrations = [
  ["Kit", "Sync cleaned contacts to forms and tags for creator and newsletter workflows.", "Available"],
  ["Zoho Campaigns", "Sync cleaned contacts into Zoho mailing lists and campaign segments.", "Available"],
  ["Brevo", "Route extracted leads into Brevo lists and marketing campaigns.", "Available"],
  ["Mailchimp", "Update audiences and segments with folder-based contact context.", "Coming Soon"],
  ["HubSpot", "Send qualified contacts into CRM and marketing pipelines.", "Coming Soon"],
  ["Beehiiv", "Build publisher lists from inbox conversations and submissions.", "Coming Soon"],
  ["ActiveCampaign", "Prepare contacts for lists, tags, and automations.", "Coming Soon"],
  ["MailerLite", "Export contacts into groups and lightweight newsletter workflows.", "Coming Soon"],
  ["Constant Contact", "Move cleaned contacts into email campaign lists.", "Coming Soon"],
  ["SendGrid Marketing", "Sync contact batches to SendGrid Marketing lists.", "Coming Soon"],
  ["Campaign Monitor", "Prepare subscriber exports for Campaign Monitor lists.", "Coming Soon"],
  ["Outlook", "Extract contacts from Outlook folders through secure IMAP access.", "Available"],
  ["IMAP", "Connect any compatible IMAP mailbox and select folders to scan.", "Available"],
] as const;

export default function IntegrationsPage() {
  return (
    <main>
      <Section>
        <SectionIntro
          eyebrow="Integrations"
          title="Connect your inbox to the marketing platforms that run your growth."
          description="OMAZYNC supports direct syncs, queue-ready workflows, and clean exports for teams using multiple accounts and client destinations."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {integrations.map(([name, description, status]) => (
            <IntegrationCard key={name} description={description} name={name} status={status} />
          ))}
        </div>
      </Section>
      <CTASection />
    </main>
  );
}

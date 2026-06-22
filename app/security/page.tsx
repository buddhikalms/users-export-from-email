import type { Metadata } from "next";
import { KeyRound, LockKeyhole, Server, ShieldCheck } from "lucide-react";

import { CTASection } from "@/components/marketing/CTASection";
import { FeatureCard } from "@/components/marketing/FeatureCard";
import { Section, SectionIntro } from "@/components/marketing/Section";

export const metadata: Metadata = {
  title: "Security - ChatUp",
  description:
    "Learn how ChatUp protects API keys, IMAP passwords, and sync workflows with encrypted credential vault architecture.",
};

const items = [
  ["Client-side encrypted credential vault", "Keep sensitive credentials protected behind a master-password workflow.", LockKeyhole],
  ["AES-GCM encryption", "Use modern authenticated encryption patterns for protected vault data.", ShieldCheck],
  ["No plain-text API keys", "Avoid storing marketing platform credentials in plain text.", KeyRound],
  ["Secure server-side sync", "Run mailbox extraction and marketing sync in controlled server-side workflows.", Server],
] as const;

export default function SecurityPage() {
  return (
    <main>
      <Section>
        <SectionIntro
          eyebrow="Security"
          title="Privacy-first architecture for mailbox and platform credentials."
          description="ChatUp is designed for teams that need useful contact extraction without casual handling of IMAP passwords or marketing API keys."
        />
        <div className="grid gap-4 md:grid-cols-2">
          {items.map(([title, description, Icon]) => (
            <FeatureCard key={title} description={description} icon={Icon} title={title} />
          ))}
        </div>
      </Section>
      <Section className="pt-0">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 dark:border-white/10 dark:bg-white/[0.04]">
          <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">Security principles</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              "Master password protection for vault workflows.",
              "No plain-text IMAP passwords in normal credential handling.",
              "No plain-text marketing platform API keys in normal credential handling.",
              "HTTPS-ready architecture for production deployment.",
              "Privacy-first design for contact discovery and export workflows.",
              "Auditable sync and export history for operational visibility.",
            ].map((item) => (
              <p key={item} className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                {item}
              </p>
            ))}
          </div>
        </div>
      </Section>
      <CTASection />
    </main>
  );
}

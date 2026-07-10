import type { Metadata } from "next";

import { Section, SectionIntro } from "@/components/marketing/Section";

export const metadata: Metadata = {
  title: "Terms of Service - OMAZYNC",
  description: "Professional placeholder terms of service for OMAZYNC.",
};

export default function TermsPage() {
  return (
    <main>
      <Section>
        <SectionIntro align="left" eyebrow="Legal" title="Terms of Service" description="Professional placeholder content for OMAZYNC product terms." />
        <div className="prose prose-slate max-w-none rounded-2xl border border-slate-200 bg-white p-8 dark:prose-invert dark:border-white/10 dark:bg-white/[0.04]">
          <h2>Use of service</h2>
          <p>OMAZYNC is provided to help users extract, clean, export, and sync contact data from mailboxes and connected platforms they are authorized to access.</p>
          <h2>Account responsibility</h2>
          <p>Users are responsible for maintaining access to their mailboxes, API keys, team accounts, and marketing platform permissions.</p>
          <h2>Acceptable use</h2>
          <p>Users must comply with applicable privacy, anti-spam, and marketing consent laws when exporting or syncing contacts.</p>
          <h2>Support</h2>
          <p>For terms questions, contact support@chatup.example.</p>
        </div>
      </Section>
    </main>
  );
}

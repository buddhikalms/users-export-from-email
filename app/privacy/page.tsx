import type { Metadata } from "next";

import { Section, SectionIntro } from "@/components/marketing/Section";

export const metadata: Metadata = {
<<<<<<< HEAD
  title: "Privacy Policy - OMAZYNC",
  description: "Professional placeholder privacy policy for OMAZYNC.",
=======
  title: "Privacy Policy - Omazync",
  description: "Professional placeholder privacy policy for Omazync.",
>>>>>>> 5d8ace5 (security: fix vulnerbilities, load testing)
};

export default function PrivacyPage() {
  return (
    <main>
      <Section>
<<<<<<< HEAD
        <SectionIntro align="left" eyebrow="Legal" title="Privacy Policy" description="Professional placeholder content for OMAZYNC privacy practices." />
        <div className="prose prose-slate max-w-none rounded-2xl border border-slate-200 bg-white p-8 dark:prose-invert dark:border-white/10 dark:bg-white/[0.04]">
          <h2>Information we process</h2>
          <p>OMAZYNC may process account information, mailbox connection details, extracted contact data, export history, and integration configuration needed to provide the product.</p>
=======
        <SectionIntro align="left" eyebrow="Legal" title="Privacy Policy" description="Professional placeholder content for Omazync privacy practices." />
        <div className="prose prose-slate max-w-none rounded-2xl border border-slate-200 bg-white p-8 dark:prose-invert dark:border-white/10 dark:bg-white/[0.04]">
          <h2>Information we process</h2>
          <p>Omazync may process account information, mailbox connection details, extracted contact data, export history, and integration configuration needed to provide the product.</p>
>>>>>>> 5d8ace5 (security: fix vulnerbilities, load testing)
          <h2>How data is used</h2>
          <p>Data is used to connect mailboxes, extract contacts, clean duplicates, generate exports, sync marketing platforms, secure credentials, and provide support.</p>
          <h2>Security</h2>
          <p>The product is designed around encrypted credential workflows, no plain-text API key handling in normal operation, and privacy-first contact workflows.</p>
          <h2>Contact</h2>
          <p>For privacy requests, contact support@omazync.example.</p>
        </div>
      </Section>
    </main>
  );
}

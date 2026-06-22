import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Section, SectionIntro } from "@/components/marketing/Section";

export const metadata: Metadata = {
  title: "Blog - ChatUp",
  description: "Guides for exporting Outlook contacts, cleaning duplicates, and syncing email leads to marketing tools.",
};

const posts = [
  "How to Export Contacts from Outlook Folders",
  "How to Clean Duplicate Email Contacts",
  "How to Sync Outlook Contacts to Kit",
  "Best Email Lead Extraction Workflows for Agencies",
  "Why Your Inbox Is a Hidden Lead Database",
];

export default function BlogPage() {
  return (
    <main>
      <Section>
        <SectionIntro
          eyebrow="Blog"
          title="Practical guides for inbox contact operations."
          description="Learn how to extract, clean, export, and sync email contacts without turning every mailbox into a spreadsheet chore."
        />
        <div className="grid gap-4 md:grid-cols-2">
          {posts.map((title, index) => (
            <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.04]">
              <p className="text-sm font-medium text-blue-600 dark:text-blue-300">Guide {index + 1}</p>
              <h2 className="mt-3 text-xl font-semibold text-slate-950 dark:text-white">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                A practical workflow for turning inbox history into clean, useful contact data.
              </p>
              <Link className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-300" href={"/contact" as any}>
                Request this guide
                <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>
      </Section>
    </main>
  );
}

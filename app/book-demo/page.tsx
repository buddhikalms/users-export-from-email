import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarClock, Mail, MessageSquare, ShieldCheck } from "lucide-react";

import { BookingEmbed } from "@/components/marketing/BookingEmbed";
import { Section, SectionIntro } from "@/components/marketing/Section";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Book a Demo - OMAZYNC",
  description: "Book an OMAZYNC demo for inbox contact extraction, exports, and marketing sync.",
};

export default function BookDemoPage() {
  return (
    <main>
      <Section>
        <SectionIntro
          eyebrow="Book a demo"
          title="Plan your inbox-to-contact workflow with OMAZYNC."
          description="Choose a time for a product walkthrough, onboarding discussion, or custom workflow review."
        />

        <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-start">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-950/5 dark:border-white/10 dark:bg-white/[0.04] sm:p-8">
            <CalendarClock className="h-8 w-8 text-[#00b6ae]" />
            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
              Schedule your OMAZYNC walkthrough.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
              Meet with us to review your inbox workflow, secure mailbox setup, contact exports, and marketing sync requirements.
            </p>
            <div className="mt-7">
              <BookingEmbed />
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
                <p className="text-sm font-semibold text-slate-950 dark:text-white">30 minutes</p>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">Enough time to scope your workflow and next steps.</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
                <p className="text-sm font-semibold text-slate-950 dark:text-white">Live demo</p>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">See mailbox extraction, cleanup, and export paths.</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
                <p className="text-sm font-semibold text-slate-950 dark:text-white">Setup guidance</p>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">Discuss safe Gmail, Outlook, IMAP, and API access.</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <article className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.04]">
              <Mail className="h-5 w-5 text-[#00b6ae]" />
              <h2 className="mt-4 font-semibold text-slate-950 dark:text-white">Email support</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Send requirements, account questions, or onboarding notes to{" "}
                <a className="font-semibold text-brand-blue dark:text-brand-light-purple" href="mailto:support@omazync.com">
                  support@omazync.com
                </a>
                .
              </p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.04]">
              <MessageSquare className="h-5 w-5 text-[#00b6ae]" />
              <h2 className="mt-4 font-semibold text-slate-950 dark:text-white">Contact form</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Prefer to write first? Use the contact form and we will route your message to the right person.
              </p>
              <Button asChild className="mt-5" variant="outline">
                <Link href="/contact">
                  Open contact form <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.04]">
              <ShieldCheck className="h-5 w-5 text-[#00b6ae]" />
              <h2 className="mt-4 font-semibold text-slate-950 dark:text-white">What to bring</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Bring the mailbox types, export goals, integrations, and security questions you want covered.
              </p>
            </article>
          </div>
        </div>
      </Section>
    </main>
  );
}

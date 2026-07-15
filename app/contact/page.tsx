import type { Metadata } from "next";
import Link from "next/link";
import { CalendarClock, Mail, MessageSquare } from "lucide-react";

import { ContactForm } from "@/components/marketing/ContactForm";
import { Section, SectionIntro } from "@/components/marketing/Section";

export const metadata: Metadata = {
  title: "Contact - OMAZYNC",
  description: "Contact OMAZYNC support or book a demo for inbox contact extraction and marketing sync.",
};

export default function ContactPage() {
  return (
    <main>
      <Section>
        <SectionIntro
          eyebrow="Contact"
          title="Talk to us about your inbox contact workflow."
          description="Send a message, request support, or book a demo for Outlook extraction, secure vault setup, and marketing platform sync."
        />
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <ContactForm />
          <div className="grid gap-4">
            {[
              [Mail, "Email", "support@omazync.com"],
              [MessageSquare, "Support", "Get help with mailbox connection, exports, and integrations."],
              [CalendarClock, "Demo booking", "Book a walkthrough for agency, publisher, or team workflows."],
            ].map(([Icon, title, body]) => (
              <article key={title as string} className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.04]">
                <Icon className="h-5 w-5 text-brand-blue dark:text-brand-light-purple" />
                <h2 className="mt-4 font-semibold text-slate-950 dark:text-white">{title as string}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {title === "Demo booking" ? (
                    <Link className="font-semibold text-brand-blue dark:text-brand-light-purple" href="/book-demo">
                      Book a walkthrough for agency, publisher, or team workflows.
                    </Link>
                  ) : (
                    body as string
                  )}
                </p>
              </article>
            ))}
          </div>
        </div>
      </Section>
    </main>
  );
}

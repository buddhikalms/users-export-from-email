import type { Metadata } from "next";
import { CalendarClock, Mail, MessageSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Section, SectionIntro } from "@/components/marketing/Section";

export const metadata: Metadata = {
  title: "Contact - ChatUp",
  description: "Contact ChatUp support or book a demo for inbox contact extraction and marketing sync.",
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
          <form className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.04]">
            <Input placeholder="Name" aria-label="Name" />
            <Input placeholder="Work email" aria-label="Work email" type="email" />
            <Input placeholder="Company" aria-label="Company" />
            <textarea className="min-h-36 rounded-2xl border border-input bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:bg-card" placeholder="Tell us what you want to export or sync" aria-label="Message" />
            <Button type="button">Send Message</Button>
          </form>
          <div className="grid gap-4">
            {[
              [Mail, "Email", "support@chatup.example"],
              [MessageSquare, "Support", "Get help with mailbox connection, exports, and integrations."],
              [CalendarClock, "Demo booking", "Book a walkthrough for agency, publisher, or team workflows."],
            ].map(([Icon, title, body]) => (
              <article key={title as string} className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.04]">
                <Icon className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                <h2 className="mt-4 font-semibold text-slate-950 dark:text-white">{title as string}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{body as string}</p>
              </article>
            ))}
          </div>
        </div>
      </Section>
    </main>
  );
}

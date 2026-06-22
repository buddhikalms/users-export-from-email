import type { Metadata } from "next";

import { CTASection } from "@/components/marketing/CTASection";
import { Section, SectionIntro } from "@/components/marketing/Section";

export const metadata: Metadata = {
  title: "About - ChatUp",
  description: "Learn about ChatUp's mission to unlock valuable contacts hidden in business inboxes.",
};

export default function AboutPage() {
  return (
    <main>
      <Section>
        <SectionIntro
          align="left"
          eyebrow="About"
          title="ChatUp helps businesses unlock valuable contacts hidden in their inboxes."
          description="Our mission is simple: make contact discovery, clean exports, marketing sync, and privacy-first workflows accessible to the teams that already work inside email every day."
        />
        <div className="grid gap-6 lg:grid-cols-3">
          {[
            ["Contact discovery", "Outlook and IMAP folders often contain years of valuable conversations. ChatUp turns that history into usable contact data."],
            ["Clean exports", "Duplicates, mailto formatting, and forwarded-chain noise are cleaned before contacts reach Excel, CSV, or your marketing tools."],
            ["Product story", "Founder/product story placeholder: built for operators who needed a safer, faster way to transform inbox activity into organized growth workflows."],
          ].map(([title, body]) => (
            <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.04]">
              <h2 className="text-xl font-semibold text-slate-950 dark:text-white">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{body}</p>
            </article>
          ))}
        </div>
      </Section>
      <CTASection />
    </main>
  );
}

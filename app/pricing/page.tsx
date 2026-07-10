import type { Metadata } from "next";

import { CTASection } from "@/components/marketing/CTASection";
import { PricingPlans } from "@/components/marketing/PricingPlans";
import { Section, SectionIntro } from "@/components/marketing/Section";

export const metadata: Metadata = {
  title: "Pricing - OMAZYNC",
  description:
    "Compare Starter, Professional, Agency, and Enterprise plans for OMAZYNC.",
};

export default function PricingPage() {
  return (
    <main>
      <Section>
        <SectionIntro
          eyebrow="Pricing"
          title="Plans for inbox-led growth teams."
          description="Start with exports, then scale into multi-account marketing sync and automation rules."
        />
        <PricingPlans />
      </Section>
      <CTASection />
    </main>
  );
}

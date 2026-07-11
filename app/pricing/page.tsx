import type { Metadata } from "next";

import { CTASection } from "@/components/marketing/CTASection";
import { PricingPlans } from "@/components/marketing/PricingPlans";
import { PricingDetails } from "@/components/marketing/PricingDetails";
import { Section, SectionIntro } from "@/components/marketing/Section";
import { getPricingCatalog } from "@/lib/pricing-catalog";

export const metadata: Metadata = {
  title: "Pricing - OMAZYNC",
  description:
    "Compare Starter, Professional, Agency, and Enterprise plans for OMAZYNC.",
};

export default async function PricingPage() {
  const { plans, addOns } = await getPricingCatalog();

  return (
    <main className="overflow-hidden bg-white dark:bg-slate-950">
      <Section className="relative pt-20 lg:pt-28">
        <div className="pointer-events-none absolute left-1/2 top-0 -z-0 h-96 w-[46rem] -translate-x-1/2 rounded-full bg-brand-blue/10 blur-3xl" />
        <div className="relative">
        <SectionIntro
          eyebrow="Email Exporter pricing plans & add-ons"
          title="Affordable pricing that scales with your inbox workflow."
          description="Built for freelancers, agencies, marketers, publishers, recruiters, and growing businesses. Start free, upgrade as you grow, and pay only for what you need."
        />
        <PricingPlans catalogAddOns={addOns} catalogPlans={plans} />
        </div>
      </Section>
      <Section className="pt-4 lg:pt-8">
        <PricingDetails addOns={addOns} />
      </Section>
      <CTASection />
    </main>
  );
}

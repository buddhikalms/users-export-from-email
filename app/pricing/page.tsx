import type { Metadata } from "next";

import { CTASection } from "@/components/marketing/CTASection";
import { PricingPlans } from "@/components/marketing/PricingPlans";
import { PricingDetails } from "@/components/marketing/PricingDetails";
import { Section, SectionIntro } from "@/components/marketing/Section";

export const metadata: Metadata = {
<<<<<<< HEAD
  title: "Pricing - OMAZYNC",
  description:
    "Compare Starter, Professional, Agency, and Enterprise plans for OMAZYNC.",
=======
  title: "Pricing - Omazync",
  description:
    "Compare Free, Starter, Professional, Business, and Enterprise Email Exporter plans and add-ons from Omazync.",
>>>>>>> 5d8ace5 (security: fix vulnerbilities, load testing)
};

export default function PricingPage() {
  return (
    <main className="overflow-hidden bg-white dark:bg-slate-950">
      <Section className="relative pt-20 lg:pt-28">
        <div className="pointer-events-none absolute left-1/2 top-0 -z-0 h-96 w-[46rem] -translate-x-1/2 rounded-full bg-blue-400/10 blur-3xl" />
        <div className="relative">
        <SectionIntro
          eyebrow="Email Exporter pricing plans & add-ons"
          title="Affordable pricing that scales with your inbox workflow."
          description="Built for freelancers, agencies, marketers, publishers, recruiters, and growing businesses. Start free, upgrade as you grow, and pay only for what you need."
        />
        <PricingPlans />
        </div>
      </Section>
      <Section className="pt-4 lg:pt-8">
        <PricingDetails />
      </Section>
      <CTASection />
    </main>
  );
}

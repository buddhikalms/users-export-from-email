"use client";

import { useState } from "react";

import { PricingCard } from "@/components/marketing/PricingCard";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Starter",
    monthly: "$19/mo",
    yearly: "$190/yr",
    description: "For solo operators starting with clean exports.",
    features: ["1 mailbox", "1 marketing integration", "Excel/CSV export", "Basic duplicate cleanup", "Basic analytics"],
  },
  {
    name: "Professional",
    monthly: "$49/mo",
    yearly: "$490/yr",
    description: "For growing teams with multiple accounts.",
    featured: true,
    features: ["Multiple mailboxes", "Multiple Kit/Zoho/Brevo accounts", "Folder-to-tag mapping", "Sync history", "Advanced duplicate cleanup", "Scheduled exports"],
  },
  {
    name: "Agency",
    monthly: "$129/mo",
    yearly: "$1,290/yr",
    description: "For client workflows and automated operations.",
    features: ["Unlimited mailboxes", "Team-ready architecture", "Advanced analytics", "Priority support", "Multiple client accounts", "Automation rules"],
  },
  {
    name: "Enterprise",
    monthly: "Custom",
    yearly: "Custom",
    description: "For custom limits, deployment, and security needs.",
    features: ["Custom limits", "Dedicated support", "Self-hosting option", "Advanced security", "Custom integrations"],
  },
] as const;

export function PricingPlans() {
  const [yearly, setYearly] = useState(false);

  return (
    <>
      <div className="mx-auto mb-8 flex w-fit rounded-full border border-slate-200 bg-white p-1 dark:border-white/10 dark:bg-white/[0.04]">
        {[
          ["Monthly", false],
          ["Yearly", true],
        ].map(([label, value]) => (
          <button
            key={label as string}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition",
              yearly === value
                ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                : "text-slate-600 dark:text-slate-300",
            )}
            onClick={() => setYearly(Boolean(value))}
          >
            {label as string}
          </button>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-4">
        {plans.map((plan) => (
          <PricingCard
            key={plan.name}
            description={plan.description}
            featured={"featured" in plan ? plan.featured : false}
            features={[...plan.features]}
            name={plan.name}
            price={yearly ? plan.yearly : plan.monthly}
          />
        ))}
      </div>
    </>
  );
}

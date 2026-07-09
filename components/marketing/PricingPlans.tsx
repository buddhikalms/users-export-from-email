"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Check,
  ChevronRight,
  Clock3,
  Gift,
  Headphones,
  Infinity as InfinityIcon,
  Layers3,
  Mail,
  Rocket,
  ShieldCheck,
  Sparkles,
  UsersRound,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { PayPalCheckout } from "@/components/marketing/PayPalCheckout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PlanSlug = "free" | "starter" | "professional" | "business" | "enterprise";
type FeatureGroup = "Capacity" | "Workflow" | "Support";

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
  group: FeatureGroup;
};

type Plan = {
  slug: PlanSlug;
  name: string;
  audience: string;
  monthly: number | null;
  summary: string;
  idealFor: string;
  featured?: boolean;
  icon: LucideIcon;
  quickFeatures: string[];
  exclusions: string[];
  features: Feature[];
};

type AddOn = {
  id: string;
  name: string;
  price: number;
  description: string;
};

const addOns: AddOn[] = [
  {
    id: "none",
    name: "No add-on",
    price: 0,
    description: "Use the package exactly as included.",
  },
  {
    id: "extra-email",
    name: "Additional email account",
    price: 2,
    description: "Add one more mailbox to the selected package.",
  },
  {
    id: "extra-volume",
    name: "Extra 100,000 emails scanned",
    price: 5,
    description: "Increase monthly scan capacity for heavier inboxes.",
  },
  {
    id: "scheduled-sync",
    name: "Scheduled automatic sync",
    price: 4,
    description: "Run selected folder syncs automatically.",
  },
  {
    id: "google-sheets",
    name: "Google Sheets sync",
    price: 3,
    description: "Send exports directly into a Google Sheet.",
  },
  {
    id: "hubspot",
    name: "HubSpot integration",
    price: 5,
    description: "Sync cleaned contacts into HubSpot.",
  },
  {
    id: "api-webhooks",
    name: "API access + webhooks",
    price: 8,
    description: "Connect Omazync to custom workflows.",
  },
];

const plans: Plan[] = [
  {
    slug: "free",
    name: "Free",
    audience: "For trying the platform",
    monthly: 0,
    summary: "Perfect for trying Email Exporter before upgrading.",
    idealFor: "Personal use, freelancers, and testing the platform.",
    icon: Gift,
    quickFeatures: ["1 email account", "1,000 emails per month", "Excel & CSV export"],
    exclusions: ["Unlimited folders", "Advanced filtering", "Export history", "Marketing integrations", "Priority support"],
    features: [
      { icon: Mail, title: "1 email account", description: "Connect one Outlook or IMAP email account.", group: "Capacity" },
      { icon: Clock3, title: "1,000 emails per month", description: "Scan up to 1,000 messages every month.", group: "Capacity" },
      { icon: Layers3, title: "1 email folder", description: "Choose one folder for contact discovery.", group: "Capacity" },
      { icon: Sparkles, title: "Smart contact discovery", description: "Find useful contacts hidden inside conversations.", group: "Workflow" },
      { icon: ShieldCheck, title: "Duplicate removal", description: "Remove repeated contact records automatically.", group: "Workflow" },
      { icon: Workflow, title: "Excel and CSV export", description: "Download contacts in either spreadsheet format.", group: "Workflow" },
      { icon: Headphones, title: "Community support", description: "Get help through community support resources.", group: "Support" },
    ],
  },
  {
    slug: "starter",
    name: "Starter",
    audience: "For individuals and small businesses",
    monthly: 3.99,
    summary: "A focused toolkit for regular contact discovery and export.",
    idealFor: "Freelancers, consultants, and small businesses.",
    icon: Rocket,
    quickFeatures: ["10,000 emails per month", "Unlimited folders", "Unlimited exports"],
    exclusions: ["Multiple email accounts", "Included marketing integrations", "Scheduled sync", "API access", "Team collaboration"],
    features: [
      { icon: Mail, title: "1 email account", description: "Everything in Free with higher working limits.", group: "Capacity" },
      { icon: Clock3, title: "10,000 emails per month", description: "Scan up to 10,000 messages every month.", group: "Capacity" },
      { icon: Layers3, title: "Unlimited folder selection", description: "Scan every folder that matters in the connected account.", group: "Capacity" },
      { icon: InfinityIcon, title: "Unlimited contact exports", description: "Export contacts as often as your workflow requires.", group: "Workflow" },
      { icon: Sparkles, title: "Advanced contact filtering", description: "Narrow exports using more precise contact filters.", group: "Workflow" },
      { icon: ShieldCheck, title: "30-day export history", description: "Review exports completed during the previous 30 days.", group: "Workflow" },
      { icon: Headphones, title: "Priority email support", description: "Receive faster help through priority email support.", group: "Support" },
    ],
  },
  {
    slug: "professional",
    name: "Professional",
    audience: "For marketers, agencies, and publishers",
    monthly: 5.99,
    summary: "Connect multiple inboxes directly to your marketing stack.",
    idealFor: "Marketing agencies, PR teams, recruiters, and publishers.",
    featured: true,
    icon: UsersRound,
    quickFeatures: ["5 email accounts", "100,000 emails per month", "Kit, Mailchimp & Brevo"],
    exclusions: ["Unlimited email accounts", "Scheduled sync", "API access", "Webhooks", "Team collaboration"],
    features: [
      { icon: Mail, title: "Up to 5 email accounts", description: "Connect inboxes across a campaign, brand, or client workflow.", group: "Capacity" },
      { icon: Clock3, title: "100,000 emails per month", description: "Scan up to 100,000 messages each month.", group: "Capacity" },
      { icon: Layers3, title: "Unlimited folder synchronization", description: "Keep selected folders synchronized without a folder cap.", group: "Capacity" },
      { icon: Workflow, title: "Kit, Mailchimp, and Brevo", description: "Sync contacts directly to three leading marketing platforms.", group: "Workflow" },
      { icon: Sparkles, title: "Advanced contact search", description: "Find the right people quickly across discovered contacts.", group: "Workflow" },
      { icon: ShieldCheck, title: "Complete export history", description: "Maintain an accessible record of previous exports.", group: "Workflow" },
      { icon: Building2, title: "Folder analytics", description: "Understand contact activity and volume by folder.", group: "Workflow" },
      { icon: Headphones, title: "Priority support", description: "Get priority assistance when your workflow needs attention.", group: "Support" },
    ],
  },
  {
    slug: "business",
    name: "Business",
    audience: "For growing and collaborative teams",
    monthly: 9.99,
    summary: "Run automated contact operations across teams and clients.",
    idealFor: "Agencies, sales teams, and organizations managing multiple clients.",
    icon: Building2,
    quickFeatures: ["Unlimited accounts and scanning", "5 team members", "API & webhooks"],
    exclusions: ["Unlimited team members", "Dedicated infrastructure", "White-label solution", "Dedicated account manager"],
    features: [
      { icon: InfinityIcon, title: "Unlimited email accounts", description: "Connect every inbox your business or clients require.", group: "Capacity" },
      { icon: Clock3, title: "Unlimited email scanning", description: "Remove monthly message-scanning limits.", group: "Capacity" },
      { icon: InfinityIcon, title: "Unlimited contact exports", description: "Export without usage caps.", group: "Capacity" },
      { icon: UsersRound, title: "Up to 5 team members", description: "Collaborate with a small operational team.", group: "Capacity" },
      { icon: Building2, title: "Shared workspace", description: "Keep shared contact operations in one coordinated workspace.", group: "Workflow" },
      { icon: Layers3, title: "Multiple marketing accounts", description: "Connect multiple destinations for brands or clients.", group: "Workflow" },
      { icon: Clock3, title: "Scheduled synchronization", description: "Run recurring syncs without manual starts.", group: "Workflow" },
      { icon: Workflow, title: "API access and webhooks", description: "Connect Omazync to custom and event-driven workflows.", group: "Workflow" },
      { icon: ShieldCheck, title: "Activity logs", description: "Track important workspace and synchronization activity.", group: "Support" },
      { icon: Headphones, title: "Premium support", description: "Receive premium assistance for critical workflows.", group: "Support" },
    ],
  },
  {
    slug: "enterprise",
    name: "Enterprise",
    audience: "For advanced requirements",
    monthly: null,
    summary: "Built for large organizations with advanced requirements.",
    idealFor: "Large organizations requiring a tailored, governed deployment.",
    icon: ShieldCheck,
    quickFeatures: ["Unlimited everything", "Dedicated infrastructure", "White-label solution"],
    exclusions: [],
    features: [
      { icon: InfinityIcon, title: "Unlimited everything", description: "Remove account, scanning, export, and team-member limits.", group: "Capacity" },
      { icon: UsersRound, title: "Unlimited team members", description: "Support the full organization without seat caps.", group: "Capacity" },
      { icon: Building2, title: "Dedicated infrastructure", description: "Run on infrastructure designed around your requirements.", group: "Capacity" },
      { icon: Sparkles, title: "White-label solution", description: "Present the platform under your own brand.", group: "Workflow" },
      { icon: Layers3, title: "Custom integrations", description: "Connect specialized internal and external systems.", group: "Workflow" },
      { icon: Workflow, title: "Priority API limits", description: "Receive API capacity aligned with enterprise workloads.", group: "Workflow" },
      { icon: Headphones, title: "Dedicated account manager", description: "Work with a consistent contact who understands your rollout.", group: "Support" },
      { icon: ShieldCheck, title: "SLA and priority support", description: "Establish service expectations and priority assistance.", group: "Support" },
      { icon: UsersRound, title: "Custom onboarding and training", description: "Prepare teams with guided onboarding and tailored training.", group: "Support" },
    ],
  },
];

const groups: FeatureGroup[] = ["Capacity", "Workflow", "Support"];

export function PricingPlans() {
  const [selectedPlan, setSelectedPlan] = useState(2);
  const [selectedAddOnId, setSelectedAddOnId] = useState("none");
  const reduceMotion = useReducedMotion();
  const selected = plans[selectedPlan];
  const selectedAddOn = addOns.find((addOn) => addOn.id === selectedAddOnId) ?? addOns[0];
  const canConfigureAddOns = selected.slug !== "free" && selected.slug !== "enterprise";
  const configuredMonthly =
    selected.monthly === null ? null : selected.monthly + selectedAddOn.price;

  return (
    <div>
      <div className="mb-10 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="max-w-md text-center text-sm leading-6 text-slate-500 dark:text-slate-400 sm:text-left">
          Choose a plan to explore exactly what is included and excluded.
        </p>
        <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
          Monthly pricing · Cancel anytime
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {plans.map((plan, index) => {
          const active = selectedPlan === index;
          const Icon = plan.icon;

          return (
            <motion.button
              layout
              type="button"
              key={plan.name}
              aria-pressed={active}
              onClick={() => setSelectedPlan(index)}
              whileHover={reduceMotion ? undefined : { y: -4 }}
              whileTap={reduceMotion ? undefined : { scale: 0.99 }}
              className={cn(
                "group relative flex min-h-[350px] flex-col overflow-hidden rounded-3xl border p-5 text-left transition-[border-color,box-shadow,background-color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950",
                active
                  ? "border-brand-blue bg-white shadow-[0_20px_60px_-28px_rgba(4,130,230,0.55)] dark:bg-brand-blue/[0.08]"
                  : "border-slate-200 bg-white/70 hover:border-brand-light-purple hover:bg-white dark:border-white/10 dark:bg-white/[0.025] dark:hover:border-brand-blue/40",
              )}
            >
              {plan.featured ? (
                <span className="absolute right-4 top-4 rounded-full bg-violet-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-violet-700 dark:bg-violet-400/15 dark:text-violet-300">
                  Most popular
                </span>
              ) : null}
              <span className={cn("flex h-11 w-11 items-center justify-center rounded-2xl transition-colors", active ? "bg-brand-blue text-white" : "bg-slate-100 text-slate-600 group-hover:bg-brand-blue/10 group-hover:text-brand-blue dark:bg-white/10 dark:text-slate-300")}>
                <Icon className="h-5 w-5" />
              </span>
              <span className="mt-5 text-lg font-bold text-slate-950 dark:text-white">{plan.name}</span>
              <span className="mt-1 min-h-8 text-xs font-medium leading-4 text-slate-500 dark:text-slate-400">{plan.audience}</span>
              <span className="mt-5 flex items-end gap-1 text-slate-950 dark:text-white">
                <span className="text-4xl font-bold tracking-tight">
                  {plan.monthly === null
                    ? "Custom"
                    : `$${plan.monthly.toFixed(plan.monthly % 1 === 0 ? 0 : 2)}`}
                </span>
                {plan.monthly !== null && plan.monthly > 0 ? <span className="mb-1 text-sm text-slate-500">/mo</span> : null}
              </span>
              <span className="mt-1 min-h-5 text-xs text-slate-400">
                {plan.slug === "free" ? "Free forever" : plan.monthly === null ? "Contact us for a quote" : "Billed monthly"}
              </span>
              <span className="mt-5 text-sm leading-6 text-slate-600 dark:text-slate-300">{plan.summary}</span>
              <span className="mt-auto flex items-center gap-1 pt-5 text-sm font-semibold text-brand-blue dark:text-brand-light-purple">
                {active ? "Selected — see details below" : "Explore this plan"}
                <ChevronRight className={cn("h-4 w-4 transition-transform", active && "rotate-90")} />
              </span>
              {active ? <motion.span layoutId="selected-plan-line" className="absolute inset-x-6 bottom-0 h-1 rounded-t-full bg-brand-blue" /> : null}
            </motion.button>
          );
        })}
      </div>

      <div className="relative mt-8 scroll-mt-24" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.article
            key={selected.name}
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 text-white shadow-2xl shadow-slate-950/10 dark:border-white/10"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(59,130,246,0.3),transparent_34%),radial-gradient(circle_at_90%_90%,rgba(16,185,129,0.14),transparent_32%)]" />
            <div className="relative grid lg:grid-cols-[0.7fr_1.3fr]">
              <div className="border-b border-white/10 p-6 sm:p-8 lg:border-b-0 lg:border-r">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-light-purple">Inside {selected.name}</p>
                <h3 className="mt-4 text-2xl font-bold sm:text-3xl">{selected.summary}</h3>
                <p className="mt-4 text-sm leading-6 text-slate-300"><span className="font-semibold text-white">Best for:</span> {selected.idealFor}</p>

                {canConfigureAddOns ? (
                  <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.055] p-4">
                    <label
                      className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400"
                      htmlFor="pricing-addon"
                    >
                      Add to this package
                    </label>
                    <select
                      id="pricing-addon"
                      className="mt-3 h-11 w-full rounded-xl border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none transition focus:border-brand-light-purple"
                      value={selectedAddOnId}
                      onChange={(event) => setSelectedAddOnId(event.target.value)}
                    >
                      {addOns.map((addOn) => (
                        <option key={addOn.id} value={addOn.id}>
                          {addOn.name}
                          {addOn.price ? ` (+$${addOn.price}/mo)` : ""}
                        </option>
                      ))}
                    </select>
                    <p className="mt-3 text-xs leading-5 text-slate-400">
                      {selectedAddOn.description}
                    </p>
                    <div className="mt-4 flex items-end justify-between gap-3 border-t border-white/10 pt-4">
                      <span className="text-xs text-slate-400">Package total</span>
                      <span className="text-2xl font-bold text-white">
                        ${configuredMonthly?.toFixed(2)}
                        <span className="ml-1 text-sm font-medium text-slate-400">/mo</span>
                      </span>
                    </div>
                  </div>
                ) : null}

                <div className="mt-7 space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Key inclusions</p>
                  {selected.quickFeatures.map((feature) => (
                    <div key={feature} className="flex items-center gap-3 text-sm text-slate-200">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300"><Check className="h-3.5 w-3.5" /></span>
                      {feature}
                    </div>
                  ))}
                </div>

                <div className="mt-7 rounded-2xl border border-white/10 bg-black/15 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">{selected.exclusions.length ? "Not included" : "No fixed exclusions"}</p>
                  {selected.exclusions.length ? (
                    <ul className="mt-3 space-y-2.5">
                      {selected.exclusions.map((item) => <li key={item} className="flex gap-2.5 text-xs leading-5 text-slate-400"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-600" />{item}</li>)}
                    </ul>
                  ) : (
                    <p className="mt-3 text-xs leading-5 text-slate-400">Features, limits, infrastructure, and onboarding are tailored to your organization.</p>
                  )}
                </div>

                {selected.slug === "free" || selected.slug === "enterprise" ? (
                  <>
                    <Button asChild size="lg" className="mt-8 w-full bg-white text-slate-950 hover:bg-brand-blue/10">
                      <Link href={selected.slug === "enterprise" ? "/contact" : "/register"}>
                        {selected.slug === "enterprise" ? "Request a custom quote" : "Start free"}<ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    <p className="mt-3 text-center text-xs text-slate-400">{selected.slug === "enterprise" ? "We’ll shape the solution with you." : "No credit card required."}</p>
                  </>
                ) : (
                  <PayPalCheckout plan={selected.slug} interval="monthly" />
                )}
              </div>

              <div className="p-6 sm:p-8">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold">What’s included</p>
                    <p className="mt-1 text-sm text-slate-400">Everything in the previous plan, plus the capabilities below.</p>
                  </div>
                  <span className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 sm:block">{selected.features.length} highlighted features</span>
                </div>
                <div className="space-y-7">
                  {groups.map((group) => {
                    const features = selected.features.filter((feature) => feature.group === group);
                    return (
                      <div key={group}>
                        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">{group}</p>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                              <motion.div key={feature.title} initial={reduceMotion ? false : { opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.04 }} className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
                                <div className="flex gap-3">
                                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-blue/15 text-brand-light-purple"><Icon className="h-4 w-4" /></span>
                                  <div><p className="text-sm font-semibold text-white">{feature.title}</p><p className="mt-1.5 text-xs leading-5 text-slate-400">{feature.description}</p></div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.article>
        </AnimatePresence>
      </div>
    </div>
  );
}

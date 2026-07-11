import { unstable_noStore as noStore } from "next/cache";

import { db } from "@/lib/db";

export type PricingPlanCatalogItem = {
  slug: "free" | "starter" | "professional" | "business" | "enterprise";
  name: string;
  audience: string;
  monthly: number | null;
  summary: string;
  idealFor: string;
  featured?: boolean;
  quickFeatures: string[];
  exclusions: string[];
  sortOrder: number;
};

export type PricingAddOnCatalogItem = {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  sortOrder: number;
};

export const defaultPricingPlans: PricingPlanCatalogItem[] = [
  {
    slug: "free",
    name: "Free",
    audience: "For trying the platform",
    monthly: 0,
    summary: "Perfect for trying OMAZYNC before upgrading.",
    idealFor: "Personal use, freelancers, and testing the platform.",
    quickFeatures: ["1 email account", "1,000 emails per month", "Excel & CSV export"],
    exclusions: ["Unlimited folders", "Advanced filtering", "Export history", "Marketing integrations", "Priority support"],
    sortOrder: 0,
  },
  {
    slug: "starter",
    name: "Starter",
    audience: "For individuals and small businesses",
    monthly: 3.99,
    summary: "A focused toolkit for regular contact discovery and export.",
    idealFor: "Freelancers, consultants, and small businesses.",
    quickFeatures: ["10,000 emails per month", "Unlimited folders", "Unlimited exports"],
    exclusions: ["Multiple email accounts", "Included marketing integrations", "Scheduled sync", "API access", "Team collaboration"],
    sortOrder: 1,
  },
  {
    slug: "professional",
    name: "Professional",
    audience: "For marketers, agencies, and publishers",
    monthly: 5.99,
    summary: "Connect multiple inboxes directly to your marketing stack.",
    idealFor: "Marketing agencies, PR teams, recruiters, and publishers.",
    featured: true,
    quickFeatures: ["5 email accounts", "100,000 emails per month", "Kit, Mailchimp & Brevo"],
    exclusions: ["Unlimited email accounts", "Scheduled sync", "API access", "Webhooks", "Team collaboration"],
    sortOrder: 2,
  },
  {
    slug: "business",
    name: "Business",
    audience: "For growing and collaborative teams",
    monthly: 9.99,
    summary: "Run automated contact operations across teams and clients.",
    idealFor: "Agencies, sales teams, and organizations managing multiple clients.",
    quickFeatures: ["Unlimited accounts and scanning", "5 team members", "API & webhooks"],
    exclusions: ["Unlimited team members", "Dedicated infrastructure", "White-label solution", "Dedicated account manager"],
    sortOrder: 3,
  },
  {
    slug: "enterprise",
    name: "Enterprise",
    audience: "For advanced requirements",
    monthly: null,
    summary: "Built for large organizations with advanced requirements.",
    idealFor: "Large organizations requiring a tailored, governed deployment.",
    quickFeatures: ["Unlimited everything", "Dedicated infrastructure", "White-label solution"],
    exclusions: [],
    sortOrder: 4,
  },
];

export const defaultPricingAddOns: PricingAddOnCatalogItem[] = [
  { id: "none", name: "No add-on", category: "General", price: 0, description: "Use the package exactly as included.", sortOrder: 0 },
  { id: "extra-email", name: "Additional email account", category: "Email & team add-ons", price: 2, description: "Add one more mailbox to the selected package.", sortOrder: 1 },
  { id: "extra-volume", name: "Extra 100,000 emails scanned", category: "Email & team add-ons", price: 5, description: "Increase monthly scan capacity for heavier inboxes.", sortOrder: 2 },
  { id: "scheduled-sync", name: "Scheduled automatic sync", category: "Email & team add-ons", price: 4, description: "Run selected folder syncs automatically.", sortOrder: 3 },
  { id: "google-sheets", name: "Google Sheets sync", category: "Productivity add-ons", price: 3, description: "Send exports directly into a Google Sheet.", sortOrder: 4 },
  { id: "hubspot", name: "HubSpot integration", category: "Marketing integrations", price: 5, description: "Sync cleaned contacts into HubSpot.", sortOrder: 5 },
  { id: "api-webhooks", name: "API access + webhooks", category: "Productivity add-ons", price: 8, description: "Connect OMAZYNC to custom workflows.", sortOrder: 6 },
];

function toStringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export async function getPricingCatalog() {
  noStore();

  const [plans, addOns] = await Promise.all([
    db.pricingPlan.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
    db.pricingAddOn.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
  ]);

  return {
    plans: plans.length
      ? plans.map((plan) => ({
          slug: plan.slug as PricingPlanCatalogItem["slug"],
          name: plan.name,
          audience: plan.audience,
          monthly: plan.monthlyPrice === null ? null : Number(plan.monthlyPrice),
          summary: plan.summary,
          idealFor: plan.idealFor,
          featured: plan.isFeatured,
          quickFeatures: toStringList(plan.quickFeatures),
          exclusions: toStringList(plan.exclusions),
          sortOrder: plan.sortOrder,
        }))
      : defaultPricingPlans,
    addOns: addOns.length
      ? addOns.map((addOn) => ({
          id: addOn.slug,
          name: addOn.name,
          category: addOn.category,
          price: Number(addOn.monthlyPrice),
          description: addOn.description,
          sortOrder: addOn.sortOrder,
        }))
      : defaultPricingAddOns,
  };
}

export async function seedDefaultPricingCatalog() {
  await Promise.all([
    ...defaultPricingPlans.map((plan) =>
      db.pricingPlan.upsert({
        where: { slug: plan.slug },
        create: {
          slug: plan.slug,
          name: plan.name,
          audience: plan.audience,
          monthlyPrice: plan.monthly,
          summary: plan.summary,
          idealFor: plan.idealFor,
          quickFeatures: plan.quickFeatures,
          exclusions: plan.exclusions,
          isFeatured: Boolean(plan.featured),
          sortOrder: plan.sortOrder,
        },
        update: {},
      }),
    ),
    ...defaultPricingAddOns.map((addOn) =>
      db.pricingAddOn.upsert({
        where: { slug: addOn.id },
        create: {
          slug: addOn.id,
          name: addOn.name,
          category: addOn.category,
          monthlyPrice: addOn.price,
          description: addOn.description,
          sortOrder: addOn.sortOrder,
        },
        update: {},
      }),
    ),
  ]);
}

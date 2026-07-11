import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import {
  ArrowUpRight,
  DollarSign,
  Eye,
  ListFilter,
  PackageCheck,
  Plus,
  RotateCcw,
  Save,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import { authOptions } from "@/auth";
import { AdminTable, type AdminTableRow } from "@/components/admin/AdminTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/lib/db";
import { seedDefaultPricingCatalog } from "@/lib/pricing-catalog";

const planSlugs = ["free", "starter", "professional", "business", "enterprise"] as const;
const fieldClass =
  "h-10 w-full min-w-0 rounded-xl border border-input bg-background px-3 text-sm text-foreground";
const textAreaClass =
  "w-full min-w-0 rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground";

function linesToList(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function listToLines(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string").join("\n") : "";
}

function parsePrice(value: FormDataEntryValue | null, allowCustom = false) {
  const raw = String(value ?? "").trim();
  if (allowCustom && raw.toLowerCase() === "custom") return null;
  if (!raw) return allowCustom ? null : 0;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error("Price must be a positive number or Custom.");
  }
  return parsed;
}

function parseRequiredPrice(value: FormDataEntryValue | null) {
  return parsePrice(value) ?? 0;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function assertAdminUser() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized.");
  }
}

async function createDefaultCatalog() {
  "use server";

  await assertAdminUser();
  await seedDefaultPricingCatalog();
  revalidatePath("/admin/plans");
  revalidatePath("/pricing");
}

async function updatePlan(formData: FormData) {
  "use server";

  await assertAdminUser();

  const id = String(formData.get("id") ?? "");
  const slug = String(formData.get("slug") ?? "").toLowerCase();
  if (!id || !planSlugs.includes(slug as (typeof planSlugs)[number])) {
    throw new Error("Invalid plan.");
  }

  await db.pricingPlan.update({
    where: { id },
    data: {
      name: String(formData.get("name") ?? "").trim(),
      audience: String(formData.get("audience") ?? "").trim(),
      monthlyPrice: parsePrice(formData.get("monthlyPrice"), true),
      summary: String(formData.get("summary") ?? "").trim(),
      idealFor: String(formData.get("idealFor") ?? "").trim(),
      quickFeatures: linesToList(formData.get("quickFeatures")),
      exclusions: linesToList(formData.get("exclusions")),
      isFeatured: formData.get("isFeatured") === "on",
      isActive: formData.get("isActive") === "on",
      sortOrder: Number(formData.get("sortOrder") ?? 0),
    },
  });

  revalidatePath("/admin/plans");
  revalidatePath("/pricing");
}

async function updateAddOn(formData: FormData) {
  "use server";

  await assertAdminUser();

  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Invalid add-on.");

  await db.pricingAddOn.update({
    where: { id },
    data: {
      name: String(formData.get("name") ?? "").trim(),
      category: String(formData.get("category") ?? "General").trim() || "General",
      monthlyPrice: parseRequiredPrice(formData.get("monthlyPrice")),
      description: String(formData.get("description") ?? "").trim(),
      isActive: formData.get("isActive") === "on",
      sortOrder: Number(formData.get("sortOrder") ?? 0),
    },
  });

  revalidatePath("/admin/plans");
  revalidatePath("/pricing");
}

async function createAddOn(formData: FormData) {
  "use server";

  await assertAdminUser();

  const name = String(formData.get("name") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? name));
  if (!name || !slug) throw new Error("Add-on name is required.");

  await db.pricingAddOn.upsert({
    where: { slug },
    create: {
      slug,
      name,
      category: String(formData.get("category") ?? "General").trim() || "General",
      monthlyPrice: parseRequiredPrice(formData.get("monthlyPrice")),
      description: String(formData.get("description") ?? "").trim(),
      isActive: true,
      sortOrder: Number(formData.get("sortOrder") ?? 99),
    },
    update: {
      name,
      category: String(formData.get("category") ?? "General").trim() || "General",
      monthlyPrice: parseRequiredPrice(formData.get("monthlyPrice")),
      description: String(formData.get("description") ?? "").trim(),
      isActive: true,
    },
  });

  revalidatePath("/admin/plans");
  revalidatePath("/pricing");
}

function formatPrice(value: unknown) {
  if (value === null || value === undefined) return "Custom";
  return Number(value).toFixed(2);
}

function jsonListCount(value: unknown) {
  return Array.isArray(value) ? value.length : 0;
}

async function getEditableCatalog() {
  let [plans, addOns] = await Promise.all([
    db.pricingPlan.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] }),
    db.pricingAddOn.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] }),
  ]);

  if (!plans.length || !addOns.length) {
    await seedDefaultPricingCatalog();
    [plans, addOns] = await Promise.all([
      db.pricingPlan.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] }),
      db.pricingAddOn.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] }),
    ]);
  }

  return { plans, addOns };
}

export default async function AdminPlansPage() {
  const { plans, addOns } = await getEditableCatalog();
  const activePlans = plans.filter((plan) => plan.isActive).length;
  const activeAddOns = addOns.filter((addOn) => addOn.isActive).length;
  const featuredPlan = plans.find((plan) => plan.isFeatured);
  const paidPlanCount = plans.filter((plan) => plan.monthlyPrice !== null && Number(plan.monthlyPrice) > 0).length;
  const addOnCategories = Array.from(new Set(addOns.map((addOn) => addOn.category))).filter(Boolean);
  const planRows: AdminTableRow[] = plans.map((plan) => ({
    id: plan.slug,
    search: [plan.name, plan.slug, plan.audience, plan.summary, plan.isActive ? "active" : "hidden"].join(" "),
    cells: {
      plan: plan.name,
      slug: plan.slug,
      price: plan.monthlyPrice === null ? "Custom" : `$${formatPrice(plan.monthlyPrice)}`,
      status: plan.isActive ? "active" : "hidden",
      featured: plan.isFeatured ? "yes" : "no",
    },
  }));
  const addOnRows: AdminTableRow[] = addOns.map((addOn) => ({
    id: addOn.slug,
    search: [addOn.name, addOn.category, addOn.description, addOn.isActive ? "active" : "hidden"].join(" "),
    cells: {
      addOn: addOn.name,
      category: addOn.category,
      price: `$${formatPrice(addOn.monthlyPrice)}`,
      status: addOn.isActive ? "active" : "hidden",
    },
  }));
  const stats: Array<{
    label: string;
    value: string | number;
    description: string;
    icon: LucideIcon;
  }> = [
    { label: "Visible plans", value: activePlans, description: `${plans.length} total plans`, icon: PackageCheck },
    { label: "Paid plans", value: paidPlanCount, description: "Monthly subscriptions", icon: DollarSign },
    { label: "Active add-ons", value: activeAddOns, description: `${addOns.length} total add-ons`, icon: Plus },
    { label: "Featured plan", value: featuredPlan?.name ?? "None", description: "Highlighted on pricing", icon: Sparkles },
  ];
  const quickLinks = [
    { href: "#plan-editor", label: "Edit plans", description: "Names, prices, features" },
    { href: "#addon-editor", label: "Edit add-ons", description: "Upsells and categories" },
    { href: "#catalog-tables", label: "Search catalog", description: "Filter plans and add-ons" },
  ];

  return (
    <main className="min-w-0 space-y-6 overflow-hidden">
      <div className="relative overflow-hidden rounded-[1.75rem] border border-border bg-card p-6 shadow-sm">
        <div className="absolute inset-y-0 right-0 hidden w-72 bg-[radial-gradient(circle_at_center,rgba(0,127,212,0.18),transparent_62%)] lg:block" />
        <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
              <PackageCheck className="h-4 w-4" />
              Pricing Catalog
            </div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">Plans & Add-ons</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Edit the public pricing cards, plan copy, monthly prices, featured state, visibility, and optional add-ons from one admin page.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button asChild variant="outline">
              <a href="/pricing" target="_blank" rel="noreferrer">
                <Eye className="h-4 w-4" />
                Preview Pricing
              </a>
            </Button>
            <form action={createDefaultCatalog}>
              <Button type="submit" variant="outline">
                <RotateCcw className="h-4 w-4" />
                Restore Missing Defaults
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, description, icon: Icon }) => (
          <Card key={label} className="rounded-2xl">
            <CardContent className="p-5">
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="mt-2 break-words text-2xl font-semibold tracking-tight">{value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{description}</p>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,0.8fr)]">
        <Card className="rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ListFilter className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-semibold">Quick Access</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Jump straight to the section you need, then preview the pricing page from the header.
                </p>
              </div>
            </div>
            <div className="mt-4 grid min-w-0 gap-2 md:grid-cols-3">
              {quickLinks.map((link) => (
                <a
                  key={link.href}
                  className="group min-w-0 rounded-xl border border-border bg-background/70 p-3 text-sm transition hover:border-primary/50 hover:bg-primary/5"
                  href={link.href}
                >
                  <span className="flex min-w-0 items-center justify-between gap-3 font-medium">
                    {link.label}
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-primary" />
                  </span>
                  <span className="mt-1 block break-words text-xs text-muted-foreground">{link.description}</span>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardContent className="p-5">
            <h3 className="font-semibold">Add-on Categories</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Keep add-ons grouped so the pricing page stays easy to compare.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {addOnCategories.map((category) => (
                <Badge key={category} className="bg-primary/10 text-primary">
                  {category}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="plans">
        <TabsList className="sticky top-3 z-20 flex w-full max-w-full overflow-x-auto border border-border bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:top-24">
          <TabsTrigger value="plans">Plan Editor</TabsTrigger>
          <TabsTrigger value="addons">Add-on Editor</TabsTrigger>
          <TabsTrigger value="tables">Filter Tables</TabsTrigger>
        </TabsList>

        <TabsContent id="plan-editor" value="plans" className="scroll-mt-28 space-y-4">
          <div className="grid min-w-0 gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {plans.map((plan) => (
              <Card key={plan.id} className="rounded-2xl">
                <CardContent className="p-5">
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{plan.slug}</p>
                      <h3 className="mt-2 break-words text-lg font-semibold">{plan.name}</h3>
                    </div>
                    {plan.isFeatured ? <Badge className="bg-primary/15 text-primary">Featured</Badge> : null}
                  </div>
                  <p className="mt-4 text-3xl font-semibold">
                    {plan.monthlyPrice === null ? "Custom" : `$${formatPrice(plan.monthlyPrice)}`}
                    {plan.monthlyPrice !== null ? <span className="text-sm font-medium text-muted-foreground"> /mo</span> : null}
                  </p>
                  <p className="mt-3 min-h-16 overflow-hidden text-sm leading-6 text-muted-foreground [display:-webkit-box] [-webkit-line-clamp:3] [-webkit-box-orient:vertical]">{plan.summary}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge className={plan.isActive ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-muted text-muted-foreground"}>
                      {plan.isActive ? "Visible" : "Hidden"}
                    </Badge>
                    <Badge>{jsonListCount(plan.quickFeatures)} features</Badge>
                  </div>
                  <Button asChild className="mt-5 w-full" variant="outline">
                    <a href={`#plan-${plan.slug}`}>Edit {plan.name}</a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Edit Frontend Plans</CardTitle>
              <CardDescription>Changes here update the visible cards on `/pricing` after save.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {plans.map((plan) => (
                <form
                  key={plan.id}
                  action={updatePlan}
                  className="min-w-0 scroll-mt-32 rounded-2xl border border-border/80 bg-background/70 p-4"
                  id={`plan-${plan.slug}`}
                >
                  <input name="id" type="hidden" value={plan.id} />
                  <input name="slug" type="hidden" value={plan.slug} />
                  <div className="grid min-w-0 gap-5 2xl:grid-cols-[14rem_minmax(0,1fr)]">
                    <div className="min-w-0 rounded-2xl border border-border bg-card p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge>{plan.slug}</Badge>
                        <Badge className={plan.isActive ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-muted text-muted-foreground"}>
                          {plan.isActive ? "Visible" : "Hidden"}
                        </Badge>
                      </div>
                      <h3 className="mt-4 break-words text-xl font-semibold">{plan.name}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{plan.audience}</p>
                      <p className="mt-5 text-3xl font-semibold">
                        {plan.monthlyPrice === null ? "Custom" : `$${formatPrice(plan.monthlyPrice)}`}
                        {plan.monthlyPrice !== null ? <span className="text-sm font-medium text-muted-foreground"> /mo</span> : null}
                      </p>
                      <div className="mt-5 space-y-2 text-xs text-muted-foreground">
                        <p>{jsonListCount(plan.quickFeatures)} quick features</p>
                        <p>{jsonListCount(plan.exclusions)} exclusions</p>
                        <p>Sort order {plan.sortOrder}</p>
                      </div>
                    </div>
                    <div className="min-w-0 overflow-hidden">
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h3 className="font-semibold">Edit {plan.name}</h3>
                          <p className="mt-1 text-xs text-muted-foreground">This content feeds the public pricing page.</p>
                        </div>
                        <Button type="submit">
                          <Save className="h-4 w-4" />
                          Save Plan
                        </Button>
                      </div>
                      <div className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)_minmax(8rem,0.65fr)_minmax(6rem,0.45fr)]">
                        <label className="grid min-w-0 gap-1 text-xs font-medium text-muted-foreground">
                          Plan name
                          <input className={fieldClass} defaultValue={plan.name} name="name" />
                        </label>
                        <label className="grid min-w-0 gap-1 text-xs font-medium text-muted-foreground">
                          Audience line
                          <input className={fieldClass} defaultValue={plan.audience} name="audience" />
                        </label>
                        <label className="grid min-w-0 gap-1 text-xs font-medium text-muted-foreground">
                          Monthly price
                          <input className={fieldClass} defaultValue={formatPrice(plan.monthlyPrice)} name="monthlyPrice" placeholder="Custom" />
                        </label>
                        <label className="grid min-w-0 gap-1 text-xs font-medium text-muted-foreground">
                          Sort
                          <input className={fieldClass} defaultValue={plan.sortOrder} name="sortOrder" type="number" />
                        </label>
                      </div>
                      <div className="mt-3 grid min-w-0 gap-3 xl:grid-cols-2">
                        <label className="grid min-w-0 gap-1 text-xs font-medium text-muted-foreground">
                          Summary
                          <textarea className={`${textAreaClass} min-h-24`} defaultValue={plan.summary} name="summary" />
                        </label>
                        <label className="grid min-w-0 gap-1 text-xs font-medium text-muted-foreground">
                          Best for
                          <textarea className={`${textAreaClass} min-h-24`} defaultValue={plan.idealFor} name="idealFor" />
                        </label>
                        <label className="grid min-w-0 gap-1 text-xs font-medium text-muted-foreground">
                          Quick features, one per line
                          <textarea className={`${textAreaClass} min-h-28`} defaultValue={listToLines(plan.quickFeatures)} name="quickFeatures" />
                        </label>
                        <label className="grid min-w-0 gap-1 text-xs font-medium text-muted-foreground">
                          Exclusions, one per line
                          <textarea className={`${textAreaClass} min-h-28`} defaultValue={listToLines(plan.exclusions)} name="exclusions" />
                        </label>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-4 text-sm">
                        <label className="inline-flex items-center gap-2 text-muted-foreground">
                          <input defaultChecked={plan.isActive} name="isActive" type="checkbox" />
                          Show on pricing page
                        </label>
                        <label className="inline-flex items-center gap-2 text-muted-foreground">
                          <input defaultChecked={plan.isFeatured} name="isFeatured" type="checkbox" />
                          Mark as featured
                        </label>
                      </div>
                    </div>
                  </div>
                </form>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent id="addon-editor" value="addons" className="scroll-mt-28 space-y-4">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Create Add-on</CardTitle>
              <CardDescription>Add optional upsells shown in the pricing selector and add-on list.</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={createAddOn} className="min-w-0 rounded-2xl border border-dashed border-border bg-secondary/30 p-4">
                <div className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(8rem,0.7fr)_minmax(6rem,0.45fr)]">
                  <input className={fieldClass} name="name" placeholder="Add-on name" />
                  <input className={fieldClass} name="category" placeholder="Category" />
                  <input className={fieldClass} name="monthlyPrice" placeholder="Monthly price" />
                  <input className={fieldClass} name="sortOrder" placeholder="Sort" type="number" />
                </div>
                <textarea className={`${textAreaClass} mt-3 min-h-20`} name="description" placeholder="Description shown on pricing page" />
                <Button className="mt-3" type="submit">
                  <Plus className="h-4 w-4" />
                  Add Add-on
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="grid min-w-0 gap-4 2xl:grid-cols-2">
            {addOns.map((addOn) => (
              <form key={addOn.id} action={updateAddOn} className="min-w-0 rounded-2xl border border-border bg-card p-4 shadow-sm">
                <input name="id" type="hidden" value={addOn.id} />
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="break-words font-semibold">{addOn.name}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{addOn.category}</p>
                  </div>
                  <Badge className={addOn.isActive ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-muted text-muted-foreground"}>
                    {addOn.isActive ? "Visible" : "Hidden"}
                  </Badge>
                </div>
                <div className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(8rem,0.7fr)_minmax(6rem,0.45fr)]">
                  <label className="grid min-w-0 gap-1 text-xs font-medium text-muted-foreground">
                    Name
                    <input className={fieldClass} defaultValue={addOn.name} name="name" />
                  </label>
                  <label className="grid min-w-0 gap-1 text-xs font-medium text-muted-foreground">
                    Category
                    <input className={fieldClass} defaultValue={addOn.category} name="category" />
                  </label>
                  <label className="grid min-w-0 gap-1 text-xs font-medium text-muted-foreground">
                    Monthly price
                    <input className={fieldClass} defaultValue={formatPrice(addOn.monthlyPrice)} name="monthlyPrice" />
                  </label>
                  <label className="grid min-w-0 gap-1 text-xs font-medium text-muted-foreground">
                    Sort
                    <input className={fieldClass} defaultValue={addOn.sortOrder} name="sortOrder" type="number" />
                  </label>
                </div>
                <label className="mt-3 grid min-w-0 gap-1 text-xs font-medium text-muted-foreground">
                  Description
                  <textarea className={`${textAreaClass} min-h-20`} defaultValue={addOn.description} name="description" />
                </label>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                    <input defaultChecked={addOn.isActive} name="isActive" type="checkbox" />
                    Show on pricing page
                  </label>
                  <Button type="submit">
                    <Save className="h-4 w-4" />
                    Save Add-on
                  </Button>
                </div>
              </form>
            ))}
          </div>
        </TabsContent>

        <TabsContent id="catalog-tables" value="tables" className="scroll-mt-28 grid min-w-0 gap-6 2xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <Card>
            <CardHeader>
              <CardTitle>Plan Table</CardTitle>
              <CardDescription>Quickly filter the catalog before editing in the Plan Editor tab.</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminTable
                columns={[
                  { key: "plan", label: "Plan" },
                  { key: "slug", label: "Slug" },
                  { key: "price", label: "Monthly" },
                  { key: "status", label: "Status" },
                  { key: "featured", label: "Featured" },
                ]}
                emptyMessage="No plans match this filter."
                rows={planRows}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Add-on Table</CardTitle>
              <CardDescription>Search by add-on name, category, description, or visibility.</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminTable
                columns={[
                  { key: "addOn", label: "Add-on" },
                  { key: "category", label: "Category" },
                  { key: "price", label: "Monthly" },
                  { key: "status", label: "Status" },
                ]}
                emptyMessage="No add-ons match this filter."
                rows={addOnRows}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}

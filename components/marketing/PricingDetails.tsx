import Link from "next/link";
import {
  ArrowRight,
  Check,
  CircleDollarSign,
  PlugZap,
  Settings2,
  Sparkles,
  UsersRound,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const comparison = [
  ["Email accounts", "1", "1", "5", "Unlimited"],
  ["Outlook & IMAP support", true, true, true, true],
  ["Emails scanned / month", "1,000", "10,000", "100,000", "Unlimited"],
  ["Unlimited folder selection", false, true, true, true],
  ["Duplicate removal", true, true, true, true],
  ["Excel export", true, true, true, true],
  ["CSV export", true, true, true, true],
  ["Contact filtering", "Basic", "Advanced", "Advanced", "Advanced"],
  ["Marketing integrations", false, "Add-on", "Included", "Included"],
  ["Scheduled sync", false, false, false, true],
  ["API access", false, false, false, true],
  ["Team collaboration", false, false, false, true],
  ["Priority support", false, true, true, true],
] as const;

const addOnGroups = [
  {
    title: "Email & team add-ons",
    icon: UsersRound,
    items: [
      ["Additional email account", "$2/month"],
      ["Additional team member", "$3/month"],
      ["Extra 100,000 emails scanned", "$5/month"],
      ["Scheduled automatic sync", "$4/month"],
    ],
  },
  {
    title: "Marketing integrations",
    icon: PlugZap,
    items: [
      ["Kit", "Included (Professional+)"],
      ["Mailchimp", "Included (Professional+)"],
      ["Brevo", "Included (Professional+)"],
      ["HubSpot", "$5/month"],
      ["ActiveCampaign", "$5/month"],
      ["Beehiiv", "$5/month"],
      ["MailerLite", "$5/month"],
      ["Constant Contact", "$5/month"],
      ["Zoho CRM", "$5/month"],
      ["Pipedrive", "$5/month"],
      ["Salesforce", "$8/month"],
    ],
  },
  {
    title: "Productivity add-ons",
    icon: Settings2,
    items: [
      ["API access", "$8/month"],
      ["Webhooks", "$4/month"],
      ["Google Sheets sync", "$3/month"],
      ["White-label branding", "$25/month"],
      ["Custom branding", "$15/month"],
    ],
  },
] as const;

const services = [
  ["Account setup assistance", "$29"],
  ["Contact data cleanup", "$19"],
  ["Contact migration", "$49"],
  ["Custom integration development", "From $199"],
  ["One-to-one training session", "$49/hour"],
] as const;

const reasons = [
  ["Affordable plans", "Start free and upgrade only when you need more."],
  ["Flexible scaling", "Add accounts, team members, or integrations as your business grows."],
  ["No vendor lock-in", "Export your contacts anytime in Excel or CSV format."],
  ["Powerful integrations", "Sync directly with leading email marketing and CRM platforms."],
  ["Time-saving automation", "Turn years of conversations into actionable contact lists in minutes."],
] as const;

function Value({ value }: { value: string | boolean }) {
  if (value === true) {
    return <Check aria-label="Included" className="mx-auto h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
  }
  if (value === false) {
    return <X aria-label="Not included" className="mx-auto h-4 w-4 text-slate-300 dark:text-slate-600" />;
  }
  return <span>{value}</span>;
}

export function PricingDetails() {
  return (
    <div className="space-y-24">
      <section>
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-blue dark:text-brand-light-purple">Compare plans</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">Feature comparison</h2>
          <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">See the limits and capabilities side by side before choosing.</p>
        </div>
        <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 dark:bg-white/[0.04]">
              <tr>
                <th className="px-5 py-4 font-semibold text-slate-950 dark:text-white">Feature</th>
                {["Free", "Starter", "Professional", "Business"].map((name) => (
                  <th key={name} className="px-4 py-4 text-center font-semibold text-slate-950 dark:text-white">{name}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.07]">
              {comparison.map(([feature, ...values]) => (
                <tr key={feature} className="transition-colors hover:bg-brand-blue/[0.04] dark:hover:bg-brand-blue/[0.04]">
                  <th className="px-5 py-4 font-medium text-slate-700 dark:text-slate-200">{feature}</th>
                  {values.map((value, index) => (
                    <td key={`${feature}-${index}`} className="px-4 py-4 text-center text-xs font-medium text-slate-600 dark:text-slate-300">
                      <Value value={value} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-blue dark:text-brand-light-purple">Optional extras</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">Available add-ons</h2>
          <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">Choose an add-on from the package dropdown above, or use this list to compare extra capacity and integrations.</p>
        </div>
        <div className="grid items-start gap-5 lg:grid-cols-3">
          {addOnGroups.map(({ title, icon: Icon, items }) => (
            <article key={title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue dark:bg-brand-blue/10 dark:text-brand-light-purple"><Icon className="h-5 w-5" /></div>
              <h3 className="mt-5 text-lg font-bold text-slate-950 dark:text-white">{title}</h3>
              <div className="mt-5 divide-y divide-slate-100 dark:divide-white/[0.07]">
                {items.map(([name, price]) => (
                  <div key={name} className="flex items-start justify-between gap-4 py-3 text-sm">
                    <span className="text-slate-600 dark:text-slate-300">{name}</span>
                    <span className="shrink-0 text-right font-semibold text-slate-950 dark:text-white">{price}</span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-blue dark:text-brand-light-purple">Expert help</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">Professional services</h2>
          <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">Need help getting started? Our team can assist with setup, migration, cleanup, training, and custom integrations.</p>
          <CircleDollarSign className="mt-8 h-10 w-10 text-brand-blue dark:text-brand-light-purple" />
        </div>
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
          {services.map(([service, price]) => (
            <div key={service} className="flex items-center justify-between gap-4 border-b border-slate-100 px-6 py-5 last:border-0 dark:border-white/[0.07]">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{service}</span>
              <span className="text-sm font-bold text-slate-950 dark:text-white">{price}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] bg-slate-950 p-7 text-white sm:p-10">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <Sparkles className="h-7 w-7 text-brand-light-purple" />
            <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">Why choose Omazync Email Exporter?</h2>
            <p className="mt-4 leading-7 text-slate-300">Discover, organize, export, and sync valuable contacts without locking your data away.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {reasons.map(([title, description]) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
                <p className="flex items-center gap-2 text-sm font-semibold"><Check className="h-4 w-4 text-emerald-300" />{title}</p>
                <p className="mt-2 text-xs leading-5 text-slate-400">{description}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-5 border-t border-white/10 pt-8 sm:flex-row sm:items-center">
          <div>
            <p className="font-semibold">Need a custom solution?</p>
            <p className="mt-1 text-sm text-slate-400">Let’s shape a multi-client, enterprise, or white-label deployment around you.</p>
          </div>
          <Button asChild className="bg-white text-slate-950 hover:bg-brand-blue/10">
            <Link href="/contact">Discuss your requirements <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

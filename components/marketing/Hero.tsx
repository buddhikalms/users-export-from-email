import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DashboardMockup } from "@/components/marketing/DashboardMockup";
import { Float, Reveal } from "@/components/marketing/Motion";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,#ffffff_0%,#eef6ff_48%,#ffffff_100%)] dark:bg-[linear-gradient(180deg,#020617_0%,#0f172a_54%,#020617_100%)]" />
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(37,99,235,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.07)_1px,transparent_1px)] bg-[size:54px_54px] opacity-60 dark:opacity-25" />
        <div className="animate-gradient-drift absolute left-1/2 top-10 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.28),rgba(34,211,238,0.14)_38%,transparent_68%)] blur-3xl" />
        <div className="animate-gradient-drift-reverse absolute -left-32 top-28 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(14,165,233,0.22),transparent_65%)] blur-3xl" />
        <div className="animate-gradient-drift absolute -right-28 top-20 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.2),transparent_66%)] blur-3xl" />
        <div className="animate-light-sweep absolute top-0 h-full w-40 rotate-12 bg-gradient-to-r from-transparent via-white/45 to-transparent blur-xl dark:via-cyan-200/10" />
      </div>
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-20 sm:px-6 lg:px-8 lg:pb-24 lg:pt-28">
        <div className="mx-auto max-w-4xl text-center">
          <Reveal>
            <div className="mx-auto mb-5 inline-flex items-center rounded-full border border-blue-200 bg-white px-3 py-1 text-sm font-medium text-blue-700 shadow-sm dark:border-blue-400/20 dark:bg-white/10 dark:text-blue-200">
              Outlook, IMAP, Excel, Kit, Mailchimp, Brevo, HubSpot
            </div>
          </Reveal>
          <Reveal delay={0.08} y={24}>
            <h1 className="text-5xl font-semibold tracking-tight text-slate-950 dark:text-white md:text-7xl">
              Turn Your Inbox Into a Powerful Contact Database
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              Extract contacts from Outlook, IMAP mailboxes, and forwarded email conversations. Clean duplicates,
              organize leads, export to Excel, and sync directly to your marketing platforms.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="bg-gradient-to-r from-slate-950 to-blue-700 text-white hover:opacity-90">
                <Link href={"/dashboard" as any}>
                  Start Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href={"/contact" as any}>
                  <PlayCircle className="h-4 w-4" />
                  View Demo
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>
        <div className="mt-14">
          <Reveal delay={0.32} y={30}>
            <Float>
              <DashboardMockup />
            </Float>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

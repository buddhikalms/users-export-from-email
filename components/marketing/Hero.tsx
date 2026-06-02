import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DashboardMockup } from "@/components/marketing/DashboardMockup";
import { Float, Reveal } from "@/components/marketing/Motion";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,#ffffff_0%,#eef6ff_48%,#ffffff_100%)] dark:bg-[linear-gradient(180deg,#020617_0%,#0f172a_54%,#020617_100%)]" />
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

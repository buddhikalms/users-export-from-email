"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, FileSpreadsheet, MailCheck, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";

const orbitItems = [
  ["Outlook", "Folders scanned"],
  ["Excel", "Clean export ready"],
  ["Kit", "Tags synced"],
  ["HubSpot", "Leads routed"],
] as const;

export function AnimatedBanner() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-[2rem] border border-blue-200/70 bg-slate-950 p-6 text-white shadow-2xl shadow-blue-950/20 dark:border-blue-300/20 sm:p-8 lg:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.28),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(37,99,235,0.35),transparent_32%)]" />
        <motion.div
          aria-hidden="true"
          animate={{ x: ["-10%", "10%", "-10%"] }}
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300 to-transparent"
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm text-blue-100"
            >
              <Sparkles className="h-4 w-4 text-cyan-300" />
              New workflow: inbox to marketing platform
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08, duration: 0.55 }}
              className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl"
            >
              Watch messy inbox contacts become a clean, synced growth database.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.16, duration: 0.55 }}
              className="mt-4 max-w-2xl text-base leading-7 text-slate-300"
            >
              Select a mailbox, scan folders, remove duplicate emails, export to Excel, or push contacts
              straight into Kit, Mailchimp, Brevo, HubSpot, and more.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.24, duration: 0.55 }}
              className="mt-7 flex flex-col gap-3 sm:flex-row"
            >
              <Button asChild size="lg" className="bg-white text-slate-950 hover:bg-slate-100">
                <Link href={"/pricing" as any}>
                  Choose a Plan
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10">
                <Link href={"/use-cases" as any}>See Use Cases</Link>
              </Button>
            </motion.div>
          </div>

          <div className="relative min-h-[280px]">
            <motion.div
              animate={{ rotate: 360 }}
              className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-cyan-300/30"
              transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute left-1/2 top-1/2 grid h-28 w-28 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-3xl border border-white/15 bg-white/10 text-center shadow-2xl backdrop-blur">
              <MailCheck className="h-7 w-7 text-cyan-300" />
              <span className="mt-2 text-xs font-semibold">ChatUp</span>
            </div>
            {orbitItems.map(([label, detail], index) => {
              const positions = [
                "left-2 top-4",
                "right-2 top-12",
                "bottom-6 left-8",
                "bottom-12 right-8",
              ];

              return (
                <motion.div
                  key={label}
                  animate={{ y: [0, -8, 0] }}
                  className={`absolute ${positions[index]} w-36 rounded-2xl border border-white/15 bg-white/10 p-3 shadow-xl backdrop-blur`}
                  transition={{ duration: 3.6, delay: index * 0.35, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    {label === "Excel" ? <FileSpreadsheet className="h-4 w-4 text-cyan-300" /> : <CheckCircle2 className="h-4 w-4 text-cyan-300" />}
                    {label}
                  </div>
                  <p className="mt-1 text-xs text-slate-300">{detail}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

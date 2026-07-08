"use client";

import {
  BarChart3,
  ContactRound,
  DatabaseZap,
  FileSpreadsheet,
  Mail,
  MailCheck,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const nodes = [
  { title: "Outlook Sync", icon: MailCheck, side: "left", top: 8 },
  { title: "IMAP Mailboxes", icon: Mail, side: "right", top: 8 },
  { title: "Contact Extraction", icon: ContactRound, side: "left", top: 28 },
  { title: "Duplicate Cleanup", icon: Sparkles, side: "right", top: 28 },
  { title: "Excel / CSV Export", icon: FileSpreadsheet, side: "left", top: 48 },
  { title: "Kit Sync", icon: RefreshCw, side: "right", top: 48 },
  { title: "Zoho Campaigns", icon: UsersRound, side: "left", top: 68 },
  { title: "Brevo Sync", icon: DatabaseZap, side: "right", top: 68 },
  { title: "Analytics Dashboard", icon: BarChart3, side: "left", top: 88 },
  { title: "Secure Vault", icon: ShieldCheck, side: "right", top: 88 },
] as const;

export function EcosystemDiagram() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative mx-auto mt-12 max-w-6xl">
      <div className="hidden h-[680px] md:block">
        <svg aria-hidden="true" className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 1000 680" preserveAspectRatio="none">
          {nodes.map((node, index) => {
            const endX = node.side === "left" ? 235 : 765;
            const endY = (node.top / 100) * 680;
            return (
              <motion.path
                key={node.title}
                d={`M 500 340 C ${node.side === "left" ? 400 : 600} 340, ${node.side === "left" ? 340 : 660} ${endY}, ${endX} ${endY}`}
                fill="none"
                stroke="currentColor"
                strokeDasharray="7 9"
                strokeWidth="1.5"
                className="text-secondary dark:text-secondary"
                animate={reduceMotion ? undefined : { strokeDashoffset: [0, -32] }}
                transition={{ duration: 3.5 + index * 0.08, repeat: Infinity, ease: "linear" }}
              />
            );
          })}
        </svg>

        <div className="absolute left-1/2 top-1/2 z-20 h-48 w-48 -translate-x-1/2 -translate-y-1/2">
          <motion.div
            className="grid h-full w-full place-items-center rounded-full border border-secondary/25 bg-white text-center shadow-[0_0_0_16px_rgba(0,127,212,0.16),0_28px_80px_-24px_rgba(0,127,212,0.55)] dark:border-secondary/25 dark:bg-slate-900 dark:shadow-[0_0_0_16px_rgba(0,127,212,0.14),0_28px_80px_-24px_rgba(0,127,212,0.4)]"
            animate={reduceMotion ? undefined : { scale: [1, 1.035, 1] }}
            transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <div>
              <span className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full bg-secondary text-white">
                <MailCheck className="h-5 w-5" />
              </span>
<<<<<<< HEAD
              <p className="text-xl font-semibold text-slate-950 dark:text-white">OMAZYNC</p>
=======
              <p className="text-xl font-semibold text-slate-950 dark:text-white">Omazync</p>
>>>>>>> 5d8ace5 (security: fix vulnerbilities, load testing)
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">one connected system</p>
            </div>
          </motion.div>
        </div>

        {nodes.map((node, index) => {
          const Icon = node.icon;
          return (
            <motion.div
              key={node.title}
              className={`absolute z-10 w-[230px] ${node.side === "left" ? "left-0 lg:left-6" : "right-0 lg:right-6"}`}
              style={{ top: `${node.top}%`, translateY: "-50%" }}
              initial={{ opacity: 0, x: node.side === "left" ? -24 : 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              whileHover={{ y: -6, scale: 1.02 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: index * 0.09, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-[0_16px_36px_-24px_rgba(15,23,42,0.45)] backdrop-blur dark:border-white/10 dark:bg-slate-900/95">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary/10 text-secondary dark:bg-secondary/10 dark:text-secondary">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{node.title}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-3 md:hidden">
        <motion.div
          className="mb-3 rounded-3xl bg-gradient-to-br from-primary to-secondary p-7 text-center text-white shadow-xl"
          animate={reduceMotion ? undefined : { scale: [1, 1.02, 1] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
        >
<<<<<<< HEAD
          <MailCheck className="mx-auto h-6 w-6 text-secondary dark:text-white" />
          <p className="mt-3 text-xl font-semibold">OMAZYNC</p>
          <p className="mt-1 text-sm text-slate-300 dark:text-secondary">one connected system</p>
=======
          <MailCheck className="mx-auto h-6 w-6 text-blue-300 dark:text-white" />
          <p className="mt-3 text-xl font-semibold">Omazync</p>
          <p className="mt-1 text-sm text-slate-300 dark:text-blue-100">one connected system</p>
>>>>>>> 5d8ace5 (security: fix vulnerbilities, load testing)
        </motion.div>
        {nodes.map((node, index) => {
          const Icon = node.icon;
          return (
            <motion.div
              key={node.title}
              className="relative flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary/10 text-secondary dark:bg-secondary/10 dark:text-secondary">
                <Icon className="h-4 w-4" />
              </span>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{node.title}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

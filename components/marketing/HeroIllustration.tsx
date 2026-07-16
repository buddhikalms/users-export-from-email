"use client";

import {
  Check,
  Cloud,
  ContactRound,
  FileSpreadsheet,
  Folder,
  Mail,
  Sheet,
  Sparkles,
  UserRound,
  UsersRound,
  Zap,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { FloatingCard } from "@/components/marketing/FloatingCard";

const connectorPaths = [
  "M260 105 C260 145 205 150 205 195",
  "M260 105 C260 145 315 150 315 195",
  "M205 245 C205 285 260 280 260 320",
  "M315 245 C315 285 260 280 260 320",
  "M260 380 C260 420 190 420 190 462",
  "M260 380 C260 420 330 420 330 462",
] as const;

export function HeroIllustration() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative mx-auto h-[570px] w-full max-w-[600px] select-none sm:h-[620px]">
      <div className="absolute inset-x-14 bottom-8 h-28 rounded-[50%] bg-brand-light-purple/20 blur-3xl" />
      <svg aria-hidden="true" className="absolute left-1/2 top-8 h-[530px] w-[520px] max-w-none -translate-x-1/2" viewBox="0 0 520 540">
        <defs>
          <linearGradient id="lineGradient" x1="0" x2="1">
            <stop stopColor="#007FD4" stopOpacity=".28" />
            <stop offset="1" stopColor="#03B7B2" stopOpacity=".72" />
          </linearGradient>
        </defs>
        {connectorPaths.map((path, index) => (
          <motion.path
            key={path}
            d={path}
            fill="none"
            stroke="url(#lineGradient)"
            strokeDasharray="6 8"
            strokeLinecap="round"
            strokeWidth="1.6"
            animate={reduceMotion ? undefined : { strokeDashoffset: [0, -28] }}
            transition={{ duration: 2.8 + index * 0.1, repeat: Infinity, ease: "linear" }}
          />
        ))}
        {[105, 195, 245, 320, 380, 462].map((cy, index) => (
          <motion.circle
            key={cy}
            cx={index === 1 ? 205 : index === 2 ? 315 : index === 4 ? 190 : index === 5 ? 330 : 260}
            cy={cy}
            r="3.5"
            fill="#03B7B2"
            animate={reduceMotion ? undefined : { opacity: [0.25, 1, 0.25], r: [3, 4.5, 3] }}
            transition={{ duration: 2, delay: index * 0.25, repeat: Infinity }}
          />
        ))}
      </svg>

      <motion.div
        className="absolute left-1/2 top-5 z-10 h-28 w-40 -translate-x-1/2"
        animate={reduceMotion ? undefined : { y: [0, -8, 0], rotateX: [0, 3, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        style={{ perspective: 800 }}
      >
        <div className="absolute inset-0 translate-y-5 rounded-[1.75rem] bg-brand-blue shadow-[0_28px_55px_-18px_rgba(0,127,212,0.6)] [transform:rotateX(8deg)_rotateY(-8deg)]" />
        <div className="absolute inset-x-0 top-5 h-20 overflow-hidden rounded-[1.75rem] border border-white/30 bg-gradient-to-br from-brand-purple via-brand-blue to-brand-turquoise">
          <div className="absolute inset-x-0 top-0 h-full origin-top bg-brand-navy/40 [clip-path:polygon(0_0,50%_63%,100%_0)]" />
          <Mail className="absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 text-white" />
        </div>
      </motion.div>

      <div className="absolute left-1/2 top-[155px] z-10 flex -translate-x-1/2 gap-3">
        {["JD", "SB", "AK"].map((initials, index) => (
          <motion.div
            key={initials}
            className="w-24 rounded-2xl border border-white/80 bg-white/80 p-3 shadow-xl shadow-slate-900/10 backdrop-blur-xl"
            animate={reduceMotion ? undefined : { y: [0, index % 2 ? 6 : -6, 0] }}
            transition={{ duration: 4 + index * 0.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-brand-light-purple/20 to-brand-turquoise/20 text-[10px] font-bold text-brand-blue">{initials}</span>
            <span className="mt-2 block h-1.5 w-14 rounded-full bg-slate-200" />
            <span className="mt-1.5 block h-1.5 w-10 rounded-full bg-slate-100" />
          </motion.div>
        ))}
      </div>

      <motion.div
        className="absolute left-1/2 top-[280px] z-10 w-52 -translate-x-1/2 rounded-[1.5rem] border border-white/90 bg-white/80 p-4 shadow-[0_24px_55px_-22px_rgba(15,23,42,0.35)] backdrop-blur-xl"
        animate={reduceMotion ? undefined : { y: [0, -5, 0] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-turquoise/10 text-brand-turquoise"><Folder className="h-4 w-4" /></span>
            <div><p className="text-xs font-bold text-slate-800">Contacts organized</p><p className="text-[10px] text-slate-500">Inbox to clean folders</p></div>
          </div>
          <Sparkles className="h-4 w-4 text-brand-purple" />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {["Clients", "Leads", "Suppliers"].map((folder) => <div key={folder} className="rounded-lg bg-slate-50 px-2 py-2 text-center text-[9px] font-semibold text-slate-600">{folder}</div>)}
        </div>
      </motion.div>

      <div className="absolute inset-x-0 top-[430px] z-10 flex justify-center gap-3 sm:gap-8">
        {[[FileSpreadsheet, "Excel", "emerald"], [Sheet, "CSV", "blue"], [Cloud, "Marketing", "cyan"]].map(([Icon, label, tone], index) => {
          const ItemIcon = Icon as typeof FileSpreadsheet;
          return (
            <motion.div
              key={label as string}
              className="grid h-20 w-20 place-items-center rounded-[1.4rem] border border-white/90 bg-white/80 text-center shadow-[0_24px_45px_-24px_rgba(15,23,42,0.42)] backdrop-blur-xl sm:h-24 sm:w-24 sm:rounded-[1.6rem]"
              animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
              transition={{ duration: 4.2 + index * 0.5, delay: index * 0.35, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className={`grid h-10 w-10 place-items-center rounded-xl ${tone === "emerald" ? "bg-brand-turquoise/10 text-brand-turquoise" : tone === "cyan" ? "bg-brand-blue/10 text-brand-blue" : "bg-brand-purple/10 text-brand-purple"}`}><ItemIcon className="h-5 w-5" /></span>
              <span className="-mt-3 text-[10px] font-bold text-slate-700">{label as string}</span>
            </motion.div>
          );
        })}
      </div>

      <FloatingCard className="left-0 top-20" icon={Mail} label="Outlook" detail="Connected" delay={0.2} />
      <FloatingCard className="right-0 top-28" icon={Folder} label="Inbox" detail="Scanning now" delay={0.55} tone="cyan" />
      <FloatingCard className="left-0 top-[240px] hidden sm:flex" icon={UserRound} label="John Smith" detail="Contact found" delay={0.8} />
      <FloatingCard className="right-0 top-[260px] hidden sm:flex" icon={UsersRound} label="12,452 contacts" detail="Extracted" delay={1.05} tone="cyan" />
      <FloatingCard className="left-4 bottom-3" icon={Check} label="Duplicate removed" delay={1.2} tone="emerald" />
      <FloatingCard className="right-3 bottom-2" icon={Zap} label="Export complete" delay={1.4} tone="emerald" />
    </div>
  );
}

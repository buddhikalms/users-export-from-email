"use client";

import { CheckCheck, CloudUpload, ContactRound, Mail, ScanSearch, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const steps = [
  ["Outlook", Mail],
  ["Scanning Emails", ScanSearch],
  ["Extract Contacts", ContactRound],
  ["Clean Duplicates", Sparkles],
  ["Export", CheckCheck],
  ["Marketing Platform", CloudUpload],
] as const;

export function WorkflowAnimation() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="mx-auto mt-12 max-w-6xl rounded-[1.75rem] border border-slate-200/80 bg-white/70 p-3 shadow-[0_24px_70px_-42px_rgba(15,23,42,0.38)] backdrop-blur-xl sm:p-4">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-6">
        {steps.map(([label, Icon], index) => (
          <motion.div
            key={label}
            className="relative flex items-center gap-3 rounded-2xl border border-transparent px-3 py-3"
            animate={
              reduceMotion
                ? undefined
                : {
                    backgroundColor: ["rgba(248,250,252,0)", "rgba(239,246,255,1)", "rgba(248,250,252,0)"],
                    borderColor: ["rgba(226,232,240,0)", "rgba(147,197,253,.65)", "rgba(226,232,240,0)"],
                    y: [0, -2, 0],
                  }
            }
            transition={{ duration: 1.5, delay: index * 1.15, repeat: Infinity, repeatDelay: 5.4, ease: "easeInOut" }}
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
              <Icon className="h-4 w-4" />
            </span>
            <span className="text-xs font-semibold leading-4 text-slate-700">{label}</span>
            {index < steps.length - 1 ? (
              <motion.span
                className="absolute -right-2 top-1/2 z-10 hidden h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-blue-500 md:block"
                animate={reduceMotion ? undefined : { x: [-3, 5], opacity: [0, 1, 0] }}
                transition={{ duration: 1.1, delay: index * 1.15 + 0.5, repeat: Infinity, repeatDelay: 5.8 }}
              />
            ) : null}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

"use client";

import type { LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

export function FloatingCard({
  className,
  delay = 0,
  detail,
  icon: Icon,
  label,
  tone = "blue",
}: {
  className?: string;
  delay?: number;
  detail?: string;
  icon: LucideIcon;
  label: string;
  tone?: "blue" | "cyan" | "emerald";
}) {
  const reduceMotion = useReducedMotion();
  const tones = {
    blue: "bg-secondary/10 text-secondary",
    cyan: "bg-primary/10 text-primary",
    emerald: "bg-primary/10 text-primary",
  };

  return (
    <motion.div
      className={cn(
        "absolute z-20 flex items-center gap-2.5 rounded-2xl border border-white/80 bg-white/80 px-3 py-2.5 shadow-[0_18px_40px_-20px_rgba(15,23,42,0.35)] backdrop-blur-xl",
        className,
      )}
      initial={{ opacity: 0, scale: 0.88, y: 12 }}
      animate={
        reduceMotion
          ? { opacity: 1, scale: 1, y: 0 }
          : { opacity: 1, scale: 1, y: [0, -7, 0], rotate: [0, 0.5, 0] }
      }
      transition={{
        opacity: { duration: 0.45, delay },
        scale: { duration: 0.45, delay },
        y: { duration: 4.5 + delay, delay, repeat: Infinity, ease: "easeInOut" },
        rotate: { duration: 5.2 + delay, delay, repeat: Infinity, ease: "easeInOut" },
      }}
      whileHover={{ y: -9, scale: 1.04 }}
    >
      <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-xl", tones[tone])}>
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="block whitespace-nowrap text-xs font-semibold text-slate-800">{label}</span>
        {detail ? <span className="block whitespace-nowrap text-[10px] text-slate-500">{detail}</span> : null}
      </span>
    </motion.div>
  );
}

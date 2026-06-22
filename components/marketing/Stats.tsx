"use client";

import { motion } from "framer-motion";

import { AnimatedCounter } from "@/components/marketing/AnimatedCounter";

const stats = [
  { value: 50000, suffix: "+", label: "Contacts Processed" },
  { value: 99.9, decimals: 1, suffix: "%", label: "Duplicate Accuracy" },
  { value: 10, suffix: "x", label: "Faster than Manual Export" },
  { value: 8, suffix: "+", label: "Marketing Integrations" },
] as const;

export function Stats() {
  return (
    <motion.div
      className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-slate-200/80 pt-7 lg:grid-cols-4"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
    >
      {stats.map((stat) => (
        <motion.div key={stat.label} variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}>
          <p className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
            <AnimatedCounter value={stat.value} decimals={"decimals" in stat ? stat.decimals : 0} suffix={stat.suffix} />
          </p>
          <p className="mt-1 text-[11px] font-medium leading-4 text-slate-500">{stat.label}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}

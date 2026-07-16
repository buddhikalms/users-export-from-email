import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: string | number;
  detail?: string;
  icon: LucideIcon;
  tone?: "default" | "success" | "warning" | "danger";
};

const tones = {
  default: "bg-[#03B7B2]/10 text-[#027a76]",
  success: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  warning: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  danger: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
};

export function MetricCard({ label, value, detail, icon: Icon, tone = "default" }: MetricCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
        </div>
        <div className={cn("grid h-10 w-10 place-items-center rounded-md", tones[tone])}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      {detail ? <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{detail}</p> : null}
    </div>
  );
}

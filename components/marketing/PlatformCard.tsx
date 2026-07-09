import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";

export function PlatformCard({
  description,
  icon: Icon,
  title,
}: {
  description: string;
  icon: LucideIcon;
  title: string;
}) {
  return (
<<<<<<< HEAD
    <article className="group h-full rounded-[1.5rem] border border-slate-200/80 bg-white p-6 shadow-[0_16px_45px_-28px_rgba(15,23,42,0.3)] transition-all duration-300 hover:-translate-y-1.5 hover:border-secondary/25 hover:shadow-[0_22px_55px_-26px_rgba(0,127,212,0.3)] dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex items-start justify-between gap-4">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary/10 text-secondary transition-colors group-hover:bg-secondary group-hover:text-white dark:bg-secondary/10 dark:text-secondary">
          <Icon className="h-5 w-5" />
        </span>
        <ArrowUpRight className="h-5 w-5 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-secondary" />
=======
    <article className="group h-full rounded-[1.5rem] border border-slate-200/80 bg-white p-6 shadow-[0_16px_45px_-28px_rgba(15,23,42,0.3)] transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-blue/25 hover:shadow-[0_22px_55px_-26px_rgba(37,99,235,0.3)] dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex items-start justify-between gap-4">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-blue/10 text-brand-blue transition-colors group-hover:bg-brand-blue group-hover:text-white dark:bg-brand-blue/10 dark:text-brand-light-purple">
          <Icon className="h-5 w-5" />
        </span>
        <ArrowUpRight className="h-5 w-5 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand-blue" />
>>>>>>> 218bcf8 (feature : load balance)
      </div>
      <h3 className="mt-7 text-xl font-semibold text-slate-950 dark:text-white">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
    </article>
  );
}

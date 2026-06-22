import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";

export function UseCaseCard({
  description,
  icon: Icon,
  title,
}: {
  description: string;
  icon: LucideIcon;
  title: string;
}) {
  return (
    <article className="group flex h-full flex-col rounded-[1.35rem] border border-slate-200/80 bg-slate-50/70 p-5 transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-xl hover:shadow-slate-950/5 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]">
      <span className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-white">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-6 text-lg font-semibold text-slate-950 dark:text-white">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
      <ArrowRight className="mt-5 h-4 w-4 text-blue-600 transition-transform group-hover:translate-x-1" />
    </article>
  );
}

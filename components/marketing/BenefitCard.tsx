import type { LucideIcon } from "lucide-react";

export function BenefitCard({
  description,
  icon: Icon,
  index,
  title,
}: {
  description: string;
  icon: LucideIcon;
  index: number;
  title: string;
}) {
  return (
    <article className="h-full border-t border-slate-200 py-6 dark:border-white/10">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-[0.2em] text-slate-400">0{index}</span>
        <span className="grid h-10 w-10 place-items-center rounded-full bg-orange-50 text-orange-600 dark:bg-orange-400/10 dark:text-orange-300">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <h3 className="mt-8 text-xl font-semibold text-slate-950 dark:text-white">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
    </article>
  );
}

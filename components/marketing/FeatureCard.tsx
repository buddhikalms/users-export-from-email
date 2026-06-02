import type { LucideIcon } from "lucide-react";

export function FeatureCard({
  description,
  icon: Icon,
  title,
}: {
  description: string;
  icon: LucideIcon;
  title: string;
}) {
  return (
    <article
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none"
    >
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-400/10 dark:text-blue-300">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-slate-950 dark:text-white">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
    </article>
  );
}

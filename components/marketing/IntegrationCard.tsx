import { CheckCircle2, Clock3 } from "lucide-react";

export function IntegrationCard({
  description,
  name,
  status = "Available",
}: {
  description: string;
  name: string;
  status?: "Available" | "Coming Soon";
}) {
  const available = status === "Available";

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/60 dark:border-white/10 dark:bg-white/[0.04] dark:hover:shadow-none">
      <div className="flex items-start justify-between gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-slate-950 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">
          {name.slice(0, 2).toUpperCase()}
        </div>
        <span className={available ? "inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary dark:bg-primary/10 dark:text-primary" : "inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-white/10 dark:text-slate-300"}>
          {available ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}
          {status}
        </span>
      </div>
      <h3 className="mt-5 text-lg font-semibold text-slate-950 dark:text-white">{name}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
    </article>
  );
}

import { CheckCircle2, FileSpreadsheet, MailCheck, RefreshCcw, UsersRound } from "lucide-react";

const metrics = [
  ["Total contacts", "18,420", UsersRound],
  ["Folders synced", "64", MailCheck],
  ["Duplicates removed", "2,913", CheckCircle2],
  ["Recent exports", "27", FileSpreadsheet],
] as const;

const syncs = [
  ["Kit", "Synced 4,812 contacts", "Live"],
  ["Mailchimp", "Audience updated", "Ready"],
  ["Brevo", "Segment queued", "Queued"],
] as const;

export function DashboardMockup() {
  return (
    <div className="relative mx-auto w-full max-w-5xl">
      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-950/10 dark:border-white/10 dark:bg-slate-900">
        <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-950">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-white/10">
            <div>
              <div className="text-sm font-semibold text-slate-950 dark:text-white">Email Exporter Dashboard</div>
              <div className="mt-1 text-xs text-slate-500">Outlook folders to marketing-ready contacts</div>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
              <RefreshCcw className="h-3.5 w-3.5" />
              Auto sync active
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map(([label, value, Icon]) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
                <Icon className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                <div className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">{value}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-950 dark:text-white">Folder activity</h3>
                <span className="text-xs text-slate-500">Last 7 days</span>
              </div>
              <div className="mt-5 flex h-40 items-end gap-2">
                {[45, 70, 54, 88, 63, 96, 78, 52, 84, 69, 91, 74].map((height, index) => (
                  <div key={index} className="flex-1 rounded-t-lg bg-gradient-to-t from-blue-700 to-cyan-400" style={{ height: `${height}%` }} />
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
              <h3 className="text-sm font-semibold text-slate-950 dark:text-white">Platform sync status</h3>
              <div className="mt-4 grid gap-3">
                {syncs.map(([platform, detail, status]) => (
                  <div key={platform} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-900">
                    <div>
                      <div className="text-sm font-medium text-slate-950 dark:text-white">{platform}</div>
                      <div className="text-xs text-slate-500">{detail}</div>
                    </div>
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-600 shadow-sm dark:bg-white/10 dark:text-slate-300">
                      {status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

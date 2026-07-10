import {
  CheckCircle2,
  FileSpreadsheet,
  FolderTree,
  MailCheck,
  RefreshCcw,
  Search,
  ShieldCheck,
  Table2,
  UsersRound,
} from "lucide-react";

const metrics = [
  ["Contacts found", "18,420", UsersRound],
  ["Folders scanned", "64", FolderTree],
  ["Duplicates removed", "2,913", CheckCircle2],
  ["Exports created", "27", FileSpreadsheet],
] as const;

const contactRows = [
  ["Sarah Lee", "sarah@northstar.co", "Clients / 2026", "Forwarded sender"],
  ["Daniel Perera", "daniel@brightlabs.io", "Partnerships", "Direct email"],
  ["Maya Chen", "maya@launchdesk.com", "Leads / Webinar", "Reply-to"],
] as const;

const workflow = [
  ["Connect mailbox", "Outlook or IMAP account connected securely", MailCheck],
  ["Choose folders", "Scan Inbox, Leads, Clients, or any custom folder", FolderTree],
  ["Clean contacts", "Remove duplicates and normalize messy email values", ShieldCheck],
  ["Export anywhere", "Create Excel, CSV, JSON, Google Sheets, or sync to Kit", Table2],
] as const;

const destinations = [
  ["Google Sheets", "Created"],
  ["Excel workbook", "Ready"],
  ["Kit", "Synced"],
  ["Zoho Campaigns", "Queued"],
] as const;

export function DashboardMockup() {
  return (
    <div className="relative mx-auto w-full max-w-6xl">
      <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-2xl shadow-slate-950/10 dark:border-white/10 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4 dark:border-white/10 dark:bg-slate-950">
          <div>
            <div className="text-sm font-semibold text-slate-950 dark:text-white">
              OMAZYNC Dashboard
            </div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Scan mailbox folders, review contacts, then export or sync.
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary sm:flex dark:bg-primary/10 dark:text-primary">
            <RefreshCcw className="h-3.5 w-3.5" />
            Sync complete
          </div>
        </div>

        <div className="grid min-h-[520px] lg:grid-cols-[220px_1fr]">
          <aside className="border-b border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-950/70 lg:border-b-0 lg:border-r">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Workflow
            </div>
            <div className="mt-4 grid gap-2">
              {workflow.map(([title, detail, Icon], index) => (
                <div
                  key={title}
                  className={
                    index === 2
                      ? "rounded-xl border border-secondary/25 bg-secondary/10 p-3 dark:border-secondary/25 dark:bg-secondary/10"
                      : "rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/[0.04]"
                  }
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-secondary dark:text-secondary" />
                    <span className="text-sm font-semibold text-slate-950 dark:text-white">
                      {title}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-300">
                    {detail}
                  </p>
                </div>
              ))}
            </div>
          </aside>

          <div className="bg-slate-50 p-4 dark:bg-slate-950">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {metrics.map(([label, value, Icon]) => (
                <div
                  key={label}
                  className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]"
                >
                  <Icon className="h-4 w-4 text-secondary dark:text-secondary" />
                  <div className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">
                    {value}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {label}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
              <div className="rounded-xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.04]">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4 dark:border-white/10">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-950 dark:text-white">
                      Review extracted contacts
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Folder source, sender type, and cleanup status stay visible.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 dark:bg-white/10 dark:text-slate-300">
                    <Search className="h-3.5 w-3.5" />
                    Filtered: last 30 days
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[620px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Name</th>
                        <th className="px-4 py-3 font-semibold">Email</th>
                        <th className="px-4 py-3 font-semibold">Folder</th>
                        <th className="px-4 py-3 font-semibold">Source</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                      {contactRows.map(([name, email, folder, source]) => (
                        <tr key={email}>
                          <td className="px-4 py-3 font-medium text-slate-950 dark:text-white">
                            {name}
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                            {email}
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                            {folder}
                          </td>
                          <td className="px-4 py-3">
                            <span className="rounded-full bg-secondary/10 px-2.5 py-1 text-xs font-medium text-secondary dark:bg-secondary/10 dark:text-secondary">
                              {source}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
                  <h3 className="text-sm font-semibold text-slate-950 dark:text-white">
                    Export destinations
                  </h3>
                  <div className="mt-4 grid gap-3">
                    {destinations.map(([name, status]) => (
                      <div
                        key={name}
                        className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-950"
                      >
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          {name}
                        </span>
                        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-600 shadow-sm dark:bg-white/10 dark:text-slate-300">
                          {status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-primary/25 bg-primary/10 p-4 dark:border-primary/25 dark:bg-primary/10">
                  <div className="flex items-center gap-2 text-sm font-semibold text-primary dark:text-primary">
                    <CheckCircle2 className="h-4 w-4" />
                    Clean list ready
                  </div>
                  <p className="mt-2 text-sm leading-6 text-primary dark:text-primary">
                    Duplicate emails, mailto links, and forwarded-chain noise are
                    cleaned before anything reaches your spreadsheet or platform.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

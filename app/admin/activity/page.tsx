import { AdminTable, type AdminTableRow } from "@/components/admin/AdminTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "Never";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function formatLabel(value: string | null | undefined) {
  return value ? value.replace(/_/g, " ").toLowerCase() : "none";
}

export default async function AdminActivityPage() {
  const [syncRuns, exportRuns, backgroundJobs, apiLogs] = await Promise.all([
    db.syncRun.findMany({
      orderBy: { createdAt: "desc" },
      take: 150,
      include: { owner: { select: { name: true, email: true } } },
    }),
    db.exportRun.findMany({
      orderBy: { createdAt: "desc" },
      take: 150,
      include: { owner: { select: { name: true, email: true } } },
    }),
    db.backgroundJob.findMany({
      orderBy: { updatedAt: "desc" },
      take: 150,
      include: { owner: { select: { name: true, email: true } } },
    }),
    db.apiLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 150,
      include: { owner: { select: { name: true, email: true } } },
    }),
  ]);
  const syncRows: AdminTableRow[] = syncRuns.map((run) => ({
    id: run.id,
    search: [run.owner?.email, run.status, run.targetName, run.targetType, run.errorMessage].filter(Boolean).join(" "),
    cells: {
      target: run.targetName ?? run.targetType ?? "Sync run",
      owner: run.owner?.email ?? "System",
      status: formatLabel(run.status),
      messages: `${formatNumber(run.processedMessages)} / ${formatNumber(run.totalMessages)}`,
      contacts: formatNumber(run.contactsFound || run.totalContacts),
      created: formatDate(run.createdAt),
      error: run.errorMessage ?? "",
    },
  }));
  const exportRows: AdminTableRow[] = exportRuns.map((run) => ({
    id: run.id,
    search: [run.owner?.email, run.status, run.format, run.fileName, run.errorMessage].filter(Boolean).join(" "),
    cells: {
      file: run.fileName ?? `${run.format} export`,
      owner: run.owner?.email ?? "System",
      status: formatLabel(run.status),
      format: formatLabel(run.format),
      contacts: `${formatNumber(run.exportedContacts)} / ${formatNumber(run.totalContacts)}`,
      created: formatDate(run.createdAt),
      error: run.errorMessage ?? "",
    },
  }));
  const jobRows: AdminTableRow[] = backgroundJobs.map((job) => ({
    id: job.id,
    search: [job.owner?.email, job.status, job.type, job.error].filter(Boolean).join(" "),
    cells: {
      type: formatLabel(job.type),
      owner: job.owner?.email ?? "System",
      status: formatLabel(job.status),
      attempts: `${job.attempts}/${job.maxAttempts}`,
      runAfter: formatDate(job.runAfter),
      updated: formatDate(job.updatedAt),
      error: job.error ?? "",
    },
  }));
  const apiRows: AdminTableRow[] = apiLogs.map((log) => ({
    id: log.id,
    search: [log.owner?.email, log.action, log.status, log.message, log.platform].filter(Boolean).join(" "),
    cells: {
      action: log.action,
      owner: log.owner?.email ?? "System",
      status: `${log.status}${log.statusCode ? ` ${log.statusCode}` : ""}`,
      platform: formatLabel(log.platform),
      duration: log.durationMs ? `${formatNumber(log.durationMs)}ms` : "n/a",
      created: formatDate(log.createdAt),
      message: log.message ?? "",
    },
  }));

  return (
    <main className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Activity</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Filter sync runs, exports, background jobs, and API logs.
        </p>
      </div>

      <Card>
        <CardHeader><CardTitle>Sync Runs</CardTitle></CardHeader>
        <CardContent>
          <AdminTable
            columns={[
              { key: "target", label: "Target" },
              { key: "owner", label: "Owner" },
              { key: "status", label: "Status" },
              { key: "messages", label: "Messages" },
              { key: "contacts", label: "Contacts" },
              { key: "created", label: "Created" },
              { key: "error", label: "Error" },
            ]}
            emptyMessage="No sync runs match this filter."
            rows={syncRows}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Exports</CardTitle></CardHeader>
        <CardContent>
          <AdminTable
            columns={[
              { key: "file", label: "File" },
              { key: "owner", label: "Owner" },
              { key: "status", label: "Status" },
              { key: "format", label: "Format" },
              { key: "contacts", label: "Contacts" },
              { key: "created", label: "Created" },
              { key: "error", label: "Error" },
            ]}
            emptyMessage="No exports match this filter."
            rows={exportRows}
          />
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Background Jobs</CardTitle></CardHeader>
          <CardContent>
            <AdminTable
              columns={[
                { key: "type", label: "Type" },
                { key: "owner", label: "Owner" },
                { key: "status", label: "Status" },
                { key: "attempts", label: "Attempts" },
                { key: "runAfter", label: "Run After" },
                { key: "error", label: "Error" },
              ]}
              emptyMessage="No background jobs match this filter."
              rows={jobRows}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>API Logs</CardTitle></CardHeader>
          <CardContent>
            <AdminTable
              columns={[
                { key: "action", label: "Action" },
                { key: "owner", label: "Owner" },
                { key: "status", label: "Status" },
                { key: "platform", label: "Platform" },
                { key: "duration", label: "Duration" },
                { key: "message", label: "Message" },
              ]}
              emptyMessage="No API logs match this filter."
              rows={apiRows}
            />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

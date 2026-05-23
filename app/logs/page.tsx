import { LogsTable, type LogRow } from "@/components/tables/LogsTable";

const logs: LogRow[] = [
  { level: "Info", message: "Dashboard shell initialized", source: "UI", time: "Now" },
  { level: "Info", message: "Kit accounts API available", source: "API", time: "Now" },
];

export default function LogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Observability</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Logs</h1>
      </div>
      <LogsTable data={logs} />
    </div>
  );
}

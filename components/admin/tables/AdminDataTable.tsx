import { Badge } from "@/components/ui/badge";

type Column<T> = {
  key: keyof T;
  label: string;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
};

type AdminDataTableProps<T extends { id: string }> = {
  columns: Array<Column<T>>;
  rows: T[];
  empty: string;
};

export function StatusBadge({ value }: { value: string }) {
  const normalized = value.toLowerCase();
  const tone =
    normalized.includes("fail") || normalized.includes("suspend")
      ? "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300"
      : normalized.includes("active") || normalized.includes("healthy") || normalized.includes("complete")
        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
        : "border-slate-300 bg-slate-100 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300";

  return <Badge className={`rounded-md ${tone}`}>{value}</Badge>;
}

export function AdminDataTable<T extends { id: string }>({ columns, rows, empty }: AdminDataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-white/10 dark:bg-white/[0.04]">
            <tr>
              {columns.map((column) => (
                <th className="px-4 py-3 font-semibold" key={String(column.key)}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/10">
            {rows.length ? (
              rows.map((row) => (
                <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.04]" key={row.id}>
                  {columns.map((column) => (
                    <td className="px-4 py-3 align-middle" key={String(column.key)}>
                      {column.render ? column.render(row[column.key], row) : String(row[column.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-8 text-center text-slate-500" colSpan={columns.length}>
                  {empty}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

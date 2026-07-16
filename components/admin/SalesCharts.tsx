"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type SalesPoint = {
  month: string;
  payments: number;
  subscriptions: number;
};

type PlanPoint = {
  plan: string;
  count: number;
};

const planColors = ["#03B7B2", "#007FD4", "#15A39F", "#2B8CC8", "#0F766E"];

export function SalesCharts({
  planData,
  salesData,
}: {
  planData: PlanPoint[];
  salesData: SalesPoint[];
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
      <div className="rounded-3xl border border-border/70 bg-card/80 p-5 shadow-sm">
        <h2 className="text-xl font-semibold">Sales Activity</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Payment timestamps and subscription records by month.
        </p>
        <div className="mt-5 h-[320px]">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart data={salesData}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" tickLine={false} />
              <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  color: "hsl(var(--foreground))",
                }}
              />
              <Legend />
              <Bar dataKey="payments" fill="#03B7B2" name="Payments" radius={[8, 8, 0, 0]} />
              <Bar dataKey="subscriptions" fill="#007FD4" name="Subscriptions" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-3xl border border-border/70 bg-card/80 p-5 shadow-sm">
        <h2 className="text-xl font-semibold">Plans</h2>
        <p className="mt-1 text-sm text-muted-foreground">Current subscription mix.</p>
        <div className="mt-5 h-[320px]">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart data={planData} layout="vertical" margin={{ left: 18 }}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" horizontal={false} />
              <XAxis allowDecimals={false} type="number" stroke="hsl(var(--muted-foreground))" />
              <YAxis dataKey="plan" type="category" stroke="hsl(var(--muted-foreground))" width={92} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  color: "hsl(var(--foreground))",
                }}
              />
              <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                {planData.map((entry, index) => (
                  <Cell key={entry.plan} fill={planColors[index % planColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

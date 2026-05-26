"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type GrowthPoint = {
  month: string;
  contacts: number;
  exports?: number;
};

export type FolderPoint = {
  name: string;
  value: number;
};

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="grid h-[260px] place-items-center rounded-3xl border border-dashed border-border bg-secondary/30 text-sm text-muted-foreground">
      {label}
    </div>
  );
}

export function ContactGrowthChart({ data = [] }: { data?: GrowthPoint[] }) {
  if (data.length === 0) {
    return <EmptyChart label="No contact growth data yet" />;
  }

  return (
    <ResponsiveContainer height={300} width="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="contactGrowth" x1="0" x2="0" y1="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.32} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
        <YAxis stroke="hsl(var(--muted-foreground))" />
        <Tooltip
          contentStyle={{
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: 14,
            color: "hsl(var(--foreground))",
          }}
        />
        <Area
          dataKey="contacts"
          fill="url(#contactGrowth)"
          stroke="hsl(var(--primary))"
          strokeWidth={3}
          type="monotone"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function FolderActivityChart({ data = [] }: { data?: FolderPoint[] }) {
  if (data.length === 0) {
    return <EmptyChart label="No folder activity data yet" />;
  }

  return (
    <ResponsiveContainer height={260} width="100%">
      <BarChart data={data}>
        <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
        <YAxis stroke="hsl(var(--muted-foreground))" />
        <Tooltip
          contentStyle={{
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: 14,
            color: "hsl(var(--foreground))",
          }}
        />
        <Bar dataKey="value" fill="hsl(var(--accent))" radius={[10, 10, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

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

const growthData = [
  { month: "Jan", contacts: 420, exports: 120 },
  { month: "Feb", contacts: 680, exports: 180 },
  { month: "Mar", contacts: 930, exports: 240 },
  { month: "Apr", contacts: 1280, exports: 310 },
  { month: "May", contacts: 1640, exports: 390 },
  { month: "Jun", contacts: 2130, exports: 520 },
];

const folderData = [
  { name: "Inbox", value: 42 },
  { name: "Sales", value: 36 },
  { name: "Leads", value: 29 },
  { name: "Archive", value: 18 },
  { name: "Support", value: 12 },
];

export function ContactGrowthChart() {
  return (
    <ResponsiveContainer height={300} width="100%">
      <AreaChart data={growthData}>
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

export function FolderActivityChart() {
  return (
    <ResponsiveContainer height={260} width="100%">
      <BarChart data={folderData}>
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

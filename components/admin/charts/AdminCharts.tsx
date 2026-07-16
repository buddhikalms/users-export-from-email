"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ChartPoint = Record<string, string | number>;

export function AdminAreaChart({ data, dataKey }: { data: ChartPoint[]; dataKey: string }) {
  return (
    <ResponsiveContainer height={260} width="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="omazyncFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="5%" stopColor="#03B7B2" stopOpacity={0.34} />
            <stop offset="95%" stopColor="#007FD4" stopOpacity={0.04} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.24)" />
        <XAxis dataKey="label" tickLine={false} />
        <YAxis tickLine={false} width={38} />
        <Tooltip />
        <Area dataKey={dataKey} fill="url(#omazyncFill)" stroke="#03B7B2" strokeWidth={2} type="monotone" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function AdminBarChart({ data, dataKey }: { data: ChartPoint[]; dataKey: string }) {
  return (
    <ResponsiveContainer height={260} width="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.24)" />
        <XAxis dataKey="label" tickLine={false} />
        <YAxis tickLine={false} width={38} />
        <Tooltip />
        <Bar dataKey={dataKey} fill="#007FD4" radius={[5, 5, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function AdminLineChart({ data, dataKey }: { data: ChartPoint[]; dataKey: string }) {
  return (
    <ResponsiveContainer height={260} width="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.24)" />
        <XAxis dataKey="label" tickLine={false} />
        <YAxis tickLine={false} width={38} />
        <Tooltip />
        <Line dataKey={dataKey} dot={false} stroke="#03B7B2" strokeWidth={2} type="monotone" />
      </LineChart>
    </ResponsiveContainer>
  );
}

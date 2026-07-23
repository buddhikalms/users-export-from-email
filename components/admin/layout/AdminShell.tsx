"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Activity,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  Building2,
  Command,
  CreditCard,
  FileClock,
  Flag,
  Gauge,
  HardDrive,
  KeyRound,
  Layers3,
  ListChecks,
  LockKeyhole,
  Logs,
  MailCheck,
  Menu,
  Package,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  UsersRound,
  Webhook,
  Workflow,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AdminShellProps = {
  children: React.ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  };
};

const sections = [
  {
    label: "Overview",
    items: [
      { href: "/admin", label: "Admin Dashboard", icon: Gauge },
      { href: "/admin/live-operations", label: "Live Operations", icon: Activity },
      { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Customer Management",
    items: [
      { href: "/admin/users", label: "Users", icon: UsersRound },
      { href: "/admin/workspaces", label: "Workspaces", icon: Building2 },
      { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
      { href: "/admin/packages", label: "Packages", icon: Package },
      { href: "/admin/licences", label: "Licences", icon: KeyRound },
    ],
  },
  {
    label: "Processing",
    items: [
      { href: "/admin/queues", label: "Queue Control", icon: Layers3 },
      { href: "/admin/workers", label: "Workers", icon: Workflow },
      { href: "/admin/sync-jobs", label: "Sync Jobs", icon: MailCheck },
      { href: "/admin/queues/settings", label: "Queue Settings", icon: SlidersHorizontal },
      { href: "/admin/exports", label: "Export Jobs", icon: FileClock },
    ],
  },
  {
    label: "Integrations",
    items: [
      { href: "/admin/integrations", label: "Marketing Platforms", icon: Webhook },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/logs/audit", label: "Audit Logs", icon: Logs },
      { href: "/admin/security", label: "Security", icon: LockKeyhole },
      { href: "/admin/settings", label: "System Settings", icon: Settings },
      { href: "/admin/logs/system", label: "System Logs", icon: HardDrive },
      { href: "/admin/logs/api", label: "API Logs", icon: ListChecks },
      { href: "/admin/logs/security", label: "Security Logs", icon: ShieldCheck },
      { href: "/admin/settings#feature-flags", label: "Feature Flags", icon: Flag },
    ],
  },
];

function Sidebar({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  return (
    <aside
      className={cn(
        "flex h-full w-[17rem] shrink-0 flex-col border-r border-slate-200 bg-white text-slate-950 dark:border-white/10 dark:bg-[#071A2F] dark:text-white",
        className,
      )}
    >
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-5 dark:border-white/10">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-[linear-gradient(135deg,#03B7B2_0%,#007FD4_100%)] text-sm font-bold text-white">
          O
        </div>
        <div>
          <p className="text-sm font-semibold">OMAZYNC</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Admin Console</p>
        </div>
      </div>
      <nav className="dashboard-scrollbar flex-1 overflow-y-auto px-3 py-4">
        {sections.map((section) => (
          <div key={section.label} className="mb-5">
            <p className="mb-2 px-3 text-[0.68rem] font-semibold uppercase tracking-wider text-slate-400">
              {section.label}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => (
                <Link
                  className="flex h-9 items-center gap-3 rounded-md px-3 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                  href={item.href}
                  key={item.href}
                  onClick={onNavigate}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="truncate">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}

export function AdminShell({ children, user }: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F6FBFC] text-slate-950 dark:bg-[#050B16] dark:text-white">
      <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">
        <Sidebar />
      </div>
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="h-full w-[17rem]"
            onClick={(event) => event.stopPropagation()}
          >
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      ) : null}
      <div className="lg:pl-[17rem]">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-white/10 dark:bg-[#071A2F]/90">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <Button
              aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
              className="h-10 w-10 rounded-md px-0 lg:hidden"
              variant="outline"
              onClick={() => setMobileOpen((current) => !current)}
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
            <div className="hidden min-w-0 items-center gap-2 text-sm text-slate-500 md:flex">
              <span>Admin</span>
              <span>/</span>
              <span className="font-medium text-slate-900 dark:text-white">Operations</span>
            </div>
            <div className="ml-auto flex min-w-0 items-center gap-2">
              <div className="hidden h-10 w-[22rem] items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 sm:flex">
                <Search className="h-4 w-4" />
                <span className="truncate">Search users, jobs, workspaces...</span>
                <Command className="ml-auto h-3.5 w-3.5" />
              </div>
              <Badge className="hidden rounded-md border-[#03B7B2]/30 bg-[#03B7B2]/10 text-[#027a76] sm:inline-flex">
                {process.env.NODE_ENV ?? "development"}
              </Badge>
              <Badge className="rounded-md border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                Healthy
              </Badge>
              <Badge className="rounded-md border-[#007FD4]/30 bg-[#007FD4]/10 text-[#0069af] dark:text-sky-300">
                Queues online
              </Badge>
              <Button aria-label="Notifications" className="h-10 w-10 rounded-md px-0" variant="outline">
                <Bell className="h-4 w-4" />
              </Button>
              <div className="hidden min-w-0 rounded-md border border-slate-200 px-3 py-1.5 text-right dark:border-white/10 sm:block">
                <p className="truncate text-xs font-medium">{user.name ?? user.email ?? "Admin"}</p>
                <p className="text-[0.68rem] uppercase tracking-wide text-slate-500">{user.role ?? "ADMIN"}</p>
              </div>
            </div>
          </div>
        </header>
        <main className="min-h-[calc(100vh-4rem)] px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}

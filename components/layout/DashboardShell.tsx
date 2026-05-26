"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  BarChart3,
  Bell,
  Bot,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  CircleUserRound,
  Command,
  Download,
  FileSpreadsheet,
  FolderTree,
  History,
  LayoutDashboard,
  ListChecks,
  LogOut,
  MailCheck,
  Menu,
  Moon,
  Search,
  Settings,
  Shield,
  Sparkles,
  Sun,
  Tags,
  Workflow,
  UsersRound,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { signOut } from "next-auth/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/layout/ThemeProvider";
import { cn } from "@/lib/utils";

type SessionUser = {
  email?: string | null;
  name?: string | null;
  role?: string | null;
};

const navGroups = [
  {
    label: "Workspace",
    items: [
      { label: "Dashboard", href: "/", icon: LayoutDashboard },
      { label: "Email Sync", href: "/settings", icon: MailCheck },
      { label: "Folders", href: "/folders", icon: FolderTree },
      { label: "Contacts", href: "/contacts", icon: UsersRound },
      { label: "Exports", href: "/export", icon: FileSpreadsheet },
    ],
  },
  {
    label: "Marketing",
    items: [
      { label: "Integrations", href: "/integrations", icon: Sparkles },
      { label: "Kit Accounts", href: "/settings/kit", icon: CircleUserRound },
      { label: "Destinations", href: "/export", icon: Tags },
      { label: "Automation", href: "/automation", icon: Workflow },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Sync History", href: "/sync-history", icon: History },
      { label: "Analytics", href: "/analytics", icon: BarChart3 },
      { label: "AI Readiness", href: "/automation", icon: Bot },
      { label: "Settings", href: "/settings", icon: Settings },
      { label: "Logs", href: "/logs", icon: ListChecks },
    ],
  },
];

const quickActions = [
  { label: "Connect email account", href: "/settings" },
  { label: "Open integrations", href: "/integrations" },
  { label: "Build automation", href: "/automation" },
  { label: "Open analytics", href: "/analytics" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title="Toggle dark mode"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}

function ProfileMenu({
  placement = "down",
  user,
  compact = false,
}: {
  placement?: "down" | "up";
  user: SessionUser;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const label = user.name || user.email || "User";
  const initial = label.slice(0, 1).toUpperCase();

  return (
    <div className="relative">
      <button
        className={cn(
          "flex items-center gap-3 rounded-2xl border border-border bg-card px-3 py-2 text-left shadow-sm transition hover:bg-secondary",
          compact ? "h-10 w-10 justify-center rounded-full p-0" : "min-w-0",
        )}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-foreground text-xs font-semibold text-background">
          {initial}
        </span>
        {!compact ? (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{label}</span>
              <span className="block truncate text-xs text-muted-foreground">
                {user.role || "USER"}
              </span>
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          </>
        ) : null}
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={cn(
              "absolute right-0 z-50 w-72 overflow-hidden rounded-3xl border border-border bg-card shadow-2xl",
              placement === "up" ? "bottom-full mb-2" : "top-full mt-2",
            )}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
          >
            <div className="border-b border-border/70 p-4">
              <div className="font-semibold">{label}</div>
              <div className="mt-1 truncate text-sm text-muted-foreground">
                {user.email || "Signed in"}
              </div>
            </div>
            <div className="p-2">
              <div className="flex items-center gap-3 rounded-2xl px-3 py-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                Role: {user.role || "USER"}
              </div>
              <button
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm transition hover:bg-secondary"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function Sidebar({
  collapsed,
  mobileOpen,
  pathname,
  user,
  onToggle,
  onClose,
}: {
  collapsed: boolean;
  mobileOpen: boolean;
  pathname: string;
  user: SessionUser;
  onToggle: () => void;
  onClose: () => void;
}) {
  const sidebar = (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-border/80 bg-card/82 shadow-[0_18px_80px_hsl(var(--foreground)/0.08)] backdrop-blur-xl transition-all duration-300",
        collapsed ? "w-[84px]" : "w-[286px]",
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-border/70 px-4">
        <Link className="flex min-w-0 items-center gap-3" href="/">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <Activity className="h-5 w-5" />
          </div>
          {!collapsed ? (
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">BuddhiEmailExtractor</div>
              <div className="truncate text-xs text-muted-foreground">Lead extraction CRM</div>
            </div>
          ) : null}
        </Link>
        <Button className="hidden lg:inline-flex" size="sm" variant="ghost" onClick={onToggle}>
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        </Button>
        <Button className="lg:hidden" size="sm" variant="ghost" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <nav className="dashboard-scrollbar flex-1 overflow-y-auto px-3 py-5">
        <div className="space-y-6">
          {navGroups.map((group) => (
            <div key={group.label}>
              {!collapsed ? (
                <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {group.label}
                </div>
              ) : null}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(pathname, item.href);

                  return (
                    <Link
                      key={`${group.label}-${item.label}`}
                      className={cn(
                        "group flex h-11 items-center gap-3 rounded-2xl px-3 text-sm font-medium transition",
                        active
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                        collapsed ? "justify-center" : "",
                      )}
                      href={item.href as "/"}
                      onClick={onClose}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {!collapsed ? <span className="truncate">{item.label}</span> : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      <div className="border-t border-border/70 p-4">
        <ProfileMenu compact={collapsed} placement="up" user={user} />
      </div>
    </aside>
  );

  return (
    <>
      <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">{sidebar}</div>
      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm lg:hidden"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={onClose}
          >
            <motion.div
              animate={{ x: 0 }}
              className="h-full w-[286px]"
              exit={{ x: -320 }}
              initial={{ x: -320 }}
              onClick={(event) => event.stopPropagation()}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
            >
              {sidebar}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[60] flex items-start justify-center bg-foreground/35 px-4 pt-24 backdrop-blur-sm"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            animate={{ y: 0, scale: 1 }}
            className="w-full max-w-2xl overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
            exit={{ y: 20, scale: 0.98 }}
            initial={{ y: 20, scale: 0.98 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-border px-5 py-4">
              <Command className="h-5 w-5 text-muted-foreground" />
              <input
                autoFocus
                className="h-10 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                placeholder="Search actions, routes, and workflows..."
              />
              <kbd className="rounded-lg border border-border px-2 py-1 text-xs text-muted-foreground">
                Esc
              </kbd>
            </div>
            <div className="p-3">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm transition hover:bg-secondary"
                  onClick={() => {
                    router.push(action.href as "/");
                    onClose();
                  }}
                >
                  {action.label}
                  <span className="text-xs text-muted-foreground">Open</span>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function DashboardShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: SessionUser;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const activeLabel = useMemo(() => {
    for (const group of navGroups) {
      const active = group.items.find((item) => isActive(pathname, item.href));
      if (active) {
        return active.label;
      }
    }

    return "Dashboard";
  }, [pathname]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen(true);
      }

      if (event.key === "Escape") {
        setCommandOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="min-h-screen">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        pathname={pathname}
        user={user}
        onClose={() => setMobileOpen(false)}
        onToggle={() => setCollapsed((current) => !current)}
      />
      <div
        className={cn(
          "min-h-screen transition-[padding] duration-300",
          collapsed ? "lg:pl-[84px]" : "lg:pl-[286px]",
        )}
      >
        <header className="sticky top-0 z-30 border-b border-border/70 bg-background/75 backdrop-blur-xl">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <Button className="lg:hidden" size="sm" variant="outline" onClick={() => setMobileOpen(true)}>
              <Menu className="h-4 w-4" />
            </Button>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Workspace
              </div>
              <div className="truncate text-sm font-semibold">{activeLabel}</div>
            </div>
            <button
              className="hidden h-10 min-w-[320px] items-center gap-3 rounded-2xl border border-border bg-card px-4 text-sm text-muted-foreground shadow-sm transition hover:border-primary/40 md:flex"
              onClick={() => setCommandOpen(true)}
            >
              <Search className="h-4 w-4" />
              Search or press Ctrl K
            </button>
            <Badge className="hidden bg-accent/15 text-accent-foreground dark:text-accent sm:inline-flex">
              Sync ready
            </Badge>
            <Button size="sm" variant="outline">
              <Bell className="h-4 w-4" />
            </Button>
            <ThemeToggle />
            <div className="hidden sm:block">
              <ProfileMenu compact placement="down" user={user} />
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/export">
                <Download className="h-4 w-4" />
                Export
              </Link>
            </Button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
    </div>
  );
}

"use client";

import { usePathname } from "next/navigation";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { MarketingFooter } from "@/components/marketing/Footer";
import { MarketingHeader } from "@/components/marketing/Header";

type SessionUser = {
  email?: string | null;
  name?: string | null;
  role?: string | null;
};

const dashboardPrefixes = [
  "/dashboard",
  "/settings",
  "/folders",
  "/contacts",
  "/export",
  "/automation",
  "/assistant",
  "/sync-history",
  "/analytics",
  "/logs",
  "/results",
];

const plainAuthPrefixes = ["/login", "/register"];

function isDashboardPath(pathname: string) {
  return dashboardPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function isPlainAuthPath(pathname: string) {
  return plainAuthPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function AppChrome({
  children,
  user,
}: {
  children: React.ReactNode;
  user?: SessionUser | null;
}) {
  const pathname = usePathname();

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return children;
  }

  if (user && isDashboardPath(pathname)) {
    return <DashboardShell user={user}>{children}</DashboardShell>;
  }

  if (isPlainAuthPath(pathname)) {
    return children;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketingHeader signedIn={Boolean(user)} />
      {children}
      <MarketingFooter />
    </div>
  );
}

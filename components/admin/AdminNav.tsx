"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, CreditCard, LayoutDashboard, PackageCheck, Plug, UsersRound } from "lucide-react";

import { cn } from "@/lib/utils";

const adminLinks = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: UsersRound },
  { href: "/admin/plans", label: "Plans", icon: PackageCheck },
  { href: "/admin/billing", label: "Billing", icon: CreditCard },
  { href: "/admin/activity", label: "Activity", icon: Activity },
  { href: "/admin/integrations", label: "Integrations", icon: Plug },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 overflow-x-auto rounded-2xl border border-border bg-card/80 p-2 shadow-sm lg:flex-col lg:overflow-visible">
      {adminLinks.map((item) => {
        const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            className={cn(
              "inline-flex h-10 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground lg:w-full",
              active && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
            )}
            href={item.href}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

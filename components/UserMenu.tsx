"use client";

import Link from "next/link";
import { LogOut, Shield, User2 } from "lucide-react";
import { signOut } from "next-auth/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function UserMenu({
  name,
  email,
  role,
}: {
  name?: string | null;
  email?: string | null;
  role: "USER" | "ADMIN";
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="rounded-full border border-white/70 bg-white/80 px-4 py-2 text-sm shadow-sm">
        <div className="flex items-center gap-2 font-medium text-foreground">
          <User2 className="h-4 w-4 text-primary" />
          <span>{name || email}</span>
        </div>
        <div className="text-xs text-muted-foreground">{email}</div>
      </div>

      <Badge className="bg-primary/10">
        <Shield className="mr-1 h-3.5 w-3.5" />
        {role}
      </Badge>

      {role === "ADMIN" ? (
        <Button asChild size="sm" variant="outline">
          <Link href="/admin">Admin</Link>
        </Button>
      ) : null}

      <Button size="sm" variant="outline" onClick={() => signOut({ callbackUrl: "/login" })}>
        <LogOut className="h-4 w-4" />
        Sign Out
      </Button>
    </div>
  );
}

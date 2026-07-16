"use client";

import { Lock, ShieldCheck, Unlock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function VaultStatus({
  emailAccountCount,
  marketingAccountCount,
  hasVault,
  isUnlocked,
  autoLock,
  onAutoLockChange,
  onLock,
}: {
  emailAccountCount: number;
  marketingAccountCount: number;
  hasVault: boolean;
  isUnlocked: boolean;
  autoLock: number;
  onAutoLockChange: (minutes: number) => void;
  onLock: () => void;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <CardTitle>Vault Status</CardTitle>
          <p className="mt-2 text-sm text-muted-foreground">
            Encrypted at rest with AES-GCM 256-bit encryption and PBKDF2 key derivation.
          </p>
        </div>
        <Badge className={isUnlocked ? "bg-primary/10 text-primary" : "bg-muted"}>
          {isUnlocked ? "Unlocked" : hasVault ? "Locked" : "Not Set Up"}
        </Badge>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-[1fr_1fr_220px_auto]">
        <div className="rounded-2xl border border-border/70 bg-white/75 dark:bg-card/75 p-4">
          <ShieldCheck className="mb-2 h-4 w-4 text-primary" />
          <div className="text-2xl font-semibold">{emailAccountCount}</div>
          <div className="text-sm text-muted-foreground">Email accounts</div>
        </div>
        <div className="rounded-2xl border border-border/70 bg-white/75 dark:bg-card/75 p-4">
          <ShieldCheck className="mb-2 h-4 w-4 text-primary" />
          <div className="text-2xl font-semibold">{marketingAccountCount}</div>
          <div className="text-sm text-muted-foreground">Marketing accounts</div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="vault-auto-lock">
            Auto-lock
          </label>
          <select
            id="vault-auto-lock"
            className="flex h-11 w-full rounded-2xl border border-input bg-white/80 dark:bg-card/80 px-4 py-2 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            value={autoLock}
            onChange={(event) => onAutoLockChange(Number(event.target.value))}
          >
            <option value={5}>5 minutes</option>
            <option value={15}>15 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={60}>60 minutes</option>
          </select>
        </div>
        <Button disabled={!isUnlocked} variant="outline" onClick={onLock}>
          {isUnlocked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
          Lock
        </Button>
      </CardContent>
    </Card>
  );
}

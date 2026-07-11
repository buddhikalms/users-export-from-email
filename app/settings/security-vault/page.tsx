"use client";

import Link from "next/link";
import { useState } from "react";
import { ShieldAlert } from "lucide-react";

import { CredentialManager } from "@/components/vault/CredentialManager";
import { VaultSetup } from "@/components/vault/VaultSetup";
import { VaultStatus } from "@/components/vault/VaultStatus";
import { VaultUnlock } from "@/components/vault/VaultUnlock";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useVault } from "@/hooks/useVault";

export default function SecurityVaultPage() {
  const vault = useVault();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function withBusy(action: () => Promise<void>) {
    setBusy(true);
    setStatus(null);
    try {
      await action();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Vault action failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="w-full">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Settings
          </p>
          <h1 className="text-4xl">Security Vault</h1>
          <p className="max-w-3xl text-base leading-7 text-muted-foreground">
            Save Outlook, IMAP, Kit, Zoho Campaigns, and Brevo credentials in a
            client-side encrypted vault.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href="/settings">Email Settings</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/export">Exports</Link>
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <VaultStatus
          autoLock={vault.autoLock}
          emailAccountCount={vault.vaultData?.emailAccounts.length ?? 0}
          hasVault={vault.hasVault}
          isUnlocked={vault.isUnlocked}
          marketingAccountCount={vault.vaultData?.marketingAccounts.length ?? 0}
          onAutoLockChange={vault.setAutoLock}
          onLock={vault.lockVault}
        />

        <Alert className="border-primary/20 bg-primary/5">
          <ShieldAlert className="mb-2 h-4 w-4" />
          <AlertTitle>Server storage rule</AlertTitle>
          <AlertDescription>
            Vault API routes store only encrypted blob, salt, IV, KDF name, iteration
            count, and timestamps. Decrypted credentials are held in React state only
            while the vault is unlocked.
          </AlertDescription>
        </Alert>

        {vault.error || status ? (
          <Alert className="border-destructive/25 bg-destructive/5">
            <AlertTitle>Vault issue</AlertTitle>
            <AlertDescription>{status ?? vault.error}</AlertDescription>
          </Alert>
        ) : null}

        {vault.loading ? (
          <div className="rounded-[1.75rem] border border-dashed border-border bg-white/70 dark:bg-card/75 p-8 text-sm text-muted-foreground">
            Loading encrypted vault metadata...
          </div>
        ) : !vault.hasVault ? (
          <VaultSetup
            busy={busy}
            onSetup={(masterPassword) =>
              withBusy(async () => {
                await vault.setupVault(masterPassword);
              })
            }
          />
        ) : !vault.isUnlocked ? (
          <VaultUnlock
            busy={busy}
            onUnlock={(masterPassword) =>
              withBusy(async () => {
                await vault.unlockVault(masterPassword);
              })
            }
          />
        ) : vault.vaultData ? (
          <CredentialManager
            vaultData={vault.vaultData}
            onDeleteCredential={async (credentialId) => {
              await vault.deleteCredential(credentialId);
            }}
            onSave={async (vaultData) => {
              await vault.saveVault(vaultData);
            }}
          />
        ) : null}

        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle>Danger Zone</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              Deleting the vault removes the encrypted blob from the database. This does
              not reveal or recover any saved credential.
            </p>
            <Button
              disabled={!vault.hasVault || busy}
              variant="outline"
              onClick={() =>
                withBusy(async () => {
                  await vault.deleteVault();
                })
              }
            >
              Delete Vault
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

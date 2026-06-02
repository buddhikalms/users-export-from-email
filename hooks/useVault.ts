"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  decryptVaultData,
  encryptVaultData,
} from "@/lib/crypto/vault-crypto";
import { emptyVaultData, type EncryptedVaultRecord, type VaultData } from "@/types/vault";

const DEFAULT_VAULT_NAME = "Default Vault";
const DEFAULT_AUTO_LOCK_MINUTES = 15;
const VAULT_STATUS_EVENT = "buddhi-vault-status";

export function dispatchVaultStatus(isUnlocked: boolean) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(VAULT_STATUS_EVENT, { detail: { isUnlocked } }));
}

export function useVaultStatusBadge() {
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    function onStatus(event: Event) {
      const customEvent = event as CustomEvent<{ isUnlocked?: boolean }>;
      setIsUnlocked(Boolean(customEvent.detail?.isUnlocked));
    }

    window.addEventListener(VAULT_STATUS_EVENT, onStatus);
    return () => window.removeEventListener(VAULT_STATUS_EVENT, onStatus);
  }, []);

  return isUnlocked;
}

export function useVault(autoLockMinutes = DEFAULT_AUTO_LOCK_MINUTES) {
  const [vaultRecord, setVaultRecord] = useState<EncryptedVaultRecord | null>(null);
  const [vaultData, setVaultData] = useState<VaultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoLock, setAutoLock] = useState(autoLockMinutes);
  const masterPasswordRef = useRef<string | null>(null);
  const lockTimerRef = useRef<number | null>(null);

  const clearLockTimer = useCallback(() => {
    if (lockTimerRef.current) {
      window.clearTimeout(lockTimerRef.current);
      lockTimerRef.current = null;
    }
  }, []);

  const lockVault = useCallback(() => {
    clearLockTimer();
    masterPasswordRef.current = null;
    setVaultData(null);
    dispatchVaultStatus(false);
  }, [clearLockTimer]);

  const resetAutoLock = useCallback(() => {
    clearLockTimer();

    if (!masterPasswordRef.current || autoLock <= 0) {
      return;
    }

    lockTimerRef.current = window.setTimeout(() => {
      lockVault();
    }, autoLock * 60 * 1000);
  }, [autoLock, clearLockTimer, lockVault]);

  const loadVault = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/vault", { cache: "no-store" });
      const payload = (await response.json()) as {
        vault?: EncryptedVaultRecord | null;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to load encrypted vault.");
      }

      setVaultRecord(payload.vault ?? null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load vault.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadVault();
    return () => clearLockTimer();
  }, [clearLockTimer, loadVault]);

  useEffect(() => {
    if (!vaultData) {
      return;
    }

    const events = ["mousemove", "keydown", "click", "visibilitychange"];
    events.forEach((eventName) => window.addEventListener(eventName, resetAutoLock));
    resetAutoLock();

    return () => {
      events.forEach((eventName) => window.removeEventListener(eventName, resetAutoLock));
    };
  }, [resetAutoLock, vaultData]);

  const unlockVault = useCallback(
    async (masterPassword: string) => {
      if (!vaultRecord) {
        throw new Error("No vault exists yet.");
      }

      const decrypted = await decryptVaultData(
        vaultRecord.encryptedBlob,
        masterPassword,
        vaultRecord.salt,
        vaultRecord.iv,
        vaultRecord.iterations,
      );

      masterPasswordRef.current = masterPassword;
      setVaultData(decrypted);
      dispatchVaultStatus(true);
      resetAutoLock();
      return decrypted;
    },
    [resetAutoLock, vaultRecord],
  );

  const persistEncryptedVault = useCallback(
    async (data: VaultData, masterPassword: string, method: "POST" | "PUT") => {
      const encrypted = await encryptVaultData(data, masterPassword);
      const response = await fetch("/api/vault", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: vaultRecord?.name ?? DEFAULT_VAULT_NAME,
          ...encrypted,
        }),
      });
      const payload = (await response.json()) as {
        vault?: EncryptedVaultRecord;
        error?: string;
      };

      if (!response.ok || !payload.vault) {
        throw new Error(payload.error ?? "Unable to save encrypted vault.");
      }

      setVaultRecord(payload.vault);
      setVaultData(data);
      masterPasswordRef.current = masterPassword;
      dispatchVaultStatus(true);
      resetAutoLock();
      return payload.vault;
    },
    [resetAutoLock, vaultRecord?.name],
  );

  const setupVault = useCallback(
    async (masterPassword: string) => {
      return persistEncryptedVault(emptyVaultData(), masterPassword, "POST");
    },
    [persistEncryptedVault],
  );

  const saveVault = useCallback(
    async (data: VaultData) => {
      if (!masterPasswordRef.current) {
        throw new Error("Unlock the vault before saving credentials.");
      }

      return persistEncryptedVault(data, masterPasswordRef.current, vaultRecord ? "PUT" : "POST");
    },
    [persistEncryptedVault, vaultRecord],
  );

  const updateCredential = useCallback(
    async (updater: (current: VaultData) => VaultData) => {
      const current = vaultData ?? emptyVaultData();
      const next = updater(current);
      await saveVault(next);
      return next;
    },
    [saveVault, vaultData],
  );

  const deleteCredential = useCallback(
    async (credentialId: string) => {
      return updateCredential((current) => ({
        emailAccounts: current.emailAccounts.filter((account) => account.id !== credentialId),
        marketingAccounts: current.marketingAccounts.filter(
          (account) => account.id !== credentialId,
        ),
      }));
    },
    [updateCredential],
  );

  const deleteVault = useCallback(async () => {
    const response = await fetch("/api/vault", { method: "DELETE" });
    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      throw new Error(payload.error ?? "Unable to delete vault.");
    }

    lockVault();
    setVaultRecord(null);
  }, [lockVault]);

  return {
    autoLock,
    deleteCredential,
    deleteVault,
    error,
    hasVault: Boolean(vaultRecord),
    isUnlocked: Boolean(vaultData),
    loading,
    lockVault,
    reloadVault: loadVault,
    saveVault,
    setAutoLock,
    setupVault,
    unlockVault,
    updateCredential,
    vaultData,
    vaultRecord,
  };
}

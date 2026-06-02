"use client";

import type { ConnectionSettings } from "@/types/email";

let activeVaultConnection: ConnectionSettings | null = null;

export function setActiveVaultConnection(settings: ConnectionSettings) {
  activeVaultConnection = settings;
}

export function getActiveVaultConnection() {
  return activeVaultConnection;
}

export function clearActiveVaultConnection() {
  activeVaultConnection = null;
}

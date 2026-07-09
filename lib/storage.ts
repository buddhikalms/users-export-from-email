import type {
  ActiveConnection,
  ConnectionSettings,
  SyncDateRange,
  SyncResult,
} from "@/types/email";
import { setActiveVaultConnection } from "@/lib/vault-session";

const SELECTED_FOLDERS_KEY = "outlook-sync:selected-folders";
const SYNC_DATE_RANGE_KEY = "outlook-sync:date-range";
const SYNC_RESULT_KEY = "outlook-sync:sync-result";
const ACTIVE_CONNECTION_KEY = "outlook-sync:active-connection";

function canUseStorage() {
  return typeof window !== "undefined";
}

export function getStoredConnectionSettings(): ConnectionSettings | null {
  return null;
}

export function saveConnectionSettings(settings: ConnectionSettings) {
  if (!canUseStorage()) {
    return;
  }

  setActiveVaultConnection(settings);
  saveActiveConnection({
    mode: "manual",
    account: {
      email: settings.email,
      host: settings.host,
      port: settings.port,
      username: settings.username,
    },
  });
}

export function clearStoredConnectionSettings() {
  if (!canUseStorage()) {
    return;
  }

}

export function saveSelectedFolders(folders: string[]) {
  if (!canUseStorage()) {
    return;
  }

  window.sessionStorage.setItem(SELECTED_FOLDERS_KEY, JSON.stringify(folders));
}

export function getSelectedFolders(): string[] {
  if (!canUseStorage()) {
    return [];
  }

  const value = window.sessionStorage.getItem(SELECTED_FOLDERS_KEY);
  return value ? (JSON.parse(value) as string[]) : [];
}

export function saveSyncDateRange(range: SyncDateRange) {
  if (!canUseStorage()) {
    return;
  }

  window.sessionStorage.setItem(SYNC_DATE_RANGE_KEY, JSON.stringify(range));
}

export function getSyncDateRange(): SyncDateRange {
  if (!canUseStorage()) {
    return {};
  }

  const value = window.sessionStorage.getItem(SYNC_DATE_RANGE_KEY);
  return value ? (JSON.parse(value) as SyncDateRange) : {};
}

export function saveSyncResult(result: SyncResult) {
  if (!canUseStorage()) {
    return;
  }

  window.sessionStorage.setItem(SYNC_RESULT_KEY, JSON.stringify(result));
}

export function saveActiveConnection(connection: ActiveConnection) {
  if (!canUseStorage()) {
    return;
  }

  window.sessionStorage.setItem(ACTIVE_CONNECTION_KEY, JSON.stringify(connection));
}

export function getStoredActiveConnection(): ActiveConnection | null {
  if (!canUseStorage()) {
    return null;
  }

  const value = window.sessionStorage.getItem(ACTIVE_CONNECTION_KEY);
  return value ? (JSON.parse(value) as ActiveConnection) : null;
}

export function getStoredSyncResult(): SyncResult | null {
  if (!canUseStorage()) {
    return null;
  }

  const value = window.sessionStorage.getItem(SYNC_RESULT_KEY);
  return value ? (JSON.parse(value) as SyncResult) : null;
}

export function clearSyncArtifacts() {
  if (!canUseStorage()) {
    return;
  }

  window.sessionStorage.removeItem(SELECTED_FOLDERS_KEY);
  window.sessionStorage.removeItem(SYNC_DATE_RANGE_KEY);
  window.sessionStorage.removeItem(SYNC_RESULT_KEY);
  window.sessionStorage.removeItem(ACTIVE_CONNECTION_KEY);
}

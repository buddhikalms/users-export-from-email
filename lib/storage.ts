import type {
  ActiveConnection,
  ConnectionSettings,
  SyncResult,
} from "@/types/email";

const SESSION_SETTINGS_KEY = "outlook-sync:settings:session";
const PERSISTED_SETTINGS_KEY = "outlook-sync:settings:persistent";
const SELECTED_FOLDERS_KEY = "outlook-sync:selected-folders";
const SYNC_RESULT_KEY = "outlook-sync:sync-result";
const ACTIVE_CONNECTION_KEY = "outlook-sync:active-connection";

function canUseStorage() {
  return typeof window !== "undefined";
}

export function getStoredConnectionSettings(): ConnectionSettings | null {
  if (!canUseStorage()) {
    return null;
  }

  const persisted = window.localStorage.getItem(PERSISTED_SETTINGS_KEY);
  if (persisted) {
    return JSON.parse(persisted) as ConnectionSettings;
  }

  const sessionValue = window.sessionStorage.getItem(SESSION_SETTINGS_KEY);
  return sessionValue ? (JSON.parse(sessionValue) as ConnectionSettings) : null;
}

export function saveConnectionSettings(settings: ConnectionSettings) {
  if (!canUseStorage()) {
    return;
  }

  // Production note:
  // Replace browser storage with encrypted server-side storage or a secrets vault
  // if you need durable credential persistence across devices or sessions.
  window.sessionStorage.setItem(SESSION_SETTINGS_KEY, JSON.stringify(settings));

  if (settings.rememberPassword) {
    window.localStorage.setItem(PERSISTED_SETTINGS_KEY, JSON.stringify(settings));
  } else {
    window.localStorage.removeItem(PERSISTED_SETTINGS_KEY);
  }

  saveActiveConnection({
    mode: "manual",
    settings,
  });
}

export function clearStoredConnectionSettings() {
  if (!canUseStorage()) {
    return;
  }

  window.sessionStorage.removeItem(SESSION_SETTINGS_KEY);
  window.localStorage.removeItem(PERSISTED_SETTINGS_KEY);
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
  window.sessionStorage.removeItem(SYNC_RESULT_KEY);
  window.sessionStorage.removeItem(ACTIVE_CONNECTION_KEY);
}

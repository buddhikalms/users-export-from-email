export type SecurityType = "ssl_tls" | "starttls";

export interface ConnectionSettings {
  email: string;
  host: string;
  port: number;
  security: SecurityType;
  username: string;
  password: string;
  rememberPassword?: boolean;
}

export interface MailFolder {
  path: string;
  name: string;
  specialUse?: string | null;
}

export interface EmailContact {
  name: string;
  email: string;
  sourceFolder: string;
  firstSeen: string;
  lastSeen: string;
  emailCount: number;
}

export interface FolderSyncResult {
  folderPath: string;
  displayName: string;
  contacts: EmailContact[];
  totalMessagesScanned: number;
}

export interface CrossFolderDuplicate {
  email: string;
  name: string;
  folders: string[];
  totalEmailCount: number;
}

export interface SyncResult {
  folders: FolderSyncResult[];
  allContacts: EmailContact[];
  duplicatesAcrossFolders: CrossFolderDuplicate[];
}

export type LastSeenFilterMode = "all" | "before" | "after";

export interface LastSeenFilter {
  mode: LastSeenFilterMode;
  date?: string;
}

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
  delimiter?: string;
  specialUse?: string | null;
}

export interface EmailContact {
  name: string;
  email: string;
  sourceFolder: string;
  sourceType: string;
  forwardedBy: string;
  originalSender: string;
  subject: string;
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

export interface SyncDateRange {
  since?: string;
  before?: string;
}

export interface SavedEmailAccountSummary {
  id: string;
  label: string;
  email: string;
  host: string;
  port: number;
  security: SecurityType;
  username: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ActiveConnection =
  | {
      mode: "manual";
      account: {
        email: string;
        host: string;
        port: number;
        username: string;
      };
    }
  | {
      mode: "saved";
      account: SavedEmailAccountSummary;
    }
  | {
      mode: "vault";
      account: {
        id: string;
        name: string;
        email: string;
        host: string;
        port: number;
        username: string;
      };
    };

export type LastSeenFilterMode = "all" | "before" | "after";

export interface LastSeenFilter {
  mode: LastSeenFilterMode;
  date?: string;
}

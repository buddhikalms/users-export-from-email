import type { EmailContact } from "@/types/email";

export interface KitTag {
  id: string;
  name: string;
}

export interface KitForm {
  id: string;
  name: string;
  type?: string | null;
  archived?: boolean;
}

export interface KitFolderTagMapping {
  folderPath: string;
  tagId: string;
  tagName: string;
}

export interface KitSettingsSummary {
  connected: boolean;
  apiVersion?: "v4" | "v3";
  defaultTagId?: string | null;
  defaultFormId?: string | null;
  folderTagMappings: KitFolderTagMapping[];
  updatedAt?: string | null;
}

export interface KitPreparedContact {
  email: string;
  firstName: string;
  sourceFolders: string[];
  sourceTypes: string[];
  tagIds: string[];
  formId?: string;
  contact: EmailContact;
}

export interface KitSyncSummary {
  totalContacts: number;
  uploaded: number;
  skippedDuplicates: number;
  invalidEmails: number;
  ignoredEmails: number;
  failedUploads: number;
  retried: number;
  logs: string[];
}

import { ImapFlow } from "imapflow";

import {
  buildAllContacts,
  collectContactsFromEnvelope,
  createMutableContactMap,
  finalizeFolderContacts,
} from "@/lib/email-parser";
import type {
  ConnectionSettings,
  FolderSyncResult,
  MailFolder,
  SyncResult,
} from "@/types/email";

function toSafeErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message.replace(/user=.*?(,|$)/gi, "").trim();
  }

  return "An unexpected IMAP error occurred.";
}

function getImapClient(settings: ConnectionSettings) {
  const connectTimeout = Number(process.env.IMAP_CONNECT_TIMEOUT_MS ?? "20000");
  const socketTimeout = Number(process.env.IMAP_SOCKET_TIMEOUT_MS ?? "45000");

  return new ImapFlow({
    host: settings.host,
    port: settings.port,
    secure: settings.security === "ssl_tls",
    doSTARTTLS: settings.security === "starttls",
    auth: {
      user: settings.username,
      pass: settings.password,
    },
    clientInfo: {
      name: "Outlook Sync Exporter",
      version: "1.0.0",
    },
    connectionTimeout: connectTimeout,
    socketTimeout,
  });
}

async function withImapClient<T>(
  settings: ConnectionSettings,
  callback: (client: ImapFlow) => Promise<T>,
) {
  const client = getImapClient(settings);

  try {
    await client.connect();
    return await callback(client);
  } catch (error) {
    throw new Error(toSafeErrorMessage(error));
  } finally {
    try {
      await client.logout();
    } catch {
      // Ignore logout errors during cleanup.
    }
  }
}

function normalizeFolderName(path: string, name?: string) {
  return name?.trim() || path;
}

export async function testImapConnection(settings: ConnectionSettings) {
  return withImapClient(settings, async (client) => {
    await client.list();

    return {
      success: true,
      message: "Connection established successfully.",
    };
  });
}

export async function fetchMailFolders(
  settings: ConnectionSettings,
): Promise<MailFolder[]> {
  return withImapClient(settings, async (client) => {
    const list = await client.list();

    return list
      .map((folder) => ({
        path: folder.path,
        name: normalizeFolderName(folder.path, folder.name),
        specialUse: folder.specialUse ?? null,
      }))
      .sort((left, right) => {
        if (left.specialUse === "\\Inbox") {
          return -1;
        }

        if (right.specialUse === "\\Inbox") {
          return 1;
        }

        return left.name.localeCompare(right.name);
      });
  });
}

export async function syncSelectedFolders(
  settings: ConnectionSettings,
  folderPaths: string[],
): Promise<SyncResult> {
  return withImapClient(settings, async (client) => {
    const folderResults: FolderSyncResult[] = [];

    for (const folderPath of folderPaths) {
      const mailbox = await client.mailboxOpen(folderPath, { readOnly: true });
      const contactMap = createMutableContactMap();

      if (mailbox.exists > 0) {
        // Production note:
        // For very large mailboxes, add date filters or chunked UID ranges here.
        for await (const message of client.fetch("1:*", {
          envelope: true,
          internalDate: true,
        })) {
          collectContactsFromEnvelope(
            contactMap,
            message.envelope,
            normalizeFolderName(folderPath),
            message.internalDate ?? undefined,
          );
        }
      }

      folderResults.push({
        folderPath,
        displayName: normalizeFolderName(folderPath),
        contacts: finalizeFolderContacts(contactMap),
        totalMessagesScanned: mailbox.exists,
      });
    }

    const { allContacts, duplicatesAcrossFolders } = buildAllContacts(folderResults);

    return {
      folders: folderResults,
      allContacts,
      duplicatesAcrossFolders,
    };
  });
}

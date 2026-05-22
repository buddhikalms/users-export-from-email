import { ImapFlow } from "imapflow";

import {
  buildAllContacts,
  collectContactsFromForwardedBody,
  collectContactsFromEnvelope,
  createMutableContactMap,
  finalizeFolderContacts,
} from "@/lib/email-parser";
import { extractTextFromRawMessage } from "@/lib/forwarded-email-parser";
import type {
  ConnectionSettings,
  FolderSyncResult,
  MailFolder,
  SyncResult,
} from "@/types/email";

export class ImapConnectionError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 500,
  ) {
    super(message);
    this.name = "ImapConnectionError";
  }
}

function getImapErrorDetails(error: unknown) {
  return error as {
    authenticationFailed?: boolean;
    code?: string;
    response?: string;
    responseText?: string;
    serverResponseCode?: string;
    message?: string;
  };
}

function toSafeImapError(error: unknown) {
  const details = getImapErrorDetails(error);
  const rawMessage = error instanceof Error ? error.message : details.message;
  const responseText = details.responseText ?? details.response ?? "";
  const responseCode = details.serverResponseCode ?? details.code ?? "";
  const isAuthFailure =
    details.authenticationFailed === true ||
    responseCode.toUpperCase() === "AUTHENTICATIONFAILED" ||
    /AUTHENTICATIONFAILED|Invalid credentials/i.test(responseText);

  if (isAuthFailure) {
    return new ImapConnectionError(
      "Authentication failed. Check that the username is the full email address, IMAP access is enabled for this mailbox, and the password is correct. For Zoho accounts with 2FA, SAML, or federated login, use a Zoho application-specific password.",
      401,
    );
  }

  if (rawMessage) {
    return new ImapConnectionError(
      rawMessage.replace(/user=.*?(,|$)/gi, "").trim(),
    );
  }

  return new ImapConnectionError("An unexpected IMAP error occurred.");
}

export function getImapErrorStatus(error: unknown) {
  return error instanceof ImapConnectionError ? error.statusCode : 500;
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
      name: "Email Contact Exporter",
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
    throw toSafeImapError(error);
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
  ignoredEmails: string[] = [],
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
          source: true,
        })) {
          const sourceFolder = normalizeFolderName(folderPath);
          collectContactsFromEnvelope(
            contactMap,
            message.envelope,
            sourceFolder,
            message.internalDate ?? undefined,
            ignoredEmails,
          );
          collectContactsFromForwardedBody(
            contactMap,
            extractTextFromRawMessage(message.source),
            message.envelope,
            sourceFolder,
            message.internalDate ?? undefined,
            ignoredEmails,
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

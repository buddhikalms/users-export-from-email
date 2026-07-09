import { setTimeout as sleep } from "node:timers/promises";
import { Worker, type Job } from "bullmq";
import { ImapFlow } from "imapflow";

import { getRedisConnectionOptions, EMAIL_SYNC_QUEUE_NAME } from "@/lib/queue";
import type { EmailSyncJobData } from "@/lib/sync-jobs";
import { persistSyncedContacts } from "@/lib/contact-store";
import { db } from "@/lib/db";
import {
  buildAllContacts,
  collectContactsFromEnvelope,
  collectContactsFromForwardedBody,
  createMutableContactMap,
  finalizeFolderContacts,
} from "@/lib/email-parser";
import { extractTextFromRawMessage } from "@/lib/forwarded-email-parser";
import { getSavedAccountSettings } from "@/lib/server-accounts";
import type { ConnectionSettings, FolderSyncResult, SyncDateRange, SyncResult } from "@/types/email";

const BATCH_SIZE = Number(process.env.EMAIL_SYNC_IMAP_BATCH_SIZE ?? "100");
const STALLED_INTERVAL_MS = Number(process.env.EMAIL_SYNC_STALLED_INTERVAL_MS ?? "30000");
const LOCK_DURATION_MS = Number(process.env.EMAIL_SYNC_LOCK_DURATION_MS ?? "120000");

function normalizeFolderName(path: string, name?: string) {
  return name?.trim() || path;
}

function shouldFetchBody(subject: string | null | undefined, extractForwardedChains: boolean) {
  if (!extractForwardedChains) {
    return false;
  }

  return /(^|\s)(fw|fwd|forwarded)\s*:/i.test(subject ?? "");
}

function buildSearchQuery(dateRange: SyncDateRange = {}) {
  return {
    all: true,
    ...(dateRange.since ? { since: dateRange.since } : {}),
    ...(dateRange.before ? { before: dateRange.before } : {}),
  };
}

function chunkNumbers(values: number[], size: number) {
  const chunks: number[][] = [];
  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size));
  }
  return chunks;
}

function createImapClient(settings: ConnectionSettings) {
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
      name: "Omazync Background Sync",
      version: "1.0.0",
    },
    connectionTimeout: Number(process.env.IMAP_CONNECT_TIMEOUT_MS ?? "20000"),
    socketTimeout: Number(process.env.IMAP_SOCKET_TIMEOUT_MS ?? "45000"),
  });
}

async function assertNotCancelled(syncRunId: string) {
  const syncRun = await db.syncRun.findUnique({
    where: { id: syncRunId },
    select: { cancelRequested: true, status: true },
  });

  if (syncRun?.cancelRequested || syncRun?.status === "CANCELLED") {
    throw new Error("SYNC_CANCELLED");
  }
}

async function updateProgress(
  syncRunId: string,
  data: {
    currentFolder?: string | null;
    totalMessages?: number;
    processedMessages?: number;
    contactsFound?: number;
    duplicatesRemoved?: number;
  },
) {
  await db.syncRun.update({
    where: { id: syncRunId },
    data,
  });
}

async function fetchForwardedSource(client: ImapFlow, uid: number) {
  const message = await client.fetchOne(
    String(uid),
    { source: true },
    { uid: true } as Parameters<ImapFlow["fetchOne"]>[2],
  );

  return message && message.source ? extractTextFromRawMessage(message.source) : "";
}

async function scanFolder(input: {
  client: ImapFlow;
  folderPath: string;
  ignoredEmails: string[];
  job: Job<EmailSyncJobData>;
  processedMessages: number;
  syncRunId: string;
  totalMessages: number;
  extractForwardedChains: boolean;
  dateRange?: SyncDateRange;
}) {
  const mailbox = await input.client.mailboxOpen(input.folderPath, { readOnly: true });
  const displayName = normalizeFolderName(input.folderPath);
  const contactMap = createMutableContactMap();
  let processedMessages = input.processedMessages;
  const matchingUids =
    mailbox.exists > 0
      ? await input.client.search(buildSearchQuery(input.dateRange), { uid: true })
      : [];
  const uids = Array.isArray(matchingUids) ? matchingUids : [];

  await updateProgress(input.syncRunId, {
    currentFolder: displayName,
    totalMessages: input.totalMessages,
    processedMessages,
  });

  for (const chunk of chunkNumbers(uids, BATCH_SIZE)) {
    await assertNotCancelled(input.syncRunId);

    for await (const message of input.client.fetch(chunk.join(","), {
      envelope: true,
      internalDate: true,
      uid: true,
    }, { uid: true })) {
      const sourceFolder = displayName;
      collectContactsFromEnvelope(
        contactMap,
        message.envelope,
        sourceFolder,
        message.internalDate ?? undefined,
        input.ignoredEmails,
      );

      if (message.uid && shouldFetchBody(message.envelope?.subject, input.extractForwardedChains)) {
        const body = await fetchForwardedSource(input.client, message.uid);
        collectContactsFromForwardedBody(
          contactMap,
          body,
          message.envelope,
          sourceFolder,
          message.internalDate ?? undefined,
          input.ignoredEmails,
        );
      }

      processedMessages += 1;
    }

    const contactsFound = finalizeFolderContacts(contactMap).length;
    await updateProgress(input.syncRunId, {
      processedMessages,
      contactsFound,
    });
    await input.job.updateProgress({
      currentFolder: displayName,
      processedMessages,
      totalMessages: input.totalMessages,
      contactsFound,
    });
  }

  return {
    result: {
      folderPath: input.folderPath,
      displayName,
      contacts: finalizeFolderContacts(contactMap),
      totalMessagesScanned: uids.length,
    } satisfies FolderSyncResult,
    processedMessages,
  };
}

async function runEmailSync(job: Job<EmailSyncJobData>) {
  const { syncRunId, userId, savedAccountId, folders, extractForwardedChains, dateRange } = job.data;
  let client: ImapFlow | null = null;

  try {
    await db.syncRun.update({
      where: { id: syncRunId },
      data: {
        status: "RUNNING",
        startedAt: new Date(),
        errorMessage: null,
      },
    });

    const [settings, ignoredEmails] = await Promise.all([
      getSavedAccountSettings(userId, savedAccountId),
      db.ignoredEmail.findMany({
        where: { ownerId: userId },
        select: { email: true },
      }),
    ]);

    client = createImapClient(settings);
    await client.connect();

    let totalMessages = 0;
    for (const folderPath of folders) {
      await assertNotCancelled(syncRunId);
      await client.mailboxOpen(folderPath, { readOnly: true });
      const matchingUids = await client.search(buildSearchQuery(dateRange), { uid: true });
      totalMessages += Array.isArray(matchingUids) ? matchingUids.length : 0;
    }

    await updateProgress(syncRunId, { totalMessages });

    let processedMessages = 0;
    const folderResults: FolderSyncResult[] = [];
    for (const folderPath of folders) {
      const scanned = await scanFolder({
        client,
        folderPath,
        ignoredEmails: ignoredEmails.map((item) => item.email),
        job,
        processedMessages,
        syncRunId,
        totalMessages,
        extractForwardedChains,
        dateRange,
      });
      processedMessages = scanned.processedMessages;
      folderResults.push(scanned.result);
    }

    const built = buildAllContacts(folderResults);
    const syncResult: SyncResult = {
      folders: folderResults,
      allContacts: built.allContacts,
      duplicatesAcrossFolders: built.duplicatesAcrossFolders,
    };

    await persistSyncedContacts(userId, syncResult);

    await db.syncRun.update({
      where: { id: syncRunId },
      data: {
        status: "SUCCESS",
        currentFolder: null,
        processedMessages,
        contactsFound: syncResult.allContacts.length,
        duplicatesRemoved: syncResult.duplicatesAcrossFolders.length,
        totalContacts: syncResult.allContacts.length,
        uploaded: syncResult.allContacts.length,
        skippedDuplicates: syncResult.duplicatesAcrossFolders.length,
        completedAt: new Date(),
        finishedAt: new Date(),
      },
    });

    return {
      contactsFound: syncResult.allContacts.length,
      duplicatesRemoved: syncResult.duplicatesAcrossFolders.length,
      processedMessages,
      totalMessages,
    };
  } catch (error) {
    const cancelled = error instanceof Error && error.message === "SYNC_CANCELLED";
    await db.syncRun.update({
      where: { id: syncRunId },
      data: {
        status: cancelled ? "CANCELLED" : "FAILED",
        errorMessage: cancelled
          ? null
          : error instanceof Error
            ? error.message.slice(0, 8_000)
            : "Email sync failed.",
        completedAt: new Date(),
        finishedAt: new Date(),
      },
    });

    if (cancelled) {
      return { cancelled: true };
    }

    throw error;
  } finally {
    if (client) {
      try {
        await client.logout();
      } catch {
        // Logout failures should not hide the sync result.
      }
    }
  }
}

const worker = new Worker<EmailSyncJobData>(EMAIL_SYNC_QUEUE_NAME, runEmailSync, {
  connection: getRedisConnectionOptions(),
  concurrency: Number(process.env.EMAIL_SYNC_WORKER_CONCURRENCY ?? "2"),
  lockDuration: LOCK_DURATION_MS,
  stalledInterval: STALLED_INTERVAL_MS,
  maxStalledCount: Number(process.env.EMAIL_SYNC_MAX_STALLED_COUNT ?? "1"),
});

worker.on("failed", (job, error) => {
  console.error(
    JSON.stringify({
      level: "error",
      event: "email-sync-worker.failed",
      jobId: job?.id,
      syncRunId: job?.data.syncRunId,
      error: error.message,
      timestamp: new Date().toISOString(),
    }),
  );
});

async function shutdown(signal: string) {
  console.info(
    JSON.stringify({
      level: "info",
      event: "email-sync-worker.shutdown",
      signal,
      timestamp: new Date().toISOString(),
    }),
  );

  await worker.close();
  await db.$disconnect();
  await sleep(50);
  process.exit(0);
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));

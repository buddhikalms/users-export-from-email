import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/auth";
import {
  getErrorStatus,
  getSafeErrorMessage,
  logApiEvent,
  rateLimit,
  readJsonWithLimit,
  timeOperation,
  withTimeout,
} from "@/lib/api-guard";
import { persistSyncedContacts } from "@/lib/contact-store";
import { getIgnoredEmailValues } from "@/lib/ignored-emails";
import { getImapErrorStatus, syncSelectedFolders } from "@/lib/imap";
import { resolveConnectionSettings } from "@/lib/imap-request";
import { completeSyncRun, failSyncRun, startSyncRun } from "@/lib/sync-history";
import { syncRequestSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const limited = rateLimit(request, { scope: "imap-sync", limit: 8, windowMs: 60_000 });
  if (limited) return limited;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let settings: Awaited<ReturnType<typeof resolveConnectionSettings>> | null = null;
  let syncRunId: string | null = null;

  try {
    const json = await readJsonWithLimit(request, 64_000);
    const parsed = syncRequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ??
            "Invalid sync request. Check your selected folders and settings.",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    settings = await resolveConnectionSettings(parsed.data, session.user.id);
    const syncRun = await startSyncRun({
      ownerId: session.user.id,
      targetName: parsed.data.folders.join(", "),
      targetType: "MAILBOX_SYNC",
    });
    syncRunId = syncRun.id;
    const ignoredEmails = await getIgnoredEmailValues(session.user.id);
    const syncResult = await timeOperation(
      "imap.sync",
      { userId: session.user.id, folderCount: parsed.data.folders.length, syncRunId },
      () =>
        withTimeout(
          syncSelectedFolders(settings!, parsed.data.folders, ignoredEmails),
          Number(process.env.IMAP_SYNC_TIMEOUT_MS ?? "120000"),
        ),
    );
    await timeOperation(
      "contacts.persist",
      { userId: session.user.id, contactCount: syncResult.allContacts.length, syncRunId },
      () => persistSyncedContacts(session.user.id, syncResult),
    );

    await completeSyncRun(syncRunId, {
      totalContacts: syncResult.allContacts.length,
      uploaded: syncResult.allContacts.length,
      skippedDuplicates: syncResult.duplicatesAcrossFolders.length,
    });

    settings = null;
    return NextResponse.json(syncResult, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    settings = null;
    await failSyncRun(syncRunId, error);
    const statusCode = getErrorStatus(error, getImapErrorStatus(error));
    logApiEvent("error", "imap.sync.failed", {
      userId: session.user.id,
      syncRunId,
      statusCode,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      { error: getSafeErrorMessage(error, "Failed to sync selected folders.") },
      { status: statusCode },
    );
  }
}

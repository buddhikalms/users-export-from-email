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
import { getKitCredentials } from "@/lib/kit-settings";
import { prepareContactsForKit, syncSubscribersToKit } from "@/lib/kit";
import { kitSyncRequestSchema } from "@/lib/validation";
import { completeSyncRun, failSyncRun, startSyncRun } from "@/lib/sync-history";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const limited = rateLimit(request, { scope: "kit-sync", limit: 12, windowMs: 60_000 });
  if (limited) return limited;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let syncRunId: string | null = null;

  try {
    const json = await readJsonWithLimit(request, 10 * 1024 * 1024);
    const parsed = kitSyncRequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid Kit sync request." },
        { status: 400 },
      );
    }

    const credentials = await getKitCredentials(session.user.id);
    const syncRun = await startSyncRun({ ownerId: session.user.id, platform: "KIT", targetName: "Default Kit account", targetType: "PLATFORM_SYNC" });
    syncRunId = syncRun.id;
    const prepared = prepareContactsForKit(parsed.data.syncResult, {
      defaultTagId: parsed.data.defaultTagId,
      defaultFormId: parsed.data.defaultFormId,
      folderTagMappings: parsed.data.folderTagMappings,
    });
    const syncSummary = await timeOperation(
      "kit.sync",
      { userId: session.user.id, contactCount: prepared.contacts.length, syncRunId },
      () => withTimeout(syncSubscribersToKit(credentials, prepared.contacts), 120_000),
    );

    await completeSyncRun(syncRunId, {
      totalContacts: prepared.summary.totalContacts,
      uploaded: syncSummary.uploaded,
      skippedDuplicates: prepared.summary.skippedDuplicates,
      failed: syncSummary.failedUploads + prepared.summary.invalidEmails,
    });

    return NextResponse.json({
      summary: {
        ...syncSummary,
        totalContacts: prepared.summary.totalContacts,
        skippedDuplicates: prepared.summary.skippedDuplicates,
        invalidEmails: prepared.summary.invalidEmails,
        ignoredEmails: prepared.summary.ignoredEmails,
      },
    });
  } catch (error) {
    await failSyncRun(syncRunId, error);
    logApiEvent("error", "kit.sync.failed", {
      userId: session.user.id,
      syncRunId,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { error: getSafeErrorMessage(error, "Unable to sync contacts to Kit.") },
      { status: getErrorStatus(error) },
    );
  }
}

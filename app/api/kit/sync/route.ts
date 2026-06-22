import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/auth";
import { getKitCredentials } from "@/lib/kit-settings";
import { prepareContactsForKit, syncSubscribersToKit } from "@/lib/kit";
import { kitSyncRequestSchema } from "@/lib/validation";
import { completeSyncRun, failSyncRun, startSyncRun } from "@/lib/sync-history";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let syncRunId: string | null = null;

  try {
    const json = await request.json();
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
    const syncSummary = await syncSubscribersToKit(credentials, prepared.contacts);

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
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to sync contacts to Kit." },
      { status: 500 },
    );
  }
}

import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/auth";
import { getIgnoredEmailValues } from "@/lib/ignored-emails";
import { getImapErrorStatus, syncSelectedFolders } from "@/lib/imap";
import { resolveConnectionSettings } from "@/lib/imap-request";
import { completeSyncRun, failSyncRun, startSyncRun } from "@/lib/sync-history";
import { syncRequestSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let settings: Awaited<ReturnType<typeof resolveConnectionSettings>> | null = null;
  let syncRunId: string | null = null;

  try {
    const json = await request.json();
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
    const syncResult = await syncSelectedFolders(
      settings,
      parsed.data.folders,
      ignoredEmails,
    );

    await completeSyncRun(syncRunId, {
      totalContacts: syncResult.allContacts.length,
      uploaded: syncResult.allContacts.length,
      skippedDuplicates: syncResult.duplicatesAcrossFolders.length,
    });

    settings = null;
    return NextResponse.json(syncResult);
  } catch (error) {
    settings = null;
    await failSyncRun(syncRunId, error);
    const message =
      error instanceof Error ? error.message : "Failed to sync selected folders.";

    return NextResponse.json({ error: message }, { status: getImapErrorStatus(error) });
  }
}

import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/auth";
import { prepareContactsForKit, syncSubscribersToKit } from "@/lib/kit";
import { kitVaultSyncRequestSchema } from "@/lib/validation";
import { completeSyncRun, failSyncRun, startSyncRun } from "@/lib/sync-history";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let credentials:
    | { apiVersion: "v4"; apiKey: string }
    | { apiVersion: "v3"; apiKey: string; apiSecret: string }
    | null = null;
  let syncRunId: string | null = null;

  try {
    const json = await request.json();
    const parsed = kitVaultSyncRequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid Kit sync request." },
        { status: 400 },
      );
    }

    credentials =
      parsed.data.credentials.apiVersion === "v3"
        ? {
            apiVersion: "v3",
            apiKey: parsed.data.credentials.apiKey,
            apiSecret: parsed.data.credentials.apiSecret ?? "",
          }
        : {
            apiVersion: "v4",
            apiKey: parsed.data.credentials.apiKey,
          };

    const syncRun = await startSyncRun({ ownerId: session.user.id, platform: "KIT", targetName: parsed.data.destinationName, targetType: parsed.data.destinationType });
    syncRunId = syncRun.id;

    const prepared = prepareContactsForKit(parsed.data.syncResult, {
      defaultTagId: parsed.data.destinationType === "tag" ? parsed.data.tagId : undefined,
      defaultFormId: parsed.data.destinationType === "form" ? parsed.data.formId : undefined,
      folderTagMappings: [],
    });
    const summary = await syncSubscribersToKit(credentials, prepared.contacts);

    await completeSyncRun(syncRunId, {
      totalContacts: prepared.summary.totalContacts,
      uploaded: summary.uploaded,
      skippedDuplicates: prepared.summary.skippedDuplicates,
      failed: summary.failedUploads + prepared.summary.invalidEmails,
    });

    credentials = null;

    return NextResponse.json({
      summary: {
        ...summary,
        kitAccountName: parsed.data.accountName,
        destinationName: parsed.data.destinationName,
        destinationType: parsed.data.destinationType,
        totalContacts: prepared.summary.totalContacts,
        skippedDuplicates: prepared.summary.skippedDuplicates,
        invalidEmails: prepared.summary.invalidEmails,
        ignoredEmails: prepared.summary.ignoredEmails,
      },
    });
  } catch (error) {
    credentials = null;
    await failSyncRun(syncRunId, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to sync contacts to Kit." },
      { status: 500 },
    );
  }
}

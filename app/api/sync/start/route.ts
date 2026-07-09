import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/auth";
import {
  getErrorStatus,
  getSafeErrorMessage,
  logApiEvent,
  rateLimit,
  readJsonWithLimit,
} from "@/lib/api-guard";
import { db } from "@/lib/db";
import { assertRedisAvailable } from "@/lib/queue";
import { enqueueEmailSyncJob, toPublicSyncStatus } from "@/lib/sync-jobs";
import { backgroundSyncStartSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const limited = rateLimit(request, { scope: "sync-start", limit: 12, windowMs: 60_000 });
  if (limited) return limited;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const json = await readJsonWithLimit(request, 64_000);
    const parsed = backgroundSyncStartSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message ?? "Invalid sync request.",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const account = await db.savedEmailAccount.findFirst({
      where: { id: parsed.data.savedAccountId, ownerId: session.user.id },
      select: { id: true, label: true },
    });

    if (!account) {
      return NextResponse.json({ error: "Saved account not found." }, { status: 404 });
    }

    try {
      await assertRedisAvailable();
    } catch (redisError) {
      return NextResponse.json(
        {
          error:
            redisError instanceof Error
              ? redisError.message
              : "Redis is unavailable. Start Redis before running background sync.",
        },
        { status: 503 },
      );
    }

    const syncRun = await db.syncRun.create({
      data: {
        ownerId: session.user.id,
        status: "QUEUED",
        targetType: "MAILBOX_SYNC",
        targetId: account.id,
        targetName: `${account.label}: ${parsed.data.folders.join(", ")}`,
        totalMessages: 0,
        processedMessages: 0,
        contactsFound: 0,
        duplicatesRemoved: 0,
        metadata: {
          folders: parsed.data.folders,
          extractForwardedChains: parsed.data.extractForwardedChains,
          dateRange: parsed.data.dateRange,
        },
      },
      select: { id: true, status: true },
    });

    const job = await enqueueEmailSyncJob({
      syncRunId: syncRun.id,
      userId: session.user.id,
      savedAccountId: account.id,
      folders: parsed.data.folders,
      extractForwardedChains: parsed.data.extractForwardedChains,
      dateRange: parsed.data.dateRange,
    });

    await db.syncRun.update({
      where: { id: syncRun.id },
      data: { jobId: job.id },
    });

    logApiEvent("info", "sync.start", {
      userId: session.user.id,
      syncRunId: syncRun.id,
      jobId: job.id,
      folderCount: parsed.data.folders.length,
    });

    return NextResponse.json(
      {
        jobId: job.id,
        syncRunId: syncRun.id,
        status: toPublicSyncStatus(syncRun.status),
      },
      { status: 202, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    logApiEvent("error", "sync.start.failed", {
      userId: session.user.id,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      { error: getSafeErrorMessage(error, "Unable to start sync.") },
      { status: getErrorStatus(error) },
    );
  }
}

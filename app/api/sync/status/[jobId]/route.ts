import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/auth";
import { db } from "@/lib/db";
import { getEmailSyncJob, toPublicSyncStatus } from "@/lib/sync-jobs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ jobId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { jobId } = await context.params;
  const syncRun = await db.syncRun.findFirst({
    where: {
      OR: [{ jobId }, { id: jobId }],
      ownerId: session.user.id,
    },
    select: {
      id: true,
      jobId: true,
      status: true,
      currentFolder: true,
      totalMessages: true,
      processedMessages: true,
      contactsFound: true,
      duplicatesRemoved: true,
      errorMessage: true,
      startedAt: true,
      finishedAt: true,
      createdAt: true,
      completedAt: true,
    },
  });

  if (!syncRun) {
    return NextResponse.json({ error: "Sync job not found." }, { status: 404 });
  }

  const job = syncRun.jobId ? await getEmailSyncJob(syncRun.jobId) : null;
  const totalMessages = syncRun.totalMessages;
  const processedMessages = syncRun.processedMessages;

  return NextResponse.json(
    {
      jobId: syncRun.jobId ?? syncRun.id,
      syncRunId: syncRun.id,
      queueState: job ? await job.getState() : null,
      status: toPublicSyncStatus(syncRun.status),
      currentFolder: syncRun.currentFolder,
      totalMessages,
      processedMessages,
      contactsFound: syncRun.contactsFound,
      duplicatesRemoved: syncRun.duplicatesRemoved,
      progressPercent:
        totalMessages > 0 ? Math.min(100, Math.round((processedMessages / totalMessages) * 100)) : 0,
      errorMessage: syncRun.errorMessage,
      startedAt: syncRun.startedAt?.toISOString() ?? null,
      finishedAt:
        syncRun.finishedAt?.toISOString() ??
        syncRun.completedAt?.toISOString() ??
        null,
      createdAt: syncRun.createdAt.toISOString(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

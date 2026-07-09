import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/auth";
import { logApiEvent, rateLimit } from "@/lib/api-guard";
import { db } from "@/lib/db";
import { getEmailSyncJob } from "@/lib/sync-jobs";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ jobId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const limited = rateLimit(request, { scope: "sync-cancel", limit: 20, windowMs: 60_000 });
  if (limited) return limited;

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
    select: { id: true, jobId: true, status: true },
  });

  if (!syncRun) {
    return NextResponse.json({ error: "Sync job not found." }, { status: 404 });
  }

  const job = syncRun.jobId ? await getEmailSyncJob(syncRun.jobId) : null;
  const jobState = job ? await job.getState() : null;

  if (job && ["waiting", "delayed", "prioritized", "paused"].includes(jobState ?? "")) {
    await job.remove();
    await db.syncRun.update({
      where: { id: syncRun.id },
      data: {
        status: "CANCELLED",
        cancelRequested: true,
        completedAt: new Date(),
        finishedAt: new Date(),
      },
    });
  } else {
    await db.syncRun.update({
      where: { id: syncRun.id },
      data: { cancelRequested: true },
    });
  }

  logApiEvent("info", "sync.cancel", {
    userId: session.user.id,
    syncRunId: syncRun.id,
    jobId: syncRun.jobId,
    jobState,
  });

  return NextResponse.json(
    {
      jobId: syncRun.jobId ?? syncRun.id,
      syncRunId: syncRun.id,
      status: jobState === "active" ? "running" : "cancelled",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/admin/require-admin";
import { rateLimit } from "@/lib/api-guard";
import { assertQueueName, getQueue } from "@/lib/queues/queue-service";

export async function GET(request: Request, { params }: { params: { queueName: string } }) {
  const limited = rateLimit(request, { scope: "admin:queue-detail", limit: 120, windowMs: 60_000 });
  if (limited) return limited;

  const admin = await requireAdminApi("queues:manage");
  if (!admin.ok) return admin.response;

  try {
    assertQueueName(params.queueName);
    const queue = getQueue(params.queueName);
    const [counts, jobs] = await Promise.all([
      queue.getJobCounts("waiting", "active", "delayed", "completed", "failed", "paused"),
      queue.getJobs(["waiting", "active", "failed", "delayed"], 0, 50),
    ]);
    await queue.close();
    return NextResponse.json({
      queue: params.queueName,
      counts,
      jobs: jobs.map((job) => ({
        id: job.id,
        name: job.name,
        timestamp: job.timestamp,
        attemptsMade: job.attemptsMade,
        progress: job.progress,
        failedReason: job.failedReason,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Unknown or unavailable queue" }, { status: 404 });
  }
}

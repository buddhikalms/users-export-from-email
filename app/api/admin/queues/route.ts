import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/admin/require-admin";
import { rateLimit } from "@/lib/api-guard";
import { getQueueSummaries } from "@/lib/queues/queue-service";

export async function GET(request: Request) {
  const limited = rateLimit(request, { scope: "admin:queues", limit: 120, windowMs: 60_000 });
  if (limited) return limited;

  const admin = await requireAdminApi("queues:manage");
  if (!admin.ok) return admin.response;

  return NextResponse.json({ queues: await getQueueSummaries() });
}

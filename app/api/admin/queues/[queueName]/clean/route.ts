import { NextResponse } from "next/server";

import { writeAdminAuditLog } from "@/lib/admin/audit-log";
import { requireAdminApi } from "@/lib/admin/require-admin";
import { assertQueueName, getQueue } from "@/lib/queues/queue-service";

export async function POST(_request: Request, { params }: { params: { queueName: string } }) {
  const admin = await requireAdminApi("queues:manage");
  if (!admin.ok) return admin.response;

  assertQueueName(params.queueName);
  const queue = getQueue(params.queueName);
  const [completed, failed] = await Promise.all([
    queue.clean(7 * 24 * 60 * 60 * 1000, 1000, "completed"),
    queue.clean(14 * 24 * 60 * 60 * 1000, 1000, "failed"),
  ]);
  await queue.close();
  await writeAdminAuditLog({
    adminUserId: admin.session.user.id,
    action: "queue.clean",
    resourceType: "queue",
    resourceId: params.queueName,
    after: { completed: completed.length, failed: failed.length },
  });

  return NextResponse.json({ ok: true, completed: completed.length, failed: failed.length });
}

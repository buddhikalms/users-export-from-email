import { NextResponse } from "next/server";

import { writeAdminAuditLog } from "@/lib/admin/audit-log";
import { requireAdminApi } from "@/lib/admin/require-admin";
import { assertQueueName, getQueue } from "@/lib/queues/queue-service";

export async function POST(_request: Request, { params }: { params: { queueName: string } }) {
  const admin = await requireAdminApi("queues:manage");
  if (!admin.ok) return admin.response;

  assertQueueName(params.queueName);
  const queue = getQueue(params.queueName);
  await queue.pause();
  await queue.close();
  await writeAdminAuditLog({ adminUserId: admin.session.user.id, action: "queue.pause", resourceType: "queue", resourceId: params.queueName });

  return NextResponse.json({ ok: true });
}

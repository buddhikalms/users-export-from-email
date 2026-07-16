import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/admin/require-admin";
import { db } from "@/lib/db";

export async function GET() {
  const admin = await requireAdminApi("workers:manage");
  if (!admin.ok) return admin.response;

  const workers = await db.workerHeartbeat.findMany({ orderBy: { lastHeartbeatAt: "desc" }, take: 100 });
  return NextResponse.json({ workers });
}

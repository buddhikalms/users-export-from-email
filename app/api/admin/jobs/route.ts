import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/admin/require-admin";
import { db } from "@/lib/db";

export async function GET() {
  const admin = await requireAdminApi("jobs:manage");
  if (!admin.ok) return admin.response;

  const [syncRuns, backgroundJobs] = await Promise.all([
    db.syncRun.findMany({ take: 50, orderBy: { createdAt: "desc" } }),
    db.backgroundJob.findMany({ take: 50, orderBy: { createdAt: "desc" } }),
  ]);
  return NextResponse.json({ syncRuns, backgroundJobs });
}

import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/admin/require-admin";
import { db } from "@/lib/db";

export async function GET() {
  const admin = await requireAdminApi("jobs:manage");
  if (!admin.ok) return admin.response;

  const exports = await db.exportRun.findMany({ take: 50, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ exports });
}

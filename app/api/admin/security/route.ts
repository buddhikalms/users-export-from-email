import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/admin/require-admin";
import { db } from "@/lib/db";

export async function GET() {
  const admin = await requireAdminApi("security:manage");
  if (!admin.ok) return admin.response;

  const events = await db.adminAuditLog.findMany({ take: 100, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ events });
}

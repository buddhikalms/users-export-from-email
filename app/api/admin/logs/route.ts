import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/admin/require-admin";
import { db } from "@/lib/db";

export async function GET() {
  const admin = await requireAdminApi("logs:view");
  if (!admin.ok) return admin.response;

  const [audit, api, incidents] = await Promise.all([
    db.adminAuditLog.findMany({ take: 50, orderBy: { createdAt: "desc" } }),
    db.apiLog.findMany({ take: 50, orderBy: { createdAt: "desc" } }),
    db.systemIncident.findMany({ take: 50, orderBy: { createdAt: "desc" } }),
  ]);
  return NextResponse.json({ audit, api, incidents });
}

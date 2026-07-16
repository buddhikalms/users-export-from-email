import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/admin/require-admin";
import { db } from "@/lib/db";

export async function GET() {
  const admin = await requireAdminApi("workspaces:manage");
  if (!admin.ok) return admin.response;

  const workspaces = await db.workspace.findMany({
    take: 50,
    orderBy: { updatedAt: "desc" },
    include: { organization: { select: { name: true, plan: true, owner: { select: { email: true } } } }, limitOverride: true },
  });
  return NextResponse.json({ workspaces });
}

import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/admin/require-admin";
import { db } from "@/lib/db";

export async function GET() {
  const admin = await requireAdminApi("users:manage");
  if (!admin.ok) return admin.response;

  const users = await db.user.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true, subscription: true },
  });
  return NextResponse.json({ users });
}

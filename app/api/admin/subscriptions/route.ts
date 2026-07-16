import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/admin/require-admin";
import { db } from "@/lib/db";

export async function GET() {
  const admin = await requireAdminApi("billing:manage");
  if (!admin.ok) return admin.response;

  const subscriptions = await db.subscription.findMany({
    take: 50,
    orderBy: { updatedAt: "desc" },
    include: { user: { select: { email: true, name: true } }, package: true, addons: true },
  });
  return NextResponse.json({ subscriptions });
}

import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/admin/require-admin";
import { db } from "@/lib/db";

export async function GET() {
  const admin = await requireAdminApi("licences:manage");
  if (!admin.ok) return admin.response;

  const licences = await db.licence.findMany({ take: 50, orderBy: { createdAt: "desc" }, include: { activations: true } });
  return NextResponse.json({ licences });
}

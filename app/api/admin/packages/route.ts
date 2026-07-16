import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/admin/require-admin";
import { db } from "@/lib/db";

export async function GET() {
  const admin = await requireAdminApi("billing:manage");
  if (!admin.ok) return admin.response;

  const packages = await db.package.findMany({ include: { features: true }, orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ packages });
}

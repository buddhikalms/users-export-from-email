import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/admin/require-admin";
import { db } from "@/lib/db";

export async function GET() {
  const admin = await requireAdminApi("settings:manage");
  if (!admin.ok) return admin.response;

  const [featureFlags, queueConfigurations] = await Promise.all([
    db.featureFlag.findMany({ orderBy: { key: "asc" } }),
    db.queueConfiguration.findMany({ orderBy: { queueName: "asc" } }),
  ]);
  return NextResponse.json({ featureFlags, queueConfigurations });
}

import { NextResponse } from "next/server";

import { getAdminOverview } from "@/lib/admin/metrics";
import { requireAdminApi } from "@/lib/admin/require-admin";
import { rateLimit } from "@/lib/api-guard";

export async function GET(request: Request) {
  const limited = rateLimit(request, { scope: "admin:overview", limit: 60, windowMs: 60_000 });
  if (limited) return limited;

  const admin = await requireAdminApi("admin:view");
  if (!admin.ok) return admin.response;

  return NextResponse.json(await getAdminOverview());
}

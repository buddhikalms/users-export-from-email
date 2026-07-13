import { NextResponse } from "next/server";

import { errorResponse, requireAdminSession } from "@/app/api/admin/paypal/_utils";
import { getPayPalSyncStatus } from "@/lib/paypal/sync";

export const runtime = "nodejs";

export async function GET() {
  const { response } = await requireAdminSession();
  if (response) return response;

  try {
    return NextResponse.json({ success: true, ...(await getPayPalSyncStatus()) });
  } catch (error) {
    return errorResponse(error, "Unable to load PayPal sync status.");
  }
}

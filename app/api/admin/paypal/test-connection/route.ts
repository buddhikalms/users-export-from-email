import { NextResponse } from "next/server";

import { errorResponse, requireAdminSession } from "@/app/api/admin/paypal/_utils";
import { testPayPalConnection } from "@/lib/paypal/sync";

export const runtime = "nodejs";

export async function POST() {
  const { response, session } = await requireAdminSession();
  if (response) return response;

  try {
    return NextResponse.json(await testPayPalConnection(session.user.id));
  } catch (error) {
    return errorResponse(error, "Unable to test PayPal connection.");
  }
}

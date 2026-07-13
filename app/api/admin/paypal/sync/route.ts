import { NextResponse } from "next/server";
import { z } from "zod";

import { errorResponse, requireAdminSession } from "@/app/api/admin/paypal/_utils";
import { synchronizePayPalPackages } from "@/lib/paypal/sync";

export const runtime = "nodejs";

const syncSchema = z.object({
  mode: z.enum(["sync", "products", "plans", "validate"]).default("sync"),
});

export async function POST(request: Request) {
  const { response, session } = await requireAdminSession();
  if (response) return response;

  const parsed = syncSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid sync mode." }, { status: 400 });
  }

  try {
    const report = await synchronizePayPalPackages({
      adminUserId: session.user.id,
      mode: parsed.data.mode,
    });
    return NextResponse.json(report, { status: report.success ? 200 : 207 });
  } catch (error) {
    return errorResponse(error, "Unable to synchronize PayPal plans.");
  }
}

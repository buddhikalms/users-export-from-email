import { NextResponse } from "next/server";
import { z } from "zod";

import { errorResponse, requireAdminSession } from "@/app/api/admin/paypal/_utils";
import { synchronizePayPalPackages } from "@/lib/paypal/sync";

export const runtime = "nodejs";

const paramsSchema = z.object({ packageId: z.string().trim().min(1) });
const syncSchema = z.object({
  mode: z.enum(["sync", "products", "plans", "validate"]).default("sync"),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ packageId: string }> },
) {
  const { response, session } = await requireAdminSession();
  if (response) return response;

  const parsedParams = paramsSchema.safeParse(await params);
  const parsedBody = syncSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsedParams.success || !parsedBody.success) {
    return NextResponse.json({ success: false, error: "Invalid package sync request." }, { status: 400 });
  }

  try {
    const report = await synchronizePayPalPackages({
      adminUserId: session.user.id,
      packageId: parsedParams.data.packageId,
      mode: parsedBody.data.mode,
    });
    return NextResponse.json(report, { status: report.success ? 200 : 207 });
  } catch (error) {
    return errorResponse(error, "Unable to synchronize PayPal package.");
  }
}

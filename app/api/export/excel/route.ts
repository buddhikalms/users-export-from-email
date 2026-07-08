import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/auth";
import {
  getErrorStatus,
  getSafeErrorMessage,
  logApiEvent,
  rateLimit,
  readJsonWithLimit,
  timeOperation,
  withTimeout,
} from "@/lib/api-guard";
import { createWorkbookBuffer } from "@/lib/excel";
import { recordCompletedExport } from "@/lib/export-history";
import { filterSyncResultByLastSeen } from "@/lib/sync-result";
import { exportExcelRequestSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const limited = rateLimit(request, { scope: "export-excel", limit: 12, windowMs: 60_000 });
  if (limited) return limited;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const json = await readJsonWithLimit(request, 10 * 1024 * 1024);
    const parsed = exportExcelRequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ??
            "Invalid export request. Sync data is missing or malformed.",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const filteredSyncResult = filterSyncResultByLastSeen(
      parsed.data.syncResult,
      parsed.data.filter,
    );
    const workbook = await timeOperation(
      "export.excel",
      { userId: session.user.id, contactCount: filteredSyncResult.allContacts.length },
      () => withTimeout(createWorkbookBuffer(filteredSyncResult), 60_000),
    );
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    const fileName = `omazync-email-contacts-${timestamp}.xlsx`;
    await recordCompletedExport({ ownerId: session.user.id, format: "EXCEL", totalContacts: filteredSyncResult.allContacts.length, fileName });

    return new NextResponse(workbook, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    logApiEvent("error", "export.excel.failed", {
      userId: session.user.id,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      { error: getSafeErrorMessage(error, "Failed to create Excel export.") },
      { status: getErrorStatus(error) },
    );
  }
}

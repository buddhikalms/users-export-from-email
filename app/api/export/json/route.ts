import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/auth";
import {
  getErrorStatus,
  getSafeErrorMessage,
  logApiEvent,
  rateLimit,
  readJsonWithLimit,
} from "@/lib/api-guard";
import { recordCompletedExport } from "@/lib/export-history";
import { filterSyncResultByLastSeen } from "@/lib/sync-result";
import { exportFileRequestSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const limited = rateLimit(request, { scope: "export-json", limit: 20, windowMs: 60_000 });
  if (limited) return limited;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const json = await readJsonWithLimit(request, 10 * 1024 * 1024);
    const parsed = exportFileRequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid export request." },
        { status: 400 },
      );
    }

    const filteredSyncResult = filterSyncResultByLastSeen(
      parsed.data.syncResult,
      parsed.data.filter,
    );
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    const fileName = `omazync-email-contacts-${timestamp}.json`;
    await recordCompletedExport({ ownerId: session.user.id, format: "JSON", totalContacts: filteredSyncResult.allContacts.length, fileName });

    return NextResponse.json(filteredSyncResult, {
      headers: {
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    logApiEvent("error", "export.json.failed", {
      userId: session.user.id,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      { error: getSafeErrorMessage(error, "Failed to create JSON export.") },
      { status: getErrorStatus(error) },
    );
  }
}

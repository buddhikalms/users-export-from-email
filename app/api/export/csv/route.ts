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
import { recordCompletedExport } from "@/lib/export-history";
import { filterSyncResultByLastSeen } from "@/lib/sync-result";
import { exportFileRequestSchema } from "@/lib/validation";

export const runtime = "nodejs";

function escapeCsvCell(value: string | number) {
  const text = /^[=+\-@\t\r]/.test(String(value ?? ""))
    ? `'${String(value ?? "")}`
    : String(value ?? "");
  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

export async function POST(request: Request) {
  const limited = rateLimit(request, { scope: "export-csv", limit: 20, windowMs: 60_000 });
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

    const csv = await timeOperation(
      "export.csv",
      { userId: session.user.id, contactCount: filteredSyncResult.allContacts.length },
      () =>
        withTimeout(
          Promise.resolve().then(() => {
            const headers = [
              "Name",
              "Email",
              "Source Folder",
              "Source Type",
              "Forwarded By",
              "Original Sender",
              "Subject",
              "First Seen",
              "Last Seen",
              "Email Count",
            ];
            const rows = filteredSyncResult.allContacts.map((contact) =>
              [
                contact.name,
                contact.email,
                contact.sourceFolder,
                contact.sourceType,
                contact.forwardedBy,
                contact.originalSender,
                contact.subject,
                contact.firstSeen,
                contact.lastSeen,
                contact.emailCount,
              ].map(escapeCsvCell).join(","),
            );
            return [headers.join(","), ...rows].join("\r\n");
          }),
          30_000,
        ),
    );
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    const fileName = `omazync-email-contacts-${timestamp}.csv`;
    await recordCompletedExport({ ownerId: session.user.id, format: "CSV", totalContacts: filteredSyncResult.allContacts.length, fileName });

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    logApiEvent("error", "export.csv.failed", {
      userId: session.user.id,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      { error: getSafeErrorMessage(error, "Failed to create CSV export.") },
      { status: getErrorStatus(error) },
    );
  }
}

import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/auth";
import { exportSyncResultToGoogleSheet } from "@/lib/google-sheets";
import { recordCompletedExport } from "@/lib/export-history";
import { filterSyncResultByLastSeen } from "@/lib/sync-result";
import { exportGoogleSheetsRequestSchema } from "@/lib/validation";

export const runtime = "nodejs";

function createSpreadsheetTitle() {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  return `Email Contacts ${timestamp}`;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const json = await request.json();
    const parsed = exportGoogleSheetsRequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ??
            "Invalid Google Sheets export request.",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const filteredSyncResult = filterSyncResultByLastSeen(
      parsed.data.syncResult,
      parsed.data.filter,
    );
    const shareWithEmail =
      parsed.data.shareWithEmail ?? session.user.email ?? undefined;
    const spreadsheet = await exportSyncResultToGoogleSheet({
      syncResult: filteredSyncResult,
      title: parsed.data.spreadsheetTitle ?? createSpreadsheetTitle(),
      shareWithEmail,
    });
    await recordCompletedExport({
      ownerId: session.user.id,
      format: "GOOGLE_SHEETS",
      totalContacts: filteredSyncResult.allContacts.length,
      fileName: spreadsheet.title,
    });

    return NextResponse.json({
      spreadsheet,
      summary: {
        contacts: filteredSyncResult.allContacts.length,
        sheets: filteredSyncResult.folders.length + 1,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to create Google Sheets export.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

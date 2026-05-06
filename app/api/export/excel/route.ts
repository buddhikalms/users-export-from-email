import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/auth";
import { createWorkbookBuffer } from "@/lib/excel";
import { filterSyncResultByLastSeen } from "@/lib/sync-result";
import { exportExcelRequestSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const json = await request.json();
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
    const workbook = await createWorkbookBuffer(filteredSyncResult);
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");

    return new NextResponse(workbook, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="outlook-contacts-${timestamp}.xlsx"`,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create Excel export.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

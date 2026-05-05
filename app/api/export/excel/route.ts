import { NextResponse } from "next/server";

import { createWorkbookBuffer } from "@/lib/excel";
import { exportExcelRequestSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
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

    const workbook = await createWorkbookBuffer(parsed.data.syncResult);
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

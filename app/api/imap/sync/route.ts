import { NextResponse } from "next/server";

import { syncSelectedFolders } from "@/lib/imap";
import { syncRequestSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = syncRequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ??
            "Invalid sync request. Check your selected folders and settings.",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const syncResult = await syncSelectedFolders(
      parsed.data.settings,
      parsed.data.folders,
    );

    return NextResponse.json(syncResult);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to sync selected folders.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

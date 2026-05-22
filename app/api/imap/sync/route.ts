import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/auth";
import { getIgnoredEmailValues } from "@/lib/ignored-emails";
import { getImapErrorStatus, syncSelectedFolders } from "@/lib/imap";
import { resolveConnectionSettings } from "@/lib/imap-request";
import { syncRequestSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

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

    const settings = await resolveConnectionSettings(parsed.data, session.user.id);
    const ignoredEmails = await getIgnoredEmailValues(session.user.id);
    const syncResult = await syncSelectedFolders(
      settings,
      parsed.data.folders,
      ignoredEmails,
    );

    return NextResponse.json(syncResult);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to sync selected folders.";

    return NextResponse.json({ error: message }, { status: getImapErrorStatus(error) });
  }
}

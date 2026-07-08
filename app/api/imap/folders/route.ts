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
import { fetchMailFolders, getImapErrorStatus } from "@/lib/imap";
import { resolveConnectionSettings } from "@/lib/imap-request";
import { foldersRequestSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const limited = rateLimit(request, { scope: "imap-folders", limit: 30, windowMs: 60_000 });
  if (limited) return limited;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let settings: Awaited<ReturnType<typeof resolveConnectionSettings>> | null = null;

  try {
    const json = await readJsonWithLimit(request, 32_000);
    const parsed = foldersRequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ?? "Invalid IMAP connection settings.",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    settings = await resolveConnectionSettings(parsed.data, session.user.id);
    const folders = await timeOperation(
      "imap.folders",
      { userId: session.user.id },
      () => withTimeout(fetchMailFolders(settings!), 30_000),
    );
    settings = null;
    return NextResponse.json(
      { folders },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    settings = null;
    const statusCode = getErrorStatus(error, getImapErrorStatus(error));
    logApiEvent("error", "imap.folders.failed", {
      userId: session.user.id,
      statusCode,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      { error: getSafeErrorMessage(error, "Failed to fetch IMAP folders.") },
      { status: statusCode },
    );
  }
}

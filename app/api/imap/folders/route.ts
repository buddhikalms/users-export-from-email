import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/auth";
import { fetchMailFolders, getImapErrorStatus } from "@/lib/imap";
import { resolveConnectionSettings } from "@/lib/imap-request";
import { foldersRequestSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let settings: Awaited<ReturnType<typeof resolveConnectionSettings>> | null = null;

  try {
    const json = await request.json();
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
    const folders = await fetchMailFolders(settings);
    settings = null;
    return NextResponse.json({ folders });
  } catch (error) {
    settings = null;
    const message =
      error instanceof Error ? error.message : "Failed to fetch IMAP folders.";

    return NextResponse.json({ error: message }, { status: getImapErrorStatus(error) });
  }
}

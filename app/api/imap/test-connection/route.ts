import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/auth";
import { getImapErrorStatus, testImapConnection } from "@/lib/imap";
import { resolveConnectionSettings } from "@/lib/imap-request";
import { testConnectionRequestSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let settings: Awaited<ReturnType<typeof resolveConnectionSettings>> | null = null;

  try {
    const json = await request.json();
    const parsed = testConnectionRequestSchema.safeParse(json);

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
    const result = await testImapConnection(settings);
    settings = null;
    return NextResponse.json(result);
  } catch (error) {
    settings = null;
    const message =
      error instanceof Error ? error.message : "Failed to test IMAP connection.";

    return NextResponse.json({ error: message }, { status: getImapErrorStatus(error) });
  }
}

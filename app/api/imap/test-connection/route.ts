import { NextResponse } from "next/server";

import { testImapConnection } from "@/lib/imap";
import { testConnectionRequestSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = testConnectionRequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ?? "Invalid Outlook connection settings.",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const result = await testImapConnection(parsed.data.settings);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to test IMAP connection.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

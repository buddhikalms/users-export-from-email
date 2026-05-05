import { NextResponse } from "next/server";

import { fetchMailFolders } from "@/lib/imap";
import { foldersRequestSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = foldersRequestSchema.safeParse(json);

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

    const folders = await fetchMailFolders(parsed.data.settings);
    return NextResponse.json({ folders });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch IMAP folders.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

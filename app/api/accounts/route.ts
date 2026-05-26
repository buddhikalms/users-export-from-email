import { NextResponse } from "next/server";

import { listSavedAccounts, saveEmailAccount } from "@/lib/server-accounts";
import { getVerifiedSessionUserId, staleSessionMessage } from "@/lib/session-user";
import { savedEmailAccountSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET() {
  const userId = await getVerifiedSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: staleSessionMessage }, { status: 401 });
  }

  const accounts = await listSavedAccounts(userId);
  return NextResponse.json({ accounts });
}

export async function POST(request: Request) {
  const userId = await getVerifiedSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: staleSessionMessage }, { status: 401 });
  }

  try {
    const json = await request.json();
    const parsed = savedEmailAccountSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message ?? "Invalid saved account request.",
        },
        { status: 400 },
      );
    }

    const account = await saveEmailAccount(userId, parsed.data);

    return NextResponse.json({
      account,
      message: "Email account saved successfully.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to save the email account.",
      },
      { status: 500 },
    );
  }
}

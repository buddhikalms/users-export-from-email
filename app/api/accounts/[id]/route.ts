import { NextResponse } from "next/server";

import { deleteEmailAccount, updateEmailAccount } from "@/lib/server-accounts";
import { getVerifiedSessionUserId, staleSessionMessage } from "@/lib/session-user";
import { updateSavedEmailAccountSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getVerifiedSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: staleSessionMessage }, { status: 401 });
  }

  try {
    const json = await request.json();
    const parsed = updateSavedEmailAccountSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message ?? "Invalid saved account update.",
        },
        { status: 400 },
      );
    }

    const { id } = await params;
    const account = await updateEmailAccount(userId, id, parsed.data);
    return NextResponse.json({ account });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update the email account.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getVerifiedSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: staleSessionMessage }, { status: 401 });
  }

  try {
    const { id } = await params;
    await deleteEmailAccount(userId, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to delete the email account.",
      },
      { status: 500 },
    );
  }
}

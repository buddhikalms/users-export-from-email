import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/auth";
import { deleteKitAccount, updateKitAccount } from "@/lib/kit-accounts";
import { validateKitV3Connection, validateKitV4Connection } from "@/lib/kit";
import { kitAccountUpdateSchema } from "@/lib/validation";

export const runtime = "nodejs";

async function getSessionUserId() {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const json = await request.json();
    const parsed = kitAccountUpdateSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid Kit account update." },
        { status: 400 },
      );
    }

    if (parsed.data.apiKey) {
      if (parsed.data.apiVersion === "v3") {
        await validateKitV3Connection(parsed.data.apiKey, parsed.data.apiSecret ?? "");
      } else {
        await validateKitV4Connection(parsed.data.apiKey);
      }
    }

    const { id } = await params;
    const account = await updateKitAccount(userId, id, parsed.data);
    return NextResponse.json({ account, message: "Kit account updated." });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update Kit account." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { id } = await params;
    await deleteKitAccount(userId, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to delete Kit account." },
      { status: 500 },
    );
  }
}

import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/auth";
import { createKitAccount, listKitAccounts } from "@/lib/kit-accounts";
import { validateKitV3Connection, validateKitV4Connection } from "@/lib/kit";
import { kitAccountCreateSchema } from "@/lib/validation";

export const runtime = "nodejs";

async function getSessionUserId() {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const accounts = await listKitAccounts(userId);
    return NextResponse.json({ accounts });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load Kit accounts." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const json = await request.json();
    const parsed = kitAccountCreateSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid Kit account." },
        { status: 400 },
      );
    }

    if (parsed.data.apiVersion === "v3") {
      await validateKitV3Connection(parsed.data.apiKey, parsed.data.apiSecret ?? "");
    } else {
      await validateKitV4Connection(parsed.data.apiKey);
    }

    const account = await createKitAccount(userId, parsed.data);
    return NextResponse.json({
      account,
      message: "Kit account saved.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save Kit account." },
      { status: 500 },
    );
  }
}

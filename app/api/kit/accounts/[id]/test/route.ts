import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/auth";
import { getKitAccountCredentials } from "@/lib/kit-accounts";
import { validateKitV3Connection, validateKitV4Connection } from "@/lib/kit";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const credentials = await getKitAccountCredentials(session.user.id, id);

    if (credentials.apiVersion === "v3") {
      await validateKitV3Connection(credentials.apiKey, credentials.apiSecret);
    } else {
      await validateKitV4Connection(credentials.apiKey);
    }

    return NextResponse.json({ message: `${credentials.accountName} connected successfully.` });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to test Kit account." },
      { status: 500 },
    );
  }
}

import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/auth";
import { getKitAccountCredentials } from "@/lib/kit-accounts";
import { fetchKitForms } from "@/lib/kit";

export const runtime = "nodejs";

export async function GET(
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
    const forms = await fetchKitForms(credentials);
    return NextResponse.json({ forms });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load Kit forms." },
      { status: 500 },
    );
  }
}

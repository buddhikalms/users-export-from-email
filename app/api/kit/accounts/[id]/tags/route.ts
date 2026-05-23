import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/auth";
import { getKitAccountCredentials } from "@/lib/kit-accounts";
import { fetchKitTags } from "@/lib/kit";

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
    const tags = await fetchKitTags(credentials);
    return NextResponse.json({ tags });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load Kit tags." },
      { status: 500 },
    );
  }
}

import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/auth";
import { fetchKitTags } from "@/lib/kit";
import { getKitCredentials } from "@/lib/kit-settings";

export const runtime = "nodejs";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const credentials = await getKitCredentials(session.user.id);
    const tags = await fetchKitTags(credentials);
    return NextResponse.json({ tags });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load Kit tags." },
      { status: 500 },
    );
  }
}

import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/auth";
import { fetchKitForms, fetchKitTags } from "@/lib/kit";
import { kitVaultDestinationsRequestSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const json = await request.json();
    const parsed = kitVaultDestinationsRequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid Kit credentials." },
        { status: 400 },
      );
    }

    const credentials =
      parsed.data.credentials.apiVersion === "v3"
        ? {
            apiVersion: "v3" as const,
            apiKey: parsed.data.credentials.apiKey,
            apiSecret: parsed.data.credentials.apiSecret ?? "",
          }
        : {
            apiVersion: "v4" as const,
            apiKey: parsed.data.credentials.apiKey,
          };
    const [tags, forms] = await Promise.all([
      fetchKitTags(credentials),
      fetchKitForms(credentials),
    ]);

    return NextResponse.json({ tags, forms });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to load Kit destinations.",
      },
      { status: 500 },
    );
  }
}

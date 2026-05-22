import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/auth";
import {
  disconnectKit,
  getKitSettingsSummary,
  saveKitSettings,
  updateKitPreferences,
} from "@/lib/kit-settings";
import { validateKitV3Connection, validateKitV4Connection } from "@/lib/kit";
import { kitConnectSchema, kitSettingsUpdateSchema } from "@/lib/validation";

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

  const settings = await getKitSettingsSummary(userId);
  return NextResponse.json({ settings });
}

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const json = await request.json();
    const parsed = kitConnectSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid Kit settings." },
        { status: 400 },
      );
    }

    if (parsed.data.apiVersion === "v3") {
      await validateKitV3Connection(parsed.data.apiKey, parsed.data.apiSecret ?? "");
    } else {
      await validateKitV4Connection(parsed.data.apiKey);
    }
    const settings = await saveKitSettings(userId, parsed.data);

    return NextResponse.json({
      settings,
      message: "Kit account connected successfully.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to connect Kit account.",
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const json = await request.json();
    const parsed = kitSettingsUpdateSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid Kit preferences." },
        { status: 400 },
      );
    }

    const settings = await updateKitPreferences(userId, parsed.data);
    return NextResponse.json({
      settings,
      message: "Kit settings saved.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to update Kit settings.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  await disconnectKit(userId);
  return NextResponse.json({ success: true });
}

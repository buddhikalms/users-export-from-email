import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getVerifiedSessionUserId, staleSessionMessage } from "@/lib/session-user";
import { automationRuleCreateSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const userId = await getVerifiedSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: staleSessionMessage }, { status: 401 });
  }

  try {
    const json = await request.json();
    const parsed = automationRuleCreateSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid automation rule." },
        { status: 400 },
      );
    }

    const rule = await db.automationRule.create({
      data: {
        ownerId: userId,
        name: parsed.data.name,
        trigger: parsed.data.trigger,
        enabled: parsed.data.enabled,
        schedule: parsed.data.schedule || null,
        conditions: parsed.data.conditionText
          ? { description: parsed.data.conditionText }
          : undefined,
        actions: parsed.data.actionText ? { description: parsed.data.actionText } : undefined,
        nextRunAt: parsed.data.nextRunAt ? new Date(parsed.data.nextRunAt) : null,
      },
      select: {
        id: true,
        name: true,
        trigger: true,
        enabled: true,
        schedule: true,
        lastRunAt: true,
        nextRunAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ rule, message: "Automation rule created." });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to create automation rule.",
      },
      { status: 500 },
    );
  }
}

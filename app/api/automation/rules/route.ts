import { NextResponse } from "next/server";

import {
  buildAutomationRulePayload,
  getAutomationSchedulePreset,
  getNextRunFromSchedule,
} from "@/lib/automation";
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

    const schedulePreset = getAutomationSchedulePreset(parsed.data.schedule);
    const schedule = schedulePreset?.schedule ?? parsed.data.schedule ?? null;
    const nextRunAt = parsed.data.nextRunAt
      ? new Date(parsed.data.nextRunAt)
      : getNextRunFromSchedule(schedule);
    const isExportRule =
      Boolean(parsed.data.emailAccountId) &&
      Boolean(parsed.data.marketingAccountId) &&
      Boolean(parsed.data.marketingAccountType);
    const shouldQueueJob =
      parsed.data.enabled && (parsed.data.trigger === "SCHEDULED" || parsed.data.trigger === "MANUAL");

    if (isExportRule) {
      const emailAccount = await db.savedEmailAccount.findFirst({
        where: {
          id: parsed.data.emailAccountId,
          ownerId: userId,
        },
        select: { id: true },
      });

      if (!emailAccount) {
        return NextResponse.json({ error: "Selected email account was not found." }, { status: 400 });
      }

      const marketingAccount =
        parsed.data.marketingAccountType === "kit"
          ? await db.kitAccount.findFirst({
              where: {
                id: parsed.data.marketingAccountId,
                ownerId: userId,
              },
              select: { id: true },
            })
          : await db.integrationAccount.findFirst({
              where: {
                id: parsed.data.marketingAccountId,
                ownerId: userId,
              },
              select: { id: true },
            });

      if (!marketingAccount) {
        return NextResponse.json(
          { error: "Selected platform account was not found." },
          { status: 400 },
        );
      }
    }

    const rule = await db.$transaction(async (tx) => {
      const createdRule = await tx.automationRule.create({
        data: {
          ownerId: userId,
          name: parsed.data.name,
          trigger: parsed.data.trigger,
          enabled: parsed.data.enabled,
          schedule,
          conditions: parsed.data.conditionText
            ? {
                description: parsed.data.conditionText,
                emailAccountId: parsed.data.emailAccountId || null,
                folders: parsed.data.folders,
              }
            : { emailAccountId: parsed.data.emailAccountId || null, folders: parsed.data.folders },
          actions:
            parsed.data.actionText || isExportRule
              ? {
                  description: parsed.data.actionText || "Export users to selected platform.",
                  emailAccountId: parsed.data.emailAccountId || null,
                  marketingAccountId: parsed.data.marketingAccountId || null,
                  marketingAccountType: parsed.data.marketingAccountType || null,
                  marketingPlatform: parsed.data.marketingPlatform || null,
                  destinationId: parsed.data.destinationId || null,
                  destinationName: parsed.data.destinationName || null,
                  destinationType: parsed.data.destinationType || null,
                  action: isExportRule ? "EXPORT_CONTACTS_TO_PLATFORM" : null,
                }
              : undefined,
          nextRunAt,
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

      if (shouldQueueJob) {
        await tx.backgroundJob.create({
          data: {
            ownerId: userId,
            type: "AUTOMATION_RUN",
            runAfter: nextRunAt ?? new Date(),
            payload: buildAutomationRulePayload({
              actionText: parsed.data.actionText,
              conditionText: parsed.data.conditionText,
              emailAccountId: parsed.data.emailAccountId,
              folders: parsed.data.folders,
              marketingAccountId: parsed.data.marketingAccountId,
              marketingAccountType: parsed.data.marketingAccountType,
              marketingPlatform: parsed.data.marketingPlatform,
              destinationId: parsed.data.destinationId,
              destinationName: parsed.data.destinationName,
              destinationType: parsed.data.destinationType,
              ruleId: createdRule.id,
              schedule,
              trigger: parsed.data.trigger,
            }),
          },
        });
      }

      return createdRule;
    });

    return NextResponse.json({
      rule,
      message: shouldQueueJob
        ? "Automation rule created and queued."
        : "Automation rule created.",
    });
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

import type { MarketingPlatform } from "@prisma/client";

import { db } from "@/lib/db";

export async function startSyncRun(input: {
  ownerId: string;
  platform?: MarketingPlatform;
  targetName?: string;
  targetType: string;
}) {
  return db.syncRun.create({
    data: {
      ownerId: input.ownerId,
      platform: input.platform,
      status: "RUNNING",
      targetName: input.targetName,
      targetType: input.targetType,
      startedAt: new Date(),
    },
    select: { id: true },
  });
}

export async function completeSyncRun(
  id: string,
  counts: {
    totalContacts: number;
    uploaded?: number;
    updated?: number;
    skippedDuplicates?: number;
    failed?: number;
  },
) {
  await db.syncRun.update({
    where: { id },
    data: {
      status: counts.failed ? "PARTIAL" : "SUCCESS",
      completedAt: new Date(),
      totalContacts: counts.totalContacts,
      uploaded: counts.uploaded ?? 0,
      updated: counts.updated ?? 0,
      skippedDuplicates: counts.skippedDuplicates ?? 0,
      failed: counts.failed ?? 0,
    },
  });
}

export async function failSyncRun(id: string | null, error: unknown) {
  if (!id) return;

  await db.syncRun.update({
    where: { id },
    data: {
      status: "FAILED",
      completedAt: new Date(),
      errorMessage: error instanceof Error ? error.message : "Sync failed.",
    },
  });
}

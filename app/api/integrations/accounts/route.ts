import { NextResponse } from "next/server";

import { encryptSecret } from "@/lib/crypto";
import { db } from "@/lib/db";
import { getIntegrationAdapter, isLaunchPlatform } from "@/lib/integrations/registry";
import {
  prismaPlatformByIntegrationId,
  toPrismaIntegrationHealth,
} from "@/lib/integrations/platforms";
import { getVerifiedSessionUserId, staleSessionMessage } from "@/lib/session-user";
import { integrationAccountCreateSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const userId = await getVerifiedSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: staleSessionMessage }, { status: 401 });
  }

  try {
    const json = await request.json();
    const parsed = integrationAccountCreateSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid integration account." },
        { status: 400 },
      );
    }

    if (!isLaunchPlatform(parsed.data.platform)) {
      return NextResponse.json({ error: "This integration is coming soon." }, { status: 400 });
    }

    const adapter = getIntegrationAdapter(parsed.data.platform);
    if (!adapter) {
      return NextResponse.json({ error: "Unsupported integration platform." }, { status: 400 });
    }

    const validation = await adapter.validate({
      apiKey: parsed.data.apiKey,
      apiSecret: parsed.data.apiSecret,
      serverPrefix: parsed.data.serverPrefix,
      accountId: parsed.data.externalAccountId,
    });

    if (!validation.ok) {
      return NextResponse.json({ error: validation.message }, { status: 400 });
    }

    const platform = prismaPlatformByIntegrationId[parsed.data.platform];
    const existingDefault = await db.integrationAccount.findFirst({
      where: { ownerId: userId, platform, isDefault: true },
    });
    const encryptedKey = encryptSecret(parsed.data.apiKey);
    const encryptedSecret = parsed.data.apiSecret ? encryptSecret(parsed.data.apiSecret) : null;
    const shouldSetDefault = parsed.data.isDefault || !existingDefault;

    if (shouldSetDefault) {
      await db.integrationAccount.updateMany({
        where: { ownerId: userId, platform },
        data: { isDefault: false },
      });
    }

    const account = await db.integrationAccount.create({
      data: {
        ownerId: userId,
        platform,
        name: parsed.data.name,
        encryptedApiKey: encryptedKey.encryptedPassword,
        encryptionIv: encryptedKey.encryptionIv,
        encryptionTag: encryptedKey.encryptionTag,
        encryptedApiSecret: encryptedSecret?.encryptedPassword,
        secretEncryptionIv: encryptedSecret?.encryptionIv,
        secretEncryptionTag: encryptedSecret?.encryptionTag,
        externalAccountId: parsed.data.externalAccountId || validation.accountName || null,
        health: toPrismaIntegrationHealth(validation.status),
        isDefault: shouldSetDefault,
        lastTestedAt: new Date(),
        rateLimitRemaining: validation.rateLimitRemaining,
        metadata: {
          validationMessage: validation.message,
          serverPrefix: parsed.data.serverPrefix || null,
        },
      },
      select: {
        id: true,
        name: true,
        platform: true,
        health: true,
        isDefault: true,
        lastTestedAt: true,
      },
    });

    return NextResponse.json({
      account,
      message: `${adapter.label} account connected.`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to connect integration account.",
      },
      { status: 500 },
    );
  }
}

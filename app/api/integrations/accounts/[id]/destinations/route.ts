import { NextResponse } from "next/server";

import { decryptSecret } from "@/lib/crypto";
import { db } from "@/lib/db";
import { getIntegrationAdapter, isLaunchPlatform } from "@/lib/integrations/registry";
import { integrationIdByPrismaPlatform } from "@/lib/integrations/platforms";
import { getVerifiedSessionUserId, staleSessionMessage } from "@/lib/session-user";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getVerifiedSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: staleSessionMessage }, { status: 401 });
  }

  try {
    const { id } = await params;
    const account = await db.integrationAccount.findFirst({
      where: { id, ownerId: userId },
    });

    if (!account) {
      return NextResponse.json({ error: "Integration account not found." }, { status: 404 });
    }

    const platform = integrationIdByPrismaPlatform[account.platform];
    if (!isLaunchPlatform(platform)) {
      return NextResponse.json({ error: "This integration is coming soon." }, { status: 400 });
    }

    const adapter = getIntegrationAdapter(platform);
    if (!adapter) {
      return NextResponse.json({ error: "Unsupported integration platform." }, { status: 400 });
    }

    const metadata =
      account.metadata && typeof account.metadata === "object" && !Array.isArray(account.metadata)
        ? (account.metadata as Record<string, unknown>)
        : {};
    const destinations = await adapter.listDestinations({
      apiKey: decryptSecret({
        encryptedPassword: account.encryptedApiKey,
        encryptionIv: account.encryptionIv,
        encryptionTag: account.encryptionTag,
      }),
      apiSecret:
        account.encryptedApiSecret && account.secretEncryptionIv && account.secretEncryptionTag
          ? decryptSecret({
              encryptedPassword: account.encryptedApiSecret,
              encryptionIv: account.secretEncryptionIv,
              encryptionTag: account.secretEncryptionTag,
            })
          : undefined,
      serverPrefix: typeof metadata.serverPrefix === "string" ? metadata.serverPrefix : undefined,
      accountId: account.externalAccountId ?? undefined,
    });

    return NextResponse.json({ destinations });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load destinations." },
      { status: 500 },
    );
  }
}

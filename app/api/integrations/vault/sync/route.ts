import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/auth";
import { normalizeContactEmail } from "@/lib/email-format";
import { getIntegrationAdapter, isLaunchPlatform } from "@/lib/integrations/registry";
import { immediateMarketingSyncSchema } from "@/lib/validation";
import { completeSyncRun, failSyncRun, startSyncRun } from "@/lib/sync-history";
import { prismaPlatformByIntegrationId } from "@/lib/integrations/platforms";

export const runtime = "nodejs";

function splitValue(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let credentials: {
    apiKey: string;
    apiSecret?: string;
    serverPrefix?: string;
    accountId?: string;
  } | null = null;
  let syncRunId: string | null = null;

  try {
    const json = await request.json();
    const parsed = immediateMarketingSyncSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid vault export request." },
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

    credentials = parsed.data.credentials;
    const syncRun = await startSyncRun({
      ownerId: session.user.id,
      platform: prismaPlatformByIntegrationId[parsed.data.platform],
      targetName: parsed.data.destination.name,
      targetType: parsed.data.destination.type,
    });
    syncRunId = syncRun.id;
    const contacts = parsed.data.syncResult.allContacts.flatMap((contact) => {
      const email = normalizeContactEmail(contact.email);
      if (!email) {
        return [];
      }

      return [
        {
          email,
          name: contact.name,
          firstName: contact.name.split(/\s+/)[0] || undefined,
          sourceFolders: splitValue(contact.sourceFolder),
          sourceTypes: splitValue(contact.sourceType),
        },
      ];
    });

    const summary = await adapter.syncContacts({
      credentials,
      contacts,
      destination: parsed.data.destination,
    });

    await completeSyncRun(syncRunId, summary);

    credentials = null;
    return NextResponse.json({
      summary: {
        ...summary,
        platform: parsed.data.platform,
        accountName: parsed.data.accountName,
        destinationName: parsed.data.destination.name,
        destinationType: parsed.data.destination.type,
      },
    });
  } catch (error) {
    credentials = null;
    await failSyncRun(syncRunId, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to export contacts." },
      { status: 500 },
    );
  }
}

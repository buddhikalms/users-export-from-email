import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/auth";
import { getKitAccountCredentials } from "@/lib/kit-accounts";
import { kitAccountSyncRequestSchema } from "@/lib/validation";
import { prepareContactsForKit, syncSubscribersToKit } from "@/lib/kit";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const json = await request.json();
    const parsed = kitAccountSyncRequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid Kit sync request." },
        { status: 400 },
      );
    }

    const { id } = await params;
    const credentials = await getKitAccountCredentials(session.user.id, id);
    const prepared = prepareContactsForKit(parsed.data.syncResult, {
      defaultTagId: parsed.data.destinationType === "tag" ? parsed.data.tagId : undefined,
      defaultFormId: parsed.data.destinationType === "form" ? parsed.data.formId : undefined,
      folderTagMappings: [],
    });
    const summary = await syncSubscribersToKit(credentials, prepared.contacts);

    return NextResponse.json({
      summary: {
        ...summary,
        kitAccountName: credentials.accountName,
        destinationName: parsed.data.destinationName,
        destinationType: parsed.data.destinationType,
        totalContacts: prepared.summary.totalContacts,
        skippedDuplicates: prepared.summary.skippedDuplicates,
        invalidEmails: prepared.summary.invalidEmails,
        ignoredEmails: prepared.summary.ignoredEmails,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to sync contacts to Kit." },
      { status: 500 },
    );
  }
}

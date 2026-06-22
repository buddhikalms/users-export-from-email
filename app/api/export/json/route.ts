import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/auth";
import { recordCompletedExport } from "@/lib/export-history";
import { filterSyncResultByLastSeen } from "@/lib/sync-result";
import { exportFileRequestSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const json = await request.json();
  const parsed = exportFileRequestSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid export request." },
      { status: 400 },
    );
  }

  const filteredSyncResult = filterSyncResultByLastSeen(
    parsed.data.syncResult,
    parsed.data.filter,
  );
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  const fileName = `chatup-email-contacts-${timestamp}.json`;
  await recordCompletedExport({ ownerId: session.user.id, format: "JSON", totalContacts: filteredSyncResult.allContacts.length, fileName });

  return NextResponse.json(filteredSyncResult, {
    headers: {
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}

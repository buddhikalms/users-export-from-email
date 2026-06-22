import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/auth";
import { recordCompletedExport } from "@/lib/export-history";
import { filterSyncResultByLastSeen } from "@/lib/sync-result";
import { exportFileRequestSchema } from "@/lib/validation";

export const runtime = "nodejs";

function escapeCsvCell(value: string | number) {
  const text = String(value ?? "");
  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

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
  const headers = [
    "Name",
    "Email",
    "Source Folder",
    "Source Type",
    "Forwarded By",
    "Original Sender",
    "Subject",
    "First Seen",
    "Last Seen",
    "Email Count",
  ];
  const rows = filteredSyncResult.allContacts.map((contact) =>
    [
      contact.name,
      contact.email,
      contact.sourceFolder,
      contact.sourceType,
      contact.forwardedBy,
      contact.originalSender,
      contact.subject,
      contact.firstSeen,
      contact.lastSeen,
      contact.emailCount,
    ].map(escapeCsvCell).join(","),
  );
  const csv = [headers.join(","), ...rows].join("\r\n");
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  const fileName = `chatup-email-contacts-${timestamp}.csv`;
  await recordCompletedExport({ ownerId: session.user.id, format: "CSV", totalContacts: filteredSyncResult.allContacts.length, fileName });

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}

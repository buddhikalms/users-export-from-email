import type { ExportFormat } from "@prisma/client";

import { db } from "@/lib/db";

export async function recordCompletedExport(input: {
  ownerId: string;
  format: ExportFormat;
  totalContacts: number;
  fileName?: string;
}) {
  await db.exportRun.create({
    data: {
      ownerId: input.ownerId,
      format: input.format,
      status: "SUCCESS",
      fileName: input.fileName,
      totalContacts: input.totalContacts,
      exportedContacts: input.totalContacts,
      completedAt: new Date(),
    },
  });
}

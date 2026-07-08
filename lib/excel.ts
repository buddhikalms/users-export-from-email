import ExcelJS from "exceljs";

import { normalizeContactEmail } from "@/lib/email-format";
import type { EmailContact, FolderSyncResult, SyncResult } from "@/types/email";

const HEADERS = [
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

function sanitizeWorksheetName(name: string) {
  const cleaned = name.replace(/[:\\/?*\[\]]/g, " ").trim() || "Sheet";
  return cleaned.slice(0, 31);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function safeSpreadsheetValue(value: string | number) {
  if (typeof value === "number") {
    return value;
  }

  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

function addRows(
  worksheet: ExcelJS.Worksheet,
  contacts: EmailContact[],
  defaultSourceFolder?: string,
) {
  const uniqueContacts = dedupeContactsByCleanEmail(contacts);

  worksheet.columns = [
    { header: HEADERS[0], key: "name", width: 24 },
    { header: HEADERS[1], key: "email", width: 30 },
    { header: HEADERS[2], key: "sourceFolder", width: 28 },
    { header: HEADERS[3], key: "sourceType", width: 18 },
    { header: HEADERS[4], key: "forwardedBy", width: 30 },
    { header: HEADERS[5], key: "originalSender", width: 30 },
    { header: HEADERS[6], key: "subject", width: 36 },
    { header: HEADERS[7], key: "firstSeen", width: 22 },
    { header: HEADERS[8], key: "lastSeen", width: 22 },
    { header: HEADERS[9], key: "emailCount", width: 14 },
  ];

  worksheet.addRows(
    uniqueContacts.map((contact) => ({
      name: safeSpreadsheetValue(contact.name),
      email: safeSpreadsheetValue(contact.email),
      sourceFolder: safeSpreadsheetValue(defaultSourceFolder ?? contact.sourceFolder),
      sourceType: safeSpreadsheetValue(contact.sourceType),
      forwardedBy: safeSpreadsheetValue(contact.forwardedBy),
      originalSender: safeSpreadsheetValue(contact.originalSender),
      subject: safeSpreadsheetValue(contact.subject),
      firstSeen: formatDate(contact.firstSeen),
      lastSeen: formatDate(contact.lastSeen),
      emailCount: contact.emailCount,
    })),
  );

  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFDDF3E6" },
  };
  headerRow.alignment = { vertical: "middle" };

  worksheet.autoFilter = {
    from: "A1",
    to: "J1",
  };
  worksheet.views = [{ state: "frozen", ySplit: 1 }];

  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      const length = String(cell.value ?? "").length + 4;
      const column = worksheet.getColumn(cell.col);
      if (length > (column.width ?? 10)) {
        column.width = Math.min(length, 48);
      }
    });
  });
}

function dedupeContactsByCleanEmail(contacts: EmailContact[]) {
  const uniqueMap = new Map<string, EmailContact>();

  for (const contact of contacts) {
    const cleanedEmail = normalizeContactEmail(contact.email);
    if (!cleanedEmail) {
      continue;
    }

    const existing = uniqueMap.get(cleanedEmail);
    if (!existing) {
      uniqueMap.set(cleanedEmail, {
        ...contact,
        email: cleanedEmail,
      });
      continue;
    }

    uniqueMap.set(cleanedEmail, {
      ...existing,
      name:
        existing.name && existing.name !== existing.email.split("@")[0]
          ? existing.name
          : contact.name,
      sourceFolder: Array.from(
        new Set(
          [existing.sourceFolder, contact.sourceFolder]
            .flatMap((value) => value.split(", "))
            .filter(Boolean),
        ),
      )
        .sort()
        .join(", "),
      sourceType: Array.from(
        new Set(
          [existing.sourceType, contact.sourceType]
            .flatMap((value) => value.split(", "))
            .filter(Boolean),
        ),
      )
        .sort()
        .join(", "),
      forwardedBy: existing.forwardedBy || contact.forwardedBy,
      originalSender: existing.originalSender || contact.originalSender,
      subject: existing.subject || contact.subject,
      firstSeen:
        new Date(contact.firstSeen) < new Date(existing.firstSeen)
          ? contact.firstSeen
          : existing.firstSeen,
      lastSeen:
        new Date(contact.lastSeen) > new Date(existing.lastSeen)
          ? contact.lastSeen
          : existing.lastSeen,
      emailCount: existing.emailCount + contact.emailCount,
    });
  }

  return Array.from(uniqueMap.values()).sort((left, right) =>
    left.email.localeCompare(right.email),
  );
}

function addFolderSheet(workbook: ExcelJS.Workbook, folder: FolderSyncResult) {
  const worksheet = workbook.addWorksheet(
    sanitizeWorksheetName(folder.displayName),
  );
  addRows(worksheet, folder.contacts, folder.displayName);
}

export async function createWorkbookBuffer(syncResult: SyncResult) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Email Contact Exporter";
  workbook.created = new Date();

  const allContactsSheet = workbook.addWorksheet("All Contacts");
  addRows(allContactsSheet, syncResult.allContacts);

  for (const folder of syncResult.folders) {
    addFolderSheet(workbook, folder);
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

import ExcelJS from "exceljs";

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

function addRows(
  worksheet: ExcelJS.Worksheet,
  contacts: EmailContact[],
  defaultSourceFolder?: string,
) {
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
    contacts.map((contact) => ({
      name: contact.name,
      email: contact.email,
      sourceFolder: defaultSourceFolder ?? contact.sourceFolder,
      sourceType: contact.sourceType,
      forwardedBy: contact.forwardedBy,
      originalSender: contact.originalSender,
      subject: contact.subject,
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

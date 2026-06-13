import { createSign } from "node:crypto";

import { normalizeContactEmail } from "@/lib/email-format";
import type { EmailContact, FolderSyncResult, SyncResult } from "@/types/email";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_SHEETS_API = "https://sheets.googleapis.com/v4/spreadsheets";
const GOOGLE_DRIVE_API = "https://www.googleapis.com/drive/v3/files";
const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.file",
];

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

type GoogleSheetsConfig = {
  clientEmail: string;
  privateKey: string;
};

type GoogleTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

type GoogleSpreadsheetResponse = {
  spreadsheetId: string;
  spreadsheetUrl: string;
  sheets: Array<{
    properties: {
      sheetId: number;
      title: string;
    };
  }>;
};

type SheetPayload = {
  title: string;
  rows: Array<Array<string | number>>;
};

export type GoogleSheetExportResult = {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
  sharedWithEmail?: string;
};

export function getGoogleSheetsConfig(): GoogleSheetsConfig {
  const clientEmail =
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey =
    process.env.GOOGLE_PRIVATE_KEY ??
    process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  const privateKeyBase64 =
    process.env.GOOGLE_PRIVATE_KEY_BASE64 ??
    process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_BASE64;

  if (!clientEmail) {
    throw new Error(
      "Google Sheets export is not configured. Add GOOGLE_SERVICE_ACCOUNT_EMAIL to the server environment.",
    );
  }

  const resolvedPrivateKey = privateKeyBase64
    ? Buffer.from(privateKeyBase64, "base64").toString("utf8")
    : privateKey?.replace(/\\n/g, "\n");

  if (!resolvedPrivateKey) {
    throw new Error(
      "Google Sheets export is not configured. Add GOOGLE_PRIVATE_KEY or GOOGLE_PRIVATE_KEY_BASE64 to the server environment.",
    );
  }

  return {
    clientEmail,
    privateKey: resolvedPrivateKey,
  };
}

function base64Url(value: string | Buffer) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function createServiceAccountAssertion(config: GoogleSheetsConfig) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const header = {
    alg: "RS256",
    typ: "JWT",
  };
  const payload = {
    iss: config.clientEmail,
    scope: SCOPES.join(" "),
    aud: GOOGLE_TOKEN_URL,
    iat: issuedAt,
    exp: issuedAt + 3600,
  };
  const unsignedToken = `${base64Url(JSON.stringify(header))}.${base64Url(
    JSON.stringify(payload),
  )}`;
  const signature = createSign("RSA-SHA256")
    .update(unsignedToken)
    .sign(config.privateKey);

  return `${unsignedToken}.${base64Url(signature)}`;
}

async function readGoogleJson<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as
    | {
        error?: string | { message?: string };
        error_description?: string;
      }
    | null;

  if (response.ok) {
    return payload as T;
  }

  const message =
    typeof payload?.error === "object"
      ? payload.error.message
      : payload?.error_description ?? payload?.error;

  throw new Error(
    message ??
      `Google API request failed with HTTP ${response.status} ${response.statusText}.`,
  );
}

async function getAccessToken(config: GoogleSheetsConfig) {
  const assertion = createServiceAccountAssertion(config);
  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion,
  });

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const token = await readGoogleJson<GoogleTokenResponse>(response);

  return token.access_token;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function sanitizeSheetTitle(title: string) {
  return title.replace(/[:\\/?*\[\]]/g, " ").replace(/\s+/g, " ").trim();
}

function uniquifySheetTitles(titles: string[]) {
  const used = new Set<string>();

  return titles.map((title, index) => {
    const fallback = index === 0 ? "All Contacts" : `Folder ${index}`;
    const base = (sanitizeSheetTitle(title) || fallback).slice(0, 100);
    let candidate = base;
    let suffix = 2;

    while (used.has(candidate.toLowerCase())) {
      const counter = ` ${suffix}`;
      candidate = `${base.slice(0, 100 - counter.length)}${counter}`;
      suffix += 1;
    }

    used.add(candidate.toLowerCase());
    return candidate;
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

function contactRows(contacts: EmailContact[], defaultSourceFolder?: string) {
  return dedupeContactsByCleanEmail(contacts).map((contact) => [
    contact.name,
    contact.email,
    defaultSourceFolder ?? contact.sourceFolder,
    contact.sourceType,
    contact.forwardedBy,
    contact.originalSender,
    contact.subject,
    formatDate(contact.firstSeen),
    formatDate(contact.lastSeen),
    contact.emailCount,
  ]);
}

function buildSheetPayloads(syncResult: SyncResult): SheetPayload[] {
  const titles = uniquifySheetTitles([
    "All Contacts",
    ...syncResult.folders.map((folder) => folder.displayName),
  ]);

  return [
    {
      title: titles[0],
      rows: [HEADERS, ...contactRows(syncResult.allContacts)],
    },
    ...syncResult.folders.map((folder: FolderSyncResult, index) => ({
      title: titles[index + 1],
      rows: [HEADERS, ...contactRows(folder.contacts, folder.displayName)],
    })),
  ];
}

function escapeSheetRangeTitle(title: string) {
  return title.replace(/'/g, "''");
}

async function createSpreadsheet(
  accessToken: string,
  title: string,
  sheets: SheetPayload[],
) {
  const response = await fetch(GOOGLE_SHEETS_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: {
        title,
      },
      sheets: sheets.map((sheet) => ({
        properties: {
          title: sheet.title,
          gridProperties: {
            frozenRowCount: 1,
          },
        },
      })),
    }),
  });

  return readGoogleJson<GoogleSpreadsheetResponse>(response);
}

async function writeSheetValues(
  accessToken: string,
  spreadsheetId: string,
  sheets: SheetPayload[],
) {
  const response = await fetch(
    `${GOOGLE_SHEETS_API}/${spreadsheetId}/values:batchUpdate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        valueInputOption: "RAW",
        data: sheets.map((sheet) => ({
          range: `'${escapeSheetRangeTitle(sheet.title)}'!A1:J${sheet.rows.length}`,
          majorDimension: "ROWS",
          values: sheet.rows,
        })),
      }),
    },
  );

  await readGoogleJson<unknown>(response);
}

async function formatSpreadsheet(
  accessToken: string,
  spreadsheetId: string,
  spreadsheet: GoogleSpreadsheetResponse,
) {
  const response = await fetch(`${GOOGLE_SHEETS_API}/${spreadsheetId}:batchUpdate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      requests: spreadsheet.sheets.flatMap((sheet) => {
        const sheetId = sheet.properties.sheetId;

        return [
          {
            repeatCell: {
              range: {
                sheetId,
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: HEADERS.length,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: {
                    red: 0.87,
                    green: 0.95,
                    blue: 0.9,
                  },
                  textFormat: {
                    bold: true,
                  },
                },
              },
              fields:
                "userEnteredFormat(backgroundColor,textFormat.bold)",
            },
          },
          {
            setBasicFilter: {
              filter: {
                range: {
                  sheetId,
                  startRowIndex: 0,
                  startColumnIndex: 0,
                  endColumnIndex: HEADERS.length,
                },
              },
            },
          },
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId,
                dimension: "COLUMNS",
                startIndex: 0,
                endIndex: HEADERS.length,
              },
            },
          },
        ];
      }),
    }),
  });

  await readGoogleJson<unknown>(response);
}

async function shareSpreadsheet(
  accessToken: string,
  spreadsheetId: string,
  emailAddress: string,
) {
  const response = await fetch(
    `${GOOGLE_DRIVE_API}/${spreadsheetId}/permissions?sendNotificationEmail=false`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "user",
        role: "writer",
        emailAddress,
      }),
    },
  );

  await readGoogleJson<unknown>(response);
}

export async function exportSyncResultToGoogleSheet({
  syncResult,
  title,
  shareWithEmail,
}: {
  syncResult: SyncResult;
  title: string;
  shareWithEmail?: string;
}): Promise<GoogleSheetExportResult> {
  const config = getGoogleSheetsConfig();
  const accessToken = await getAccessToken(config);
  const sheets = buildSheetPayloads(syncResult);
  const spreadsheet = await createSpreadsheet(accessToken, title, sheets);

  await writeSheetValues(accessToken, spreadsheet.spreadsheetId, sheets);
  await formatSpreadsheet(accessToken, spreadsheet.spreadsheetId, spreadsheet);

  if (shareWithEmail) {
    await shareSpreadsheet(accessToken, spreadsheet.spreadsheetId, shareWithEmail);
  }

  return {
    spreadsheetId: spreadsheet.spreadsheetId,
    spreadsheetUrl: spreadsheet.spreadsheetUrl,
    title,
    sharedWithEmail: shareWithEmail,
  };
}

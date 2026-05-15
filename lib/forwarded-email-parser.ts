import { normalizeContactEmail } from "@/lib/email-format";

export interface ForwardedContact {
  name: string;
  email: string;
  header: "from" | "to";
}

export interface ForwardedEmailParseResult {
  isForwarded: boolean;
  originalSender: string;
  contacts: ForwardedContact[];
}

const EMAIL_CAPTURE_PATTERN =
  /(?:mailto:)?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(?:\?[^<>\s"')]*)?/gi;

const FORWARDED_MARKERS = [
  /forwarded message/i,
  /begin forwarded message/i,
  /original message/i,
  /^-{2,}\s*forwarded message\s*-{2,}$/im,
  /^-{2,}\s*original message\s*-{2,}$/im,
  /^from:\s*.+$/im,
];

const FORWARDED_HEADER_GROUP =
  /(?:^|\n)\s*(?:-{2,}\s*)?from:\s*.+(?:\n\s*(?:sent|date|to|cc|subject):\s*.+)?/i;

function decodeQuotedPrintable(value: string) {
  return value
    .replace(/=\r?\n/g, "")
    .replace(/=([a-fA-F0-9]{2})/g, (_, hex: string) =>
      String.fromCharCode(Number.parseInt(hex, 16)),
    );
}

function decodeBodyPart(body: string, encoding: string) {
  const normalizedEncoding = encoding.toLowerCase();

  if (normalizedEncoding.includes("base64")) {
    try {
      return Buffer.from(body.replace(/\s+/g, ""), "base64").toString("utf8");
    } catch {
      return body;
    }
  }

  if (normalizedEncoding.includes("quoted-printable")) {
    return decodeQuotedPrintable(body);
  }

  return body;
}

function stripHtml(value: string) {
  return value
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(
      /<a\b[^>]*href=["']mailto:([^"'?#>]+)(?:[?#][^"'>]*)?["'][^>]*>([\s\S]*?)<\/a>/gi,
      "$2 <$1>",
    )
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&amp;/gi, "&");
}

function splitHeaderAndBody(part: string) {
  const match = /\r?\n\r?\n/.exec(part);
  if (!match) {
    return null;
  }

  return {
    headers: part.slice(0, match.index),
    body: part.slice(match.index + match[0].length),
  };
}

export function extractTextFromRawMessage(source: Buffer | string | undefined) {
  if (!source) {
    return "";
  }

  const raw = Buffer.isBuffer(source) ? source.toString("utf8") : source;
  const parts = raw.split(/\r?\n--[^\r\n]+(?:--)?\r?\n/g);
  const textParts: string[] = [];
  const htmlParts: string[] = [];

  for (const part of parts) {
    const parsed = splitHeaderAndBody(part);
    if (!parsed) {
      continue;
    }

    const contentType = parsed.headers.match(/^content-type:\s*([^\r\n;]+)/im)?.[1] ?? "";
    const encoding =
      parsed.headers.match(/^content-transfer-encoding:\s*([^\r\n]+)/im)?.[1] ?? "";
    const decoded = decodeBodyPart(parsed.body, encoding);

    if (/text\/plain/i.test(contentType)) {
      textParts.push(decoded);
    } else if (/text\/html/i.test(contentType)) {
      htmlParts.push(stripHtml(decoded));
    }
  }

  if (textParts.length > 0) {
    return textParts.join("\n");
  }

  if (htmlParts.length > 0) {
    return htmlParts.join("\n");
  }

  const fallback = splitHeaderAndBody(raw);
  return fallback ? stripHtml(decodeQuotedPrintable(fallback.body)) : stripHtml(raw);
}

function getForwardedSection(body: string) {
  const markerIndexes = FORWARDED_MARKERS.map((pattern) => {
    const match = pattern.exec(body);
    return match?.index ?? -1;
  }).filter((index) => index >= 0);

  if (markerIndexes.length === 0) {
    return body;
  }

  return body.slice(Math.min(...markerIndexes));
}

function unfoldLines(value: string) {
  return value.replace(/\r\n/g, "\n").replace(/\n[ \t]+/g, " ");
}

function cleanName(value: string | undefined, email: string) {
  const name = value
    ?.replace(EMAIL_CAPTURE_PATTERN, "")
    .replace(/^from:\s*/i, "")
    .replace(/[<>"']/g, "")
    .trim();

  return name || email.split("@")[0];
}

function extractAddressEntries(value: string, header: ForwardedContact["header"]) {
  const entries: ForwardedContact[] = [];
  const anglePattern =
    /([^<\n,;]+)?<\s*((?:mailto:)?[^<>@\s]+@[^<>\s?#]+(?:\?[^<>\s]*)?)\s*>/gi;
  let angleMatch: RegExpExecArray | null;

  while ((angleMatch = anglePattern.exec(value)) !== null) {
    const email = normalizeContactEmail(angleMatch[2] ?? "");
    if (!email) {
      continue;
    }

    entries.push({
      name: cleanName(angleMatch[1], email),
      email,
      header,
    });
  }

  for (const match of value.matchAll(EMAIL_CAPTURE_PATTERN)) {
    const rawEmail = match[0] ?? match[1] ?? "";
    const email = normalizeContactEmail(rawEmail);
    if (!email || entries.some((entry) => entry.email === email)) {
      continue;
    }

    entries.push({
      name: cleanName(undefined, email),
      email,
      header,
    });
  }

  return entries;
}

function extractHeaderContacts(section: string, headerName: "from" | "to") {
  const unfolded = unfoldLines(section);
  const pattern = new RegExp(`^\\s*(?:-{2,}\\s*)?${headerName}:\\s*(.+)$`, "gim");
  const contacts: ForwardedContact[] = [];
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(unfolded)) !== null) {
    contacts.push(...extractAddressEntries(match[1] ?? "", headerName));
  }

  return contacts;
}

function dedupeContacts(
  contacts: ForwardedContact[],
  ignoredEmails: Set<string>,
) {
  const byEmail = new Map<string, ForwardedContact>();

  for (const contact of contacts) {
    const email = normalizeContactEmail(contact.email);
    if (!email || ignoredEmails.has(email)) {
      continue;
    }

    const existing = byEmail.get(email);
    if (!existing || existing.name === existing.email.split("@")[0]) {
      byEmail.set(email, {
        ...contact,
        email,
      });
    }
  }

  return Array.from(byEmail.values()).sort((left, right) =>
    left.email.localeCompare(right.email),
  );
}

export function parseForwardedEmailBody(
  body: string,
  ignoredEmailValues: string[] = [],
): ForwardedEmailParseResult {
  const ignoredEmails = new Set(
    ignoredEmailValues
      .map((email) => normalizeContactEmail(email))
      .filter((email): email is string => Boolean(email)),
  );
  const isForwarded =
    FORWARDED_MARKERS.some((pattern) => pattern.test(body)) ||
    FORWARDED_HEADER_GROUP.test(body);

  if (!isForwarded) {
    return {
      isForwarded: false,
      originalSender: "",
      contacts: [],
    };
  }

  const forwardedSection = getForwardedSection(body);
  const fromContacts = extractHeaderContacts(forwardedSection, "from");
  const forwarderEmails = new Set(fromContacts.map((contact) => contact.email));
  const toContacts = extractHeaderContacts(forwardedSection, "to").filter(
    (contact) => !forwarderEmails.has(contact.email),
  );
  const contacts = dedupeContacts([...fromContacts, ...toContacts], ignoredEmails);
  const originalFrom = fromContacts.find(
    (contact) => !ignoredEmails.has(contact.email),
  );

  return {
    isForwarded: true,
    originalSender: originalFrom
      ? `${originalFrom.name} <${originalFrom.email}>`
      : "",
    contacts,
  };
}

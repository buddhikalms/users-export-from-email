import type {
  CrossFolderDuplicate,
  EmailContact,
  FolderSyncResult,
} from "@/types/email";
import { normalizeContactEmail } from "@/lib/email-format";
import { parseForwardedEmailBody } from "@/lib/forwarded-email-parser";

interface AddressLike {
  name?: string | null;
  address?: string | null;
  mailbox?: string | null;
  host?: string | null;
}

interface EnvelopeLike {
  from?: AddressLike[] | null;
  to?: AddressLike[] | null;
  cc?: AddressLike[] | null;
  bcc?: AddressLike[] | null;
  date?: Date | string | null;
  subject?: string | null;
}

interface MutableContact {
  name: string;
  email: string;
  sourceFolder: string;
  sourceTypes: Set<string>;
  forwardedBy: string;
  originalSender: string;
  subject: string;
  firstSeen: Date;
  lastSeen: Date;
  emailCount: number;
}

function resolveEmail(address: AddressLike): string | null {
  const value =
    address.address ??
    (address.mailbox && address.host
      ? `${address.mailbox}@${address.host}`
      : null);

  if (!value) {
    return null;
  }

  return normalizeContactEmail(value);
}

function deriveName(name: string | null | undefined, email: string) {
  const trimmed = name?.trim();
  if (trimmed) {
    return trimmed;
  }

  return email.split("@")[0];
}

function formatAddress(address: AddressLike | undefined | null) {
  if (!address) {
    return "";
  }

  const email = resolveEmail(address);
  if (!email) {
    return "";
  }

  return `${deriveName(address.name, email)} <${email}>`;
}

function toSafeDate(date?: Date | string | null) {
  const parsed = date ? new Date(date) : new Date();
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function mergeMetadata(
  existing: MutableContact,
  metadata: {
    name: string;
    sourceType: string;
    forwardedBy?: string;
    originalSender?: string;
    subject?: string;
  },
) {
  existing.sourceTypes.add(metadata.sourceType);

  if (!existing.name || existing.name === existing.email.split("@")[0]) {
    existing.name = metadata.name;
  }

  if (!existing.forwardedBy && metadata.forwardedBy) {
    existing.forwardedBy = metadata.forwardedBy;
  }

  if (!existing.originalSender && metadata.originalSender) {
    existing.originalSender = metadata.originalSender;
  }

  if (!existing.subject && metadata.subject) {
    existing.subject = metadata.subject;
  }
}

function addContact(
  contactMap: Map<string, MutableContact>,
  contact: {
    name: string;
    email: string;
    sourceFolder: string;
    sourceType: "direct_email" | "forwarded_email";
    forwardedBy?: string;
    originalSender?: string;
    subject?: string;
    seenAt: Date;
  },
) {
  const existing = contactMap.get(contact.email);
  if (!existing) {
    contactMap.set(contact.email, {
      name: contact.name,
      email: contact.email,
      sourceFolder: contact.sourceFolder,
      sourceTypes: new Set([contact.sourceType]),
      forwardedBy: contact.forwardedBy ?? "",
      originalSender: contact.originalSender ?? "",
      subject: contact.subject ?? "",
      firstSeen: contact.seenAt,
      lastSeen: contact.seenAt,
      emailCount: 1,
    });
    return;
  }

  existing.firstSeen =
    contact.seenAt < existing.firstSeen ? contact.seenAt : existing.firstSeen;
  existing.lastSeen =
    contact.seenAt > existing.lastSeen ? contact.seenAt : existing.lastSeen;
  existing.emailCount += 1;
  mergeMetadata(existing, contact);
}

export function collectContactsFromEnvelope(
  contactMap: Map<string, MutableContact>,
  envelope: EnvelopeLike | null | undefined,
  sourceFolder: string,
  fallbackDate?: Date | string,
  ignoredEmails: string[] = [],
) {
  if (!envelope) {
    return;
  }

  const seenAt = fallbackDate ? toSafeDate(fallbackDate) : toSafeDate(envelope.date);
  const groups = [envelope.from, envelope.to, envelope.cc, envelope.bcc];
  const ignoredEmailSet = new Set(
    ignoredEmails
      .map((email) => normalizeContactEmail(email))
      .filter((email): email is string => Boolean(email)),
  );

  for (const group of groups) {
    for (const address of group ?? []) {
      const email = resolveEmail(address);
      if (!email || ignoredEmailSet.has(email)) {
        continue;
      }

      addContact(contactMap, {
        name: deriveName(address.name, email),
        email,
        sourceFolder,
        sourceType: "direct_email",
        subject: envelope.subject ?? "",
        seenAt,
      });
    }
  }
}

export function collectContactsFromForwardedBody(
  contactMap: Map<string, MutableContact>,
  body: string,
  envelope: EnvelopeLike | null | undefined,
  sourceFolder: string,
  fallbackDate?: Date | string,
  ignoredEmails: string[] = [],
) {
  const parsed = parseForwardedEmailBody(body, ignoredEmails);
  if (!parsed.isForwarded || parsed.contacts.length === 0) {
    return;
  }

  const seenAt = fallbackDate ? toSafeDate(fallbackDate) : toSafeDate(envelope?.date);
  const forwardedBy = formatAddress(envelope?.from?.[0]);

  for (const contact of parsed.contacts) {
    addContact(contactMap, {
      name: contact.name,
      email: contact.email,
      sourceFolder,
      sourceType: "forwarded_email",
      forwardedBy,
      originalSender: parsed.originalSender,
      subject: envelope?.subject ?? "",
      seenAt,
    });
  }
}

export function createMutableContactMap() {
  return new Map<string, MutableContact>();
}

export function finalizeFolderContacts(
  contactMap: Map<string, MutableContact>,
): EmailContact[] {
  return Array.from(contactMap.values())
    .sort((left, right) => left.email.localeCompare(right.email))
    .map((contact) => ({
      name: contact.name,
      email: contact.email,
      sourceFolder: contact.sourceFolder,
      sourceType: Array.from(contact.sourceTypes).sort().join(", "),
      forwardedBy: contact.forwardedBy,
      originalSender: contact.originalSender,
      subject: contact.subject,
      firstSeen: contact.firstSeen.toISOString(),
      lastSeen: contact.lastSeen.toISOString(),
      emailCount: contact.emailCount,
    }));
}

export function buildAllContacts(
  folders: FolderSyncResult[],
): {
  allContacts: EmailContact[];
  duplicatesAcrossFolders: CrossFolderDuplicate[];
} {
  const aggregate = new Map<
    string,
    {
      name: string;
      email: string;
      folders: Set<string>;
      sourceTypes: Set<string>;
      forwardedBy: string;
      originalSender: string;
      subject: string;
      firstSeen: Date;
      lastSeen: Date;
      emailCount: number;
    }
  >();

  for (const folder of folders) {
    for (const contact of folder.contacts) {
      const firstSeen = new Date(contact.firstSeen);
      const lastSeen = new Date(contact.lastSeen);
      const existing = aggregate.get(contact.email);

      if (!existing) {
        aggregate.set(contact.email, {
          name: contact.name,
          email: contact.email,
          folders: new Set([folder.displayName]),
          sourceTypes: new Set(contact.sourceType.split(", ")),
          forwardedBy: contact.forwardedBy,
          originalSender: contact.originalSender,
          subject: contact.subject,
          firstSeen,
          lastSeen,
          emailCount: contact.emailCount,
        });
        continue;
      }

      existing.folders.add(folder.displayName);
      for (const sourceType of contact.sourceType.split(", ")) {
        existing.sourceTypes.add(sourceType);
      }
      existing.emailCount += contact.emailCount;
      existing.firstSeen =
        firstSeen < existing.firstSeen ? firstSeen : existing.firstSeen;
      existing.lastSeen = lastSeen > existing.lastSeen ? lastSeen : existing.lastSeen;

      if (!existing.name || existing.name === existing.email.split("@")[0]) {
        existing.name = contact.name;
      }

      if (!existing.forwardedBy && contact.forwardedBy) {
        existing.forwardedBy = contact.forwardedBy;
      }

      if (!existing.originalSender && contact.originalSender) {
        existing.originalSender = contact.originalSender;
      }

      if (!existing.subject && contact.subject) {
        existing.subject = contact.subject;
      }
    }
  }

  const allContacts = Array.from(aggregate.values())
    .sort((left, right) => left.email.localeCompare(right.email))
    .map((contact) => ({
      name: contact.name,
      email: contact.email,
      sourceFolder: Array.from(contact.folders).sort().join(", "),
      sourceType: Array.from(contact.sourceTypes).sort().join(", "),
      forwardedBy: contact.forwardedBy,
      originalSender: contact.originalSender,
      subject: contact.subject,
      firstSeen: contact.firstSeen.toISOString(),
      lastSeen: contact.lastSeen.toISOString(),
      emailCount: contact.emailCount,
    }));

  const duplicatesAcrossFolders = Array.from(aggregate.values())
    .filter((contact) => contact.folders.size > 1)
    .sort((left, right) => left.email.localeCompare(right.email))
    .map((contact) => ({
      email: contact.email,
      name: contact.name,
      folders: Array.from(contact.folders).sort(),
      totalEmailCount: contact.emailCount,
    }));

  return {
    allContacts,
    duplicatesAcrossFolders,
  };
}

import type {
  CrossFolderDuplicate,
  EmailContact,
  FolderSyncResult,
} from "@/types/email";
import { normalizeContactEmail } from "@/lib/email-format";

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
}

interface MutableContact {
  name: string;
  email: string;
  sourceFolder: string;
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

function toSafeDate(date?: Date | string | null) {
  const parsed = date ? new Date(date) : new Date();
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

export function collectContactsFromEnvelope(
  contactMap: Map<string, MutableContact>,
  envelope: EnvelopeLike | null | undefined,
  sourceFolder: string,
  fallbackDate?: Date | string,
) {
  if (!envelope) {
    return;
  }

  const seenAt = fallbackDate ? toSafeDate(fallbackDate) : toSafeDate(envelope.date);
  const groups = [envelope.from, envelope.to, envelope.cc, envelope.bcc];

  for (const group of groups) {
    for (const address of group ?? []) {
      const email = resolveEmail(address);
      if (!email) {
        continue;
      }

      const existing = contactMap.get(email);
      if (!existing) {
        contactMap.set(email, {
          name: deriveName(address.name, email),
          email,
          sourceFolder,
          firstSeen: seenAt,
          lastSeen: seenAt,
          emailCount: 1,
        });
        continue;
      }

      existing.firstSeen =
        seenAt < existing.firstSeen ? seenAt : existing.firstSeen;
      existing.lastSeen = seenAt > existing.lastSeen ? seenAt : existing.lastSeen;
      existing.emailCount += 1;

      if (!existing.name || existing.name === existing.email.split("@")[0]) {
        existing.name = deriveName(address.name, email);
      }
    }
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
          firstSeen,
          lastSeen,
          emailCount: contact.emailCount,
        });
        continue;
      }

      existing.folders.add(folder.displayName);
      existing.emailCount += contact.emailCount;
      existing.firstSeen =
        firstSeen < existing.firstSeen ? firstSeen : existing.firstSeen;
      existing.lastSeen = lastSeen > existing.lastSeen ? lastSeen : existing.lastSeen;

      if (!existing.name || existing.name === existing.email.split("@")[0]) {
        existing.name = contact.name;
      }
    }
  }

  const allContacts = Array.from(aggregate.values())
    .sort((left, right) => left.email.localeCompare(right.email))
    .map((contact) => ({
      name: contact.name,
      email: contact.email,
      sourceFolder: Array.from(contact.folders).sort().join(", "),
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

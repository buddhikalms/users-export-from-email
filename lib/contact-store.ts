import type { ContactSourceType, Prisma } from "@prisma/client";

import { classifyEmail, detectCompanyFromEmail, getEmailDomain } from "@/lib/contact-intelligence";
import { db } from "@/lib/db";
import { normalizeContactEmail } from "@/lib/email-format";
import type { SyncResult } from "@/types/email";

function parseDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function mapSourceType(value: string): ContactSourceType {
  const normalized = value.toLowerCase();
  if (normalized.includes("forwarded")) return "FORWARDED_EMAIL";
  if (normalized.includes("reply")) return "REPLY_TO";
  if (normalized.includes("original")) return "ORIGINAL_SENDER";
  return "DIRECT_EMAIL";
}

export async function persistSyncedContacts(ownerId: string, syncResult: SyncResult) {
  const duplicateEmails = new Set(
    syncResult.duplicatesAcrossFolders
      .map((duplicate) => normalizeContactEmail(duplicate.email))
      .filter((email): email is string => Boolean(email)),
  );
  const operations: Prisma.PrismaPromise<unknown>[] = [];

  for (const contact of syncResult.allContacts) {
    const email = normalizeContactEmail(contact.email);
    if (!email) continue;

    const data = {
      email,
      name: contact.name || null,
      company: detectCompanyFromEmail(email),
      domain: getEmailDomain(email) || null,
      emailClassification: classifyEmail(email),
      sourceType: mapSourceType(contact.sourceType),
      sourceFolder: contact.sourceFolder || null,
      forwardedBy: contact.forwardedBy || null,
      originalSender: contact.originalSender || null,
      duplicateScore: duplicateEmails.has(email) ? 100 : 0,
      firstSeenAt: parseDate(contact.firstSeen),
      lastSeenAt: parseDate(contact.lastSeen),
      emailCount: Math.max(1, contact.emailCount),
      metadata: { subject: contact.subject || null, sourceTypes: contact.sourceType },
    } satisfies Prisma.ContactUpdateInput;

    operations.push(
      db.contact.upsert({
        where: { ownerId_normalizedEmail: { ownerId, normalizedEmail: email } },
        create: { ownerId, normalizedEmail: email, ...data },
        update: data,
      }),
    );
  }

  for (let index = 0; index < operations.length; index += 100) {
    await db.$transaction(operations.slice(index, index + 100));
  }

  return operations.length;
}

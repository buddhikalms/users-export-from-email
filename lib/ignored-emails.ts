import { db } from "@/lib/db";
import { normalizeContactEmail } from "@/lib/email-format";

export async function listIgnoredEmails(userId: string) {
  const ignoredEmails = await db.ignoredEmail.findMany({
    where: { ownerId: userId },
    orderBy: { email: "asc" },
  });

  return ignoredEmails.map((item) => ({
    id: item.id,
    email: item.email,
    createdAt: item.createdAt.toISOString(),
  }));
}

export async function getIgnoredEmailValues(userId: string) {
  const ignoredEmails = await db.ignoredEmail.findMany({
    where: { ownerId: userId },
    select: { email: true },
  });

  return ignoredEmails.map((item) => item.email);
}

export async function addIgnoredEmail(userId: string, value: string) {
  const email = normalizeContactEmail(value);
  if (!email) {
    throw new Error("Enter a valid email address to ignore.");
  }

  const ignoredEmail = await db.ignoredEmail.upsert({
    where: {
      ownerId_email: {
        ownerId: userId,
        email,
      },
    },
    create: {
      ownerId: userId,
      email,
    },
    update: {},
  });

  return {
    id: ignoredEmail.id,
    email: ignoredEmail.email,
    createdAt: ignoredEmail.createdAt.toISOString(),
  };
}

export async function deleteIgnoredEmail(userId: string, id: string) {
  await db.ignoredEmail.deleteMany({
    where: {
      id,
      ownerId: userId,
    },
  });
}

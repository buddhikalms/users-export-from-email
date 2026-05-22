import { type SavedEmailAccount } from "@prisma/client";

import { db } from "@/lib/db";
import { decryptSecret, encryptSecret } from "@/lib/crypto";
import type {
  ConnectionSettings,
  SavedEmailAccountSummary,
  SecurityType,
} from "@/types/email";

function mapSavedAccount(account: SavedEmailAccount): SavedEmailAccountSummary {
  return {
    id: account.id,
    label: account.label,
    email: account.email,
    host: account.host,
    port: account.port,
    security: account.security as SecurityType,
    username: account.username,
    isDefault: account.isDefault,
    createdAt: account.createdAt.toISOString(),
    updatedAt: account.updatedAt.toISOString(),
  };
}

export async function listSavedAccounts(userId: string) {
  const accounts = await db.savedEmailAccount.findMany({
    where: {
      ownerId: userId,
    },
    orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
  });

  return accounts.map(mapSavedAccount);
}

export async function saveEmailAccount(
  userId: string,
  input: ConnectionSettings & { label: string },
) {
  const encrypted = encryptSecret(input.password);

  const existingDefault = await db.savedEmailAccount.findFirst({
    where: {
      ownerId: userId,
      isDefault: true,
    },
  });

  const account = await db.savedEmailAccount.create({
    data: {
      ownerId: userId,
      label: input.label,
      email: input.email,
      host: input.host,
      port: input.port,
      security: input.security,
      username: input.username,
      isDefault: !existingDefault,
      ...encrypted,
    },
  });

  return mapSavedAccount(account);
}

export async function updateEmailAccount(
  userId: string,
  accountId: string,
  input: Partial<ConnectionSettings> & {
    label?: string;
    isDefault?: boolean;
  },
) {
  const existing = await db.savedEmailAccount.findFirst({
    where: {
      id: accountId,
      ownerId: userId,
    },
  });

  if (!existing) {
    throw new Error("Saved account not found.");
  }

  const passwordData = input.password
    ? encryptSecret(input.password)
    : {
        encryptedPassword: existing.encryptedPassword,
        encryptionIv: existing.encryptionIv,
        encryptionTag: existing.encryptionTag,
      };

  if (input.isDefault) {
    await db.savedEmailAccount.updateMany({
      where: {
        ownerId: userId,
      },
      data: {
        isDefault: false,
      },
    });
  }

  const updated = await db.savedEmailAccount.update({
    where: {
      id: existing.id,
    },
    data: {
      label: input.label ?? existing.label,
      email: input.email ?? existing.email,
      host: input.host ?? existing.host,
      port: input.port ?? existing.port,
      security: input.security ?? existing.security,
      username: input.username ?? existing.username,
      isDefault: input.isDefault ?? existing.isDefault,
      ...passwordData,
    },
  });

  return mapSavedAccount(updated);
}

export async function deleteEmailAccount(userId: string, accountId: string) {
  const account = await db.savedEmailAccount.findFirst({
    where: {
      id: accountId,
      ownerId: userId,
    },
  });

  if (!account) {
    throw new Error("Saved account not found.");
  }

  await db.savedEmailAccount.delete({
    where: {
      id: accountId,
    },
  });

  if (account.isDefault) {
    const next = await db.savedEmailAccount.findFirst({
      where: {
        ownerId: userId,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    if (next) {
      await db.savedEmailAccount.update({
        where: { id: next.id },
        data: { isDefault: true },
      });
    }
  }
}

export async function getSavedAccountSettings(
  userId: string,
  accountId: string,
): Promise<ConnectionSettings> {
  const account = await db.savedEmailAccount.findFirst({
    where: {
      id: accountId,
      ownerId: userId,
    },
  });

  if (!account) {
    throw new Error("Saved email account was not found.");
  }

  return {
    email: account.email,
    host: account.host,
    port: account.port,
    security: account.security as SecurityType,
    username: account.username,
    password: decryptSecret({
      encryptedPassword: account.encryptedPassword,
      encryptionIv: account.encryptionIv,
      encryptionTag: account.encryptionTag,
    }),
    rememberPassword: false,
  };
}

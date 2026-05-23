import { type KitAccount } from "@prisma/client";

import { db } from "@/lib/db";
import { decryptSecret, encryptSecret } from "@/lib/crypto";
import type { KitCredentials } from "@/lib/kit";
import type { KitAccountSummary } from "@/types/kit";

function maskSecret(value: string) {
  if (value.length <= 8) {
    return "****";
  }

  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

function mapKitAccount(account: KitAccount): KitAccountSummary {
  return {
    id: account.id,
    name: account.name,
    apiVersion: account.apiVersion as "v4" | "v3",
    maskedApiKey: maskSecret(account.encryptedApiKey),
    hasApiSecret: Boolean(account.encryptedApiSecret),
    isDefault: account.isDefault,
    createdAt: account.createdAt.toISOString(),
    updatedAt: account.updatedAt.toISOString(),
  };
}

export async function listKitAccounts(userId: string) {
  const accounts = await db.kitAccount.findMany({
    where: { ownerId: userId },
    orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
  });

  return accounts.map(mapKitAccount);
}

async function clearDefaultIfNeeded(userId: string, shouldSetDefault?: boolean) {
  if (!shouldSetDefault) {
    return;
  }

  await db.kitAccount.updateMany({
    where: { ownerId: userId },
    data: { isDefault: false },
  });
}

export async function createKitAccount(
  userId: string,
  input: {
    name: string;
    apiVersion: "v4" | "v3";
    apiKey: string;
    apiSecret?: string;
    isDefault?: boolean;
  },
) {
  const existingDefault = await db.kitAccount.findFirst({
    where: { ownerId: userId, isDefault: true },
  });
  const encryptedKey = encryptSecret(input.apiKey);
  const encryptedSecret = input.apiSecret ? encryptSecret(input.apiSecret) : null;

  await clearDefaultIfNeeded(userId, input.isDefault || !existingDefault);

  const account = await db.kitAccount.create({
    data: {
      ownerId: userId,
      name: input.name,
      apiVersion: input.apiVersion,
      encryptedApiKey: encryptedKey.encryptedPassword,
      encryptionIv: encryptedKey.encryptionIv,
      encryptionTag: encryptedKey.encryptionTag,
      encryptedApiSecret: encryptedSecret?.encryptedPassword,
      secretEncryptionIv: encryptedSecret?.encryptionIv,
      secretEncryptionTag: encryptedSecret?.encryptionTag,
      isDefault: input.isDefault || !existingDefault,
    },
  });

  return mapKitAccount(account);
}

export async function updateKitAccount(
  userId: string,
  accountId: string,
  input: {
    name?: string;
    apiVersion?: "v4" | "v3";
    apiKey?: string;
    apiSecret?: string;
    isDefault?: boolean;
  },
) {
  const existing = await db.kitAccount.findFirst({
    where: { id: accountId, ownerId: userId },
  });

  if (!existing) {
    throw new Error("Kit account not found.");
  }

  await clearDefaultIfNeeded(userId, input.isDefault);

  const encryptedKey = input.apiKey ? encryptSecret(input.apiKey) : null;
  const encryptedSecret = input.apiSecret ? encryptSecret(input.apiSecret) : null;

  const account = await db.kitAccount.update({
    where: { id: existing.id },
    data: {
      name: input.name ?? existing.name,
      apiVersion: input.apiVersion ?? existing.apiVersion,
      encryptedApiKey: encryptedKey?.encryptedPassword ?? existing.encryptedApiKey,
      encryptionIv: encryptedKey?.encryptionIv ?? existing.encryptionIv,
      encryptionTag: encryptedKey?.encryptionTag ?? existing.encryptionTag,
      encryptedApiSecret:
        encryptedSecret?.encryptedPassword ??
        (input.apiVersion === "v4" ? null : existing.encryptedApiSecret),
      secretEncryptionIv:
        encryptedSecret?.encryptionIv ??
        (input.apiVersion === "v4" ? null : existing.secretEncryptionIv),
      secretEncryptionTag:
        encryptedSecret?.encryptionTag ??
        (input.apiVersion === "v4" ? null : existing.secretEncryptionTag),
      isDefault: input.isDefault ?? existing.isDefault,
    },
  });

  return mapKitAccount(account);
}

export async function deleteKitAccount(userId: string, accountId: string) {
  const account = await db.kitAccount.findFirst({
    where: { id: accountId, ownerId: userId },
  });

  if (!account) {
    throw new Error("Kit account not found.");
  }

  await db.kitAccount.delete({
    where: { id: account.id },
  });

  if (account.isDefault) {
    const next = await db.kitAccount.findFirst({
      where: { ownerId: userId },
      orderBy: { updatedAt: "desc" },
    });

    if (next) {
      await db.kitAccount.update({
        where: { id: next.id },
        data: { isDefault: true },
      });
    }
  }
}

export async function getKitAccountCredentials(
  userId: string,
  accountId: string,
): Promise<KitCredentials & { accountName: string }> {
  const account = await db.kitAccount.findFirst({
    where: { id: accountId, ownerId: userId },
  });

  if (!account) {
    throw new Error("Kit account not found.");
  }

  const apiKey = decryptSecret({
    encryptedPassword: account.encryptedApiKey,
    encryptionIv: account.encryptionIv,
    encryptionTag: account.encryptionTag,
  });

  if (account.apiVersion === "v3") {
    if (!account.encryptedApiSecret || !account.secretEncryptionIv || !account.secretEncryptionTag) {
      throw new Error("Kit V3 account is missing its API secret.");
    }

    return {
      apiVersion: "v3",
      apiKey,
      apiSecret: decryptSecret({
        encryptedPassword: account.encryptedApiSecret,
        encryptionIv: account.secretEncryptionIv,
        encryptionTag: account.secretEncryptionTag,
      }),
      accountName: account.name,
    };
  }

  return {
    apiVersion: "v4",
    apiKey,
    accountName: account.name,
  };
}

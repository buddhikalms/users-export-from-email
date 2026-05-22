import { db } from "@/lib/db";
import { decryptSecret, encryptSecret } from "@/lib/crypto";
import type { KitCredentials } from "@/lib/kit";
import type { KitFolderTagMapping, KitSettingsSummary } from "@/types/kit";

function mapSettings(
  settings:
    | {
        apiVersion: "v4" | "v3";
        defaultTagId: string | null;
        defaultFormId: string | null;
        updatedAt: Date;
        folderTagMappings: KitFolderTagMapping[];
      }
    | null,
): KitSettingsSummary {
  if (!settings) {
    return {
      connected: false,
      folderTagMappings: [],
    };
  }

  return {
    connected: true,
    apiVersion: settings.apiVersion,
    defaultTagId: settings.defaultTagId,
    defaultFormId: settings.defaultFormId,
    folderTagMappings: settings.folderTagMappings,
    updatedAt: settings.updatedAt.toISOString(),
  };
}

export async function getKitSettingsSummary(userId: string) {
  const settings = await db.kitSettings.findUnique({
    where: { ownerId: userId },
    include: {
      folderTagMappings: {
        orderBy: {
          folderPath: "asc",
        },
      },
    },
  });

  return mapSettings(settings);
}

export async function getKitCredentials(userId: string): Promise<KitCredentials> {
  const settings = await db.kitSettings.findUnique({
    where: { ownerId: userId },
  });

  if (!settings) {
    throw new Error("Connect Kit before syncing subscribers.");
  }

  const apiKey = decryptSecret({
    encryptedPassword: settings.encryptedApiKey,
    encryptionIv: settings.encryptionIv,
    encryptionTag: settings.encryptionTag,
  });
  const apiSecret =
    settings.encryptedApiSecret &&
    settings.secretEncryptionIv &&
    settings.secretEncryptionTag
      ? decryptSecret({
          encryptedPassword: settings.encryptedApiSecret,
          encryptionIv: settings.secretEncryptionIv,
          encryptionTag: settings.secretEncryptionTag,
        })
      : undefined;

  if (settings.apiVersion === "v3") {
    if (!apiSecret) {
      throw new Error("Kit V3 credentials are missing the API secret.");
    }

    return {
      apiVersion: "v3",
      apiKey,
      apiSecret,
    };
  }

  return {
    apiVersion: "v4",
    apiKey,
  };
}

export async function saveKitSettings(
  userId: string,
  input: {
    apiKey: string;
    apiSecret?: string;
    apiVersion: "v4" | "v3";
    defaultTagId?: string;
    defaultFormId?: string;
  },
) {
  const encrypted = encryptSecret(input.apiKey);
  const encryptedSecret = input.apiSecret ? encryptSecret(input.apiSecret) : null;

  const settings = await db.kitSettings.upsert({
    where: { ownerId: userId },
    create: {
      ownerId: userId,
      apiVersion: input.apiVersion,
      encryptedApiKey: encrypted.encryptedPassword,
      encryptedApiSecret: encryptedSecret?.encryptedPassword,
      encryptionIv: encrypted.encryptionIv,
      encryptionTag: encrypted.encryptionTag,
      secretEncryptionIv: encryptedSecret?.encryptionIv,
      secretEncryptionTag: encryptedSecret?.encryptionTag,
      defaultTagId: input.defaultTagId || null,
      defaultFormId: input.defaultFormId || null,
    },
    update: {
      apiVersion: input.apiVersion,
      encryptedApiKey: encrypted.encryptedPassword,
      encryptedApiSecret: encryptedSecret?.encryptedPassword,
      encryptionIv: encrypted.encryptionIv,
      encryptionTag: encrypted.encryptionTag,
      secretEncryptionIv: encryptedSecret?.encryptionIv,
      secretEncryptionTag: encryptedSecret?.encryptionTag,
      defaultTagId: input.defaultTagId || null,
      defaultFormId: input.defaultFormId || null,
    },
    include: {
      folderTagMappings: {
        orderBy: {
          folderPath: "asc",
        },
      },
    },
  });

  return mapSettings(settings);
}

export async function updateKitPreferences(
  userId: string,
  input: {
    defaultTagId?: string;
    defaultFormId?: string;
    folderTagMappings: KitFolderTagMapping[];
  },
) {
  const existing = await db.kitSettings.findUnique({
    where: { ownerId: userId },
  });

  if (!existing) {
    throw new Error("Connect Kit before saving tag mappings.");
  }

  await db.$transaction([
    db.kitSettings.update({
      where: { id: existing.id },
      data: {
        defaultTagId: input.defaultTagId || null,
        defaultFormId: input.defaultFormId || null,
      },
    }),
    db.kitFolderTagMap.deleteMany({
      where: { kitSettingsId: existing.id },
    }),
    ...input.folderTagMappings.map((mapping) =>
      db.kitFolderTagMap.create({
        data: {
          kitSettingsId: existing.id,
          folderPath: mapping.folderPath,
          tagId: mapping.tagId,
          tagName: mapping.tagName,
        },
      }),
    ),
  ]);

  return getKitSettingsSummary(userId);
}

export async function disconnectKit(userId: string) {
  await db.kitSettings.deleteMany({
    where: { ownerId: userId },
  });
}

import axios, { AxiosError } from "axios";

import { normalizeContactEmail } from "@/lib/email-format";
import type { EmailContact, SyncResult } from "@/types/email";
import type {
  KitFolderTagMapping,
  KitForm,
  KitPreparedContact,
  KitSyncSummary,
  KitTag,
} from "@/types/kit";

const KIT_API_BASE_URL = "https://api.kit.com/v4";
const KIT_V3_API_BASE_URL = "https://api.convertkit.com/v3";
const BATCH_SIZE = 25;
const IGNORED_PREFIXES = ["noreply@", "no-reply@", "support@", "do-not-reply@"];

export type KitCredentials =
  | {
      apiVersion: "v4";
      apiKey: string;
      apiSecret?: string;
    }
  | {
      apiVersion: "v3";
      apiKey: string;
      apiSecret: string;
    };

interface KitSubscriber {
  id: number;
  first_name?: string | null;
  email_address: string;
}

const kitClient = axios.create({
  baseURL: KIT_API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

const kitV3Client = axios.create({
  baseURL: KIT_V3_API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

function getKitErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const data = error.response?.data as { errors?: string[]; message?: string } | undefined;
    const detail = data?.errors?.join(", ") ?? data?.message ?? error.message;

    if (status === 401) {
      return "Kit rejected the credentials. If you pasted a V3 key, choose Legacy V3 and include the API secret. If you choose V4, use a V4 API key from Kit Developer settings.";
    }

    return detail;
  }

  return error instanceof Error ? error.message : "Kit API request failed.";
}

function authHeaders(apiKey: string) {
  return {
    "X-Kit-Api-Key": apiKey,
  };
}

async function getAllPaginated<T>(
  apiKey: string,
  path: string,
  collectionKey: string,
) {
  const results: T[] = [];
  let after: string | null = null;

  do {
    const response = await kitClient.get(path, {
      headers: authHeaders(apiKey),
      params: {
        per_page: 1000,
        ...(after ? { after } : {}),
      },
    });
    const data = response.data as Record<string, unknown> & {
      pagination?: {
        has_next_page?: boolean;
        end_cursor?: string | null;
      };
    };

    results.push(...((data[collectionKey] as T[] | undefined) ?? []));
    after = data.pagination?.has_next_page ? data.pagination.end_cursor ?? null : null;
  } while (after);

  return results;
}

export async function validateKitConnection(apiKey: string) {
  return validateKitV4Connection(apiKey);
}

export async function validateKitV4Connection(apiKey: string) {
  try {
    await fetchKitTags({ apiVersion: "v4", apiKey });
    return true;
  } catch (error) {
    throw new Error(getKitErrorMessage(error));
  }
}

export async function validateKitV3Connection(apiKey: string, apiSecret: string) {
  try {
    await Promise.all([
      fetchKitTags({ apiVersion: "v3", apiKey, apiSecret }),
      fetchKitForms({ apiVersion: "v3", apiKey, apiSecret }),
    ]);
    return true;
  } catch (error) {
    throw new Error(getKitErrorMessage(error));
  }
}

export async function fetchKitTags(credentials: KitCredentials): Promise<KitTag[]> {
  if (credentials.apiVersion === "v3") {
    try {
      const response = await kitV3Client.get("/tags", {
        params: {
          api_key: credentials.apiKey,
        },
      });
      const tags = (response.data as { tags?: { id: number; name: string }[] }).tags ?? [];

      return tags
        .map((tag) => ({
          id: String(tag.id),
          name: tag.name,
        }))
        .sort((left, right) => left.name.localeCompare(right.name));
    } catch (error) {
      throw new Error(getKitErrorMessage(error));
    }
  }

  try {
    const tags = await getAllPaginated<{ id: number; name: string }>(
      credentials.apiKey,
      "/tags",
      "tags",
    );

    return tags
      .map((tag) => ({
        id: String(tag.id),
        name: tag.name,
      }))
      .sort((left, right) => left.name.localeCompare(right.name));
  } catch (error) {
    throw new Error(getKitErrorMessage(error));
  }
}

export async function fetchKitForms(credentials: KitCredentials): Promise<KitForm[]> {
  if (credentials.apiVersion === "v3") {
    try {
      const response = await kitV3Client.get("/forms", {
        params: {
          api_key: credentials.apiKey,
        },
      });
      const forms =
        (response.data as {
          forms?: { id: number; name: string; type?: string | null; archived?: boolean }[];
        }).forms ?? [];

      return forms
        .filter((form) => !form.archived)
        .map((form) => ({
          id: String(form.id),
          name: form.name,
          type: form.type,
          archived: form.archived,
        }))
        .sort((left, right) => left.name.localeCompare(right.name));
    } catch (error) {
      throw new Error(getKitErrorMessage(error));
    }
  }

  try {
    const forms = await getAllPaginated<{
      id: number;
      name: string;
      type?: string | null;
      archived?: boolean;
    }>(credentials.apiKey, "/forms", "forms");

    return forms
      .filter((form) => !form.archived)
      .map((form) => ({
        id: String(form.id),
        name: form.name,
        type: form.type,
        archived: form.archived,
      }))
      .sort((left, right) => left.name.localeCompare(right.name));
  } catch (error) {
    throw new Error(getKitErrorMessage(error));
  }
}

function deriveFirstName(contact: EmailContact, email: string) {
  const rawName = contact.name?.trim();
  if (!rawName || rawName.toLowerCase() === email.split("@")[0]) {
    return email.split("@")[0];
  }

  return rawName.split(/\s+/)[0] ?? rawName;
}

function splitMergedValue(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function prepareContactsForKit(
  syncResult: SyncResult,
  options: {
    defaultTagId?: string;
    defaultFormId?: string;
    folderTagMappings: KitFolderTagMapping[];
  },
) {
  const uniqueMap = new Map<string, KitPreparedContact>();
  const summary = {
    totalContacts: syncResult.allContacts.length,
    skippedDuplicates: 0,
    invalidEmails: 0,
    ignoredEmails: 0,
  };

  const mappingByFolder = new Map(
    options.folderTagMappings.map((mapping) => [mapping.folderPath, mapping.tagId]),
  );

  for (const contact of syncResult.allContacts) {
    const email = normalizeContactEmail(contact.email);

    if (!email) {
      summary.invalidEmails += 1;
      continue;
    }

    if (IGNORED_PREFIXES.some((prefix) => email.startsWith(prefix))) {
      summary.ignoredEmails += 1;
      continue;
    }

    const sourceFolders = splitMergedValue(contact.sourceFolder);
    const sourceTypes = splitMergedValue(contact.sourceType);
    const tagIds = new Set<string>();

    if (options.defaultTagId) {
      tagIds.add(options.defaultTagId);
    }

    for (const folder of sourceFolders) {
      const mappedTagId = mappingByFolder.get(folder);
      if (mappedTagId) {
        tagIds.add(mappedTagId);
      }
    }

    const existing = uniqueMap.get(email);
    if (existing) {
      summary.skippedDuplicates += 1;
      for (const tagId of tagIds) {
        existing.tagIds.push(tagId);
      }
      existing.tagIds = Array.from(new Set(existing.tagIds));
      existing.sourceFolders = Array.from(
        new Set([...existing.sourceFolders, ...sourceFolders]),
      );
      existing.sourceTypes = Array.from(new Set([...existing.sourceTypes, ...sourceTypes]));
      continue;
    }

    uniqueMap.set(email, {
      email,
      firstName: deriveFirstName(contact, email),
      sourceFolders,
      sourceTypes,
      tagIds: Array.from(tagIds),
      formId: options.defaultFormId,
      contact,
    });
  }

  return {
    contacts: Array.from(uniqueMap.values()),
    summary,
  };
}

async function createOrUpdateSubscriber(apiKey: string, contact: KitPreparedContact) {
  const response = await kitClient.post(
    "/subscribers",
    {
      email_address: contact.email,
      first_name: contact.firstName,
      fields: {
        source_folder: contact.sourceFolders.join(", "),
        source_type: contact.sourceTypes.join(", "),
        import_source: "Email Contact Exporter",
      },
    },
    {
      headers: authHeaders(apiKey),
    },
  );

  return (response.data as { subscriber: KitSubscriber }).subscriber;
}

async function subscribeViaV3(credentials: Extract<KitCredentials, { apiVersion: "v3" }>, contact: KitPreparedContact) {
  const fields = {
    source_folder: contact.sourceFolders.join(", "),
    source_type: contact.sourceTypes.join(", "),
    import_source: "Email Contact Exporter",
  };

  for (const tagId of contact.tagIds) {
    await kitV3Client.post(`/tags/${tagId}/subscribe`, {
      api_secret: credentials.apiSecret,
      email: contact.email,
      first_name: contact.firstName,
      fields,
    });
  }

  if (contact.formId) {
    await kitV3Client.post(`/forms/${contact.formId}/subscribe`, {
      api_key: credentials.apiKey,
      email: contact.email,
      first_name: contact.firstName,
      fields,
      tags: contact.tagIds.map((tagId) => Number(tagId)),
    });
  }

  if (contact.tagIds.length === 0 && !contact.formId) {
    throw new Error("Kit V3 sync requires at least one tag or form target.");
  }
}

export async function addSubscriberToTag(
  apiKey: string,
  subscriberId: number,
  tagId: string,
) {
  await kitClient.post(
    `/tags/${tagId}/subscribers/${subscriberId}`,
    {},
    {
      headers: authHeaders(apiKey),
    },
  );
}

async function addSubscriberToForm(apiKey: string, subscriberId: number, formId: string) {
  await kitClient.post(
    `/forms/${formId}/subscribers/${subscriberId}`,
    {
      referrer: "Email Contact Exporter",
    },
    {
      headers: authHeaders(apiKey),
    },
  );
}

async function syncOneSubscriber(apiKey: string, contact: KitPreparedContact) {
  const subscriber = await createOrUpdateSubscriber(apiKey, contact);

  for (const tagId of contact.tagIds) {
    await addSubscriberToTag(apiKey, subscriber.id, tagId);
  }

  if (contact.formId) {
    await addSubscriberToForm(apiKey, subscriber.id, contact.formId);
  }

  return subscriber;
}

export async function syncSubscribersToKit(
  credentials: KitCredentials,
  contacts: KitPreparedContact[],
) {
  const summary: KitSyncSummary = {
    totalContacts: contacts.length,
    uploaded: 0,
    skippedDuplicates: 0,
    invalidEmails: 0,
    ignoredEmails: 0,
    failedUploads: 0,
    retried: 0,
    logs: [],
  };

  for (let index = 0; index < contacts.length; index += BATCH_SIZE) {
    const batch = contacts.slice(index, index + BATCH_SIZE);
    const batchNumber = Math.floor(index / BATCH_SIZE) + 1;
    summary.logs.push(`Starting batch ${batchNumber} with ${batch.length} contacts.`);

    for (const contact of batch) {
      try {
        if (credentials.apiVersion === "v3") {
          await subscribeViaV3(credentials, contact);
        } else {
          await syncOneSubscriber(credentials.apiKey, contact);
        }
        summary.uploaded += 1;
        summary.logs.push(`Synced ${contact.email}`);
      } catch (firstError) {
        summary.retried += 1;
        try {
          if (credentials.apiVersion === "v3") {
            await subscribeViaV3(credentials, contact);
          } else {
            await syncOneSubscriber(credentials.apiKey, contact);
          }
          summary.uploaded += 1;
          summary.logs.push(`Synced ${contact.email} after retry`);
        } catch (retryError) {
          summary.failedUploads += 1;
          summary.logs.push(`${contact.email}: ${getKitErrorMessage(retryError || firstError)}`);
        }
      }
    }
  }

  return summary;
}

import { z } from "zod";
import { automationTriggers, getAutomationSchedulePreset } from "@/lib/automation";
import { normalizeContactEmail } from "@/lib/email-format";

const contactEmailSchema = z.string().trim().refine((value) => {
  return normalizeContactEmail(value) !== null;
}, "Invalid email").transform((value) => normalizeContactEmail(value) ?? "");

const MAX_SYNC_CONTACTS = 25_000;
const MAX_SYNC_FOLDERS = 50;

export const securityTypeSchema = z.enum(["ssl_tls", "starttls"]);

export const connectionSettingsSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  host: z.string().trim().min(1, "Incoming mail server host is required."),
  port: z.coerce
    .number()
    .int()
    .min(1, "Port must be between 1 and 65535.")
    .max(65535, "Port must be between 1 and 65535."),
  security: securityTypeSchema,
  username: z.string().trim().min(1, "Username is required."),
  password: z.string().min(1, "Password or app password is required."),
  rememberPassword: z.boolean().optional().default(false),
});

export const savedAccountReferenceSchema = z.object({
  savedAccountId: z.string().min(1, "Select a saved email account."),
});

export const imapConnectionInputSchema = z.union([
  z.object({
    settings: connectionSettingsSchema,
  }),
  savedAccountReferenceSchema,
]);

export const savedEmailAccountSchema = connectionSettingsSchema.extend({
  label: z
    .string()
    .trim()
    .min(2, "Use a short label so you can recognize this account later.")
    .max(80, "Label is too long."),
  rememberPassword: z.boolean().optional(),
});

export const updateSavedEmailAccountSchema = savedEmailAccountSchema
  .omit({
    password: true,
  })
  .extend({
    password: z.string().min(1).optional(),
    isDefault: z.boolean().optional(),
  });

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name is required.").max(80, "Name is too long."),
  email: z.string().trim().email("Enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(128, "Password is too long."),
});

export const folderSchema = z.object({
  path: z.string().min(1).max(500),
  name: z.string().min(1).max(500),
  specialUse: z.string().max(100).nullable().optional(),
});

export const emailContactSchema = z.object({
  name: z.string().max(300),
  email: contactEmailSchema,
  sourceFolder: z.string().max(1_000),
  sourceType: z.string().max(200),
  forwardedBy: z.string().max(300),
  originalSender: z.string().max(300),
  subject: z.string().max(1_000),
  firstSeen: z.string().max(100),
  lastSeen: z.string().max(100),
  emailCount: z.number().int().nonnegative(),
});

export const folderSyncResultSchema = z.object({
  folderPath: z.string().min(1).max(500),
  displayName: z.string().min(1).max(500),
  contacts: z.array(emailContactSchema).max(MAX_SYNC_CONTACTS),
  totalMessagesScanned: z.number().int().nonnegative(),
});

export const crossFolderDuplicateSchema = z.object({
  email: contactEmailSchema,
  name: z.string().max(300),
  folders: z.array(z.string().max(500)).min(2).max(MAX_SYNC_FOLDERS),
  totalEmailCount: z.number().int().nonnegative(),
});

export const syncResultSchema = z.object({
  folders: z.array(folderSyncResultSchema).max(MAX_SYNC_FOLDERS),
  allContacts: z.array(emailContactSchema).max(MAX_SYNC_CONTACTS),
  duplicatesAcrossFolders: z.array(crossFolderDuplicateSchema).max(MAX_SYNC_CONTACTS),
});

export const testConnectionRequestSchema = imapConnectionInputSchema;

export const foldersRequestSchema = imapConnectionInputSchema;

export const syncRequestSchema = imapConnectionInputSchema.and(
  z.object({
    folders: z
      .array(z.string().min(1).max(500))
      .min(1, "Select at least one folder.")
      .max(MAX_SYNC_FOLDERS, `Select ${MAX_SYNC_FOLDERS} folders or fewer per sync.`),
  }),
);

export const lastSeenFilterSchema = z
  .object({
    mode: z.enum(["all", "before", "after"]),
    date: z.string().optional(),
  })
  .superRefine((value, context) => {
    if (value.mode === "all") {
      return;
    }

    if (!value.date) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select a last seen date for this export filter.",
        path: ["date"],
      });
      return;
    }

    if (Number.isNaN(new Date(value.date).getTime())) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a valid last seen date.",
        path: ["date"],
      });
    }
  });

export const exportExcelRequestSchema = z.object({
  syncResult: syncResultSchema,
  filter: lastSeenFilterSchema.default({ mode: "all" }),
});

export const exportFileRequestSchema = exportExcelRequestSchema;

export const exportGoogleSheetsRequestSchema = exportFileRequestSchema.extend({
  spreadsheetTitle: z
    .string()
    .trim()
    .min(1, "Spreadsheet title is required.")
    .max(120, "Spreadsheet title is too long.")
    .optional(),
  shareWithEmail: z
    .string()
    .trim()
    .email("Enter a valid Google account email.")
    .optional(),
});

export const ignoredEmailSchema = z.object({
  email: contactEmailSchema,
});

export const kitConnectSchema = z.object({
  apiVersion: z.enum(["v4", "v3"]).default("v4"),
  apiKey: z.string().trim().min(1, "Kit API key is required."),
  apiSecret: z.string().trim().optional(),
  defaultTagId: z.string().trim().optional(),
  defaultFormId: z.string().trim().optional(),
}).superRefine((value, context) => {
  if (value.apiVersion === "v3" && !value.apiSecret) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Kit V3 sync requires the API secret.",
      path: ["apiSecret"],
    });
  }
});

export const kitAccountCreateSchema = z.object({
  name: z.string().trim().min(2, "Kit account name is required.").max(80, "Kit account name is too long."),
  apiVersion: z.enum(["v4", "v3"]).default("v4"),
  apiKey: z.string().trim().min(1, "Kit API key is required."),
  apiSecret: z.string().trim().optional(),
  isDefault: z.boolean().optional(),
}).superRefine((value, context) => {
  if (value.apiVersion === "v3" && !value.apiSecret) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Kit V3 accounts require the API secret.",
      path: ["apiSecret"],
    });
  }
});

export const kitAccountUpdateSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  apiVersion: z.enum(["v4", "v3"]).optional(),
  apiKey: z.string().trim().optional(),
  apiSecret: z.string().trim().optional(),
  isDefault: z.boolean().optional(),
}).superRefine((value, context) => {
  if (value.apiVersion === "v3" && value.apiKey && !value.apiSecret) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Enter the API secret when replacing V3 credentials.",
      path: ["apiSecret"],
    });
  }
});

export const kitMappingSchema = z.object({
  folderPath: z.string().min(1, "Folder path is required."),
  tagId: z.string().min(1, "Select a Kit tag."),
  tagName: z.string().min(1, "Kit tag name is required."),
});

export const kitSettingsUpdateSchema = z.object({
  defaultTagId: z.string().trim().optional(),
  defaultFormId: z.string().trim().optional(),
  folderTagMappings: z.array(kitMappingSchema).default([]),
});

export const kitSyncRequestSchema = z.object({
  syncResult: syncResultSchema,
  defaultTagId: z.string().trim().optional(),
  defaultFormId: z.string().trim().optional(),
  folderTagMappings: z.array(kitMappingSchema).default([]),
});

export const kitAccountSyncRequestSchema = z.object({
  syncResult: syncResultSchema,
  destinationType: z.enum(["tag", "form"]),
  tagId: z.string().trim().optional(),
  formId: z.string().trim().optional(),
  destinationName: z.string().trim().optional(),
}).superRefine((value, context) => {
  if (value.destinationType === "tag" && !value.tagId) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Select a Kit tag.",
      path: ["tagId"],
    });
  }

  if (value.destinationType === "form" && !value.formId) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Select a Kit form.",
      path: ["formId"],
    });
  }
});

export const kitVaultCredentialsSchema = z.object({
  apiVersion: z.enum(["v4", "v3"]).default("v4"),
  apiKey: z.string().trim().min(1),
  apiSecret: z.string().trim().optional(),
}).superRefine((value, context) => {
  if (value.apiVersion === "v3" && !value.apiSecret) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Kit V3 requires an API secret.",
      path: ["apiSecret"],
    });
  }
});

export const kitVaultDestinationsRequestSchema = z.object({
  credentials: kitVaultCredentialsSchema,
});

export const kitVaultSyncRequestSchema = z.object({
  accountName: z.string().trim().min(1).max(80),
  credentials: kitVaultCredentialsSchema,
  syncResult: syncResultSchema,
  destinationType: z.enum(["tag", "form"]),
  tagId: z.string().trim().optional(),
  formId: z.string().trim().optional(),
  destinationName: z.string().trim().optional(),
}).superRefine((value, context) => {
  if (value.destinationType === "tag" && !value.tagId) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Select a Kit tag.",
      path: ["tagId"],
    });
  }

  if (value.destinationType === "form" && !value.formId) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Select a Kit form.",
      path: ["formId"],
    });
  }
});

export const automationRuleCreateSchema = z.object({
  name: z.string().trim().min(2, "Rule name is required.").max(120, "Rule name is too long."),
  trigger: z.enum(automationTriggers),
  enabled: z.boolean().optional().default(true),
  schedule: z.string().trim().max(120, "Schedule is too long.").optional(),
  emailAccountId: z.string().trim().optional(),
  folders: z.array(z.string().trim().min(1)).optional().default([]),
  marketingAccountId: z.string().trim().optional(),
  marketingAccountType: z.enum(["kit", "integration"]).optional(),
  marketingPlatform: z.string().trim().max(80).optional(),
  destinationId: z.string().trim().max(200).optional(),
  destinationName: z.string().trim().max(200).optional(),
  destinationType: z.enum(["tag", "list", "form", "audience", "segment"]).optional(),
  conditionText: z.string().trim().max(500, "Conditions are too long.").optional(),
  actionText: z.string().trim().max(500, "Actions are too long.").optional(),
  nextRunAt: z.string().optional(),
}).superRefine((value, context) => {
  if (value.trigger === "SCHEDULED" && !value.schedule) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Enter a schedule for scheduled rules.",
      path: ["schedule"],
    });
  }

  if (value.trigger === "SCHEDULED" && value.schedule && !getAutomationSchedulePreset(value.schedule)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Choose one of the supported schedule presets.",
      path: ["schedule"],
    });
  }

  if (value.nextRunAt && Number.isNaN(new Date(value.nextRunAt).getTime())) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Enter a valid next run date.",
      path: ["nextRunAt"],
    });
  }

  if (value.trigger === "SCHEDULED" && !value.nextRunAt) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Choose the first scheduled run date and time.",
      path: ["nextRunAt"],
    });
  }

  const hasExportSelection =
    Boolean(value.emailAccountId) ||
    Boolean(value.marketingAccountId) ||
    Boolean(value.marketingAccountType) ||
    Boolean(value.marketingPlatform);
  const requiresExportSelection = hasExportSelection || value.trigger === "SCHEDULED";

  if (!requiresExportSelection) {
    return;
  }

  if (!value.emailAccountId) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Select the email account to export from.",
      path: ["emailAccountId"],
    });
  }

  if (value.folders.length === 0) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Select at least one email folder.",
      path: ["folders"],
    });
  }

  if (!value.marketingAccountId || !value.marketingAccountType || !value.marketingPlatform) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Select the platform account to export to.",
      path: ["marketingAccountId"],
    });
  }

  if (!value.destinationId || !value.destinationName || !value.destinationType) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Select a destination, tag, list, or form.",
      path: ["destinationId"],
    });
  }
});

export const integrationAccountCreateSchema = z.object({
  platform: z.enum([
    "kit",
    "mailchimp",
    "brevo",
    "beehiiv",
    "activecampaign",
    "convertkit_legacy",
    "hubspot",
    "mailerlite",
    "constant_contact",
    "sendgrid_marketing",
    "campaign_monitor",
    "zoho_campaigns",
  ]),
  name: z.string().trim().min(2, "Account name is required.").max(80, "Account name is too long."),
  apiKey: z.string().trim().min(1, "API key is required."),
  apiSecret: z.string().trim().optional(),
  serverPrefix: z.string().trim().optional(),
  externalAccountId: z.string().trim().optional(),
  isDefault: z.boolean().optional().default(false),
});

export const encryptedVaultSchema = z.object({
  name: z.string().trim().min(1).max(80).default("Default Vault"),
  encryptedBlob: z.string().min(1, "Encrypted vault blob is required."),
  salt: z.string().min(16, "Vault salt is required."),
  iv: z.string().min(12, "Vault IV is required."),
  kdf: z.literal("PBKDF2").default("PBKDF2"),
  iterations: z.coerce.number().int().min(100000).max(1000000).default(250000),
});

export const immediateMarketingSyncSchema = z.object({
  platform: z.enum([
    "kit",
    "mailchimp",
    "brevo",
    "beehiiv",
    "activecampaign",
    "hubspot",
    "zoho_campaigns",
  ]),
  accountName: z.string().trim().min(1).max(80),
  credentials: z.object({
    apiKey: z.string().trim().min(1),
    apiSecret: z.string().trim().optional(),
    serverPrefix: z.string().trim().optional(),
    accountId: z.string().trim().optional(),
  }),
  syncResult: syncResultSchema,
  destination: z.object({
    id: z.string().trim().min(1),
    name: z.string().trim().min(1),
    type: z.enum(["tag", "list", "form", "audience", "segment"]),
  }),
});

export const defaultConnectionSettings = {
  email: "",
  host: "outlook.office365.com",
  port: 993,
  security: "ssl_tls" as const,
  username: "",
  password: "",
  rememberPassword: false,
};

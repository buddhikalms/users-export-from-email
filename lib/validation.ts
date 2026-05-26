import { z } from "zod";
import { normalizeContactEmail } from "@/lib/email-format";

const contactEmailSchema = z.string().trim().refine((value) => {
  return normalizeContactEmail(value) !== null;
}, "Invalid email").transform((value) => normalizeContactEmail(value) ?? "");

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
  path: z.string().min(1),
  name: z.string().min(1),
  specialUse: z.string().nullable().optional(),
});

export const emailContactSchema = z.object({
  name: z.string(),
  email: contactEmailSchema,
  sourceFolder: z.string(),
  sourceType: z.string(),
  forwardedBy: z.string(),
  originalSender: z.string(),
  subject: z.string(),
  firstSeen: z.string(),
  lastSeen: z.string(),
  emailCount: z.number().int().nonnegative(),
});

export const folderSyncResultSchema = z.object({
  folderPath: z.string().min(1),
  displayName: z.string().min(1),
  contacts: z.array(emailContactSchema),
  totalMessagesScanned: z.number().int().nonnegative(),
});

export const crossFolderDuplicateSchema = z.object({
  email: contactEmailSchema,
  name: z.string(),
  folders: z.array(z.string()).min(2),
  totalEmailCount: z.number().int().nonnegative(),
});

export const syncResultSchema = z.object({
  folders: z.array(folderSyncResultSchema),
  allContacts: z.array(emailContactSchema),
  duplicatesAcrossFolders: z.array(crossFolderDuplicateSchema),
});

export const testConnectionRequestSchema = imapConnectionInputSchema;

export const foldersRequestSchema = imapConnectionInputSchema;

export const syncRequestSchema = imapConnectionInputSchema.and(
  z.object({
    folders: z.array(z.string().min(1)).min(1, "Select at least one folder."),
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

export const automationRuleCreateSchema = z.object({
  name: z.string().trim().min(2, "Rule name is required.").max(120, "Rule name is too long."),
  trigger: z.enum(["SCHEDULED", "FOLDER_SYNCED", "CONTACT_CREATED", "TAG_MATCHED", "MANUAL"]),
  enabled: z.boolean().optional().default(true),
  schedule: z.string().trim().max(120, "Schedule is too long.").optional(),
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

  if (value.nextRunAt && Number.isNaN(new Date(value.nextRunAt).getTime())) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Enter a valid next run date.",
      path: ["nextRunAt"],
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
  ]),
  name: z.string().trim().min(2, "Account name is required.").max(80, "Account name is too long."),
  apiKey: z.string().trim().min(1, "API key is required."),
  apiSecret: z.string().trim().optional(),
  serverPrefix: z.string().trim().optional(),
  externalAccountId: z.string().trim().optional(),
  isDefault: z.boolean().optional().default(false),
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

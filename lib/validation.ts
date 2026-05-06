import { z } from "zod";
import { normalizeContactEmail } from "@/lib/email-format";

const contactEmailSchema = z.string().trim().refine((value) => {
  return normalizeContactEmail(value) !== null;
}, "Invalid email");

export const securityTypeSchema = z.enum(["ssl_tls", "starttls"]);

export const connectionSettingsSchema = z.object({
  email: z.string().trim().email("Enter a valid Outlook email address."),
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
  savedAccountId: z.string().min(1, "Select a saved Outlook account."),
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

export const defaultConnectionSettings = {
  email: "",
  host: "outlook.office365.com",
  port: 993,
  security: "ssl_tls" as const,
  username: "",
  password: "",
  rememberPassword: false,
};

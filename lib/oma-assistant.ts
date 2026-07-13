export type OmaActionLink = {
  label: string;
  href: string;
};

export type OmaAssistantResponse = {
  title: string;
  message: string;
  checklist: string[];
  needsConfirmation: boolean;
  missingFields: string[];
  actionLinks: OmaActionLink[];
};

type IntentDefinition = {
  id: string;
  title: string;
  keywords: string[];
  missingFields: Array<{
    field: string;
    detector: RegExp;
  }>;
  actionLinks: OmaActionLink[];
  requiresConfirmation: boolean;
  response: (input: string, missingFields: string[]) => string;
  checklist: (missingFields: string[]) => string[];
};

const SENSITIVE_PATTERN =
  /(password|passcode|secret|token|api[_ -]?key|oauth|client[_ -]?secret|app password)\s*[:=]\s*([^\s,;]+)/gi;

const intents: IntentDefinition[] = [
  {
    id: "sync",
    title: "Mailbox Sync",
    keywords: ["sync", "scan", "outlook", "gmail", "imap", "folder", "inbox", "customers", "leads"],
    missingFields: [
      { field: "email account", detector: /(outlook|gmail|imap|exchange|account|sales|support|inbox)/i },
      { field: "folder", detector: /(folder|inbox|sent|sales|customers|leads|archive|newsletter)/i },
      { field: "destination", detector: /(kit|mailchimp|brevo|beehiiv|activecampaign|csv|excel|json|webhook)/i },
    ],
    actionLinks: [
      { label: "Email Sync", href: "/settings" },
      { label: "Folders", href: "/folders" },
      { label: "Sync History", href: "/sync-history" },
    ],
    requiresConfirmation: true,
    response: (_input, missingFields) =>
      missingFields.length
        ? "I can prepare that sync, but I need a little more detail before anything runs."
        : "I can prepare this mailbox sync. Because this may process personal contact data, I will ask for a final confirmation before starting.",
    checklist: (missingFields) =>
      missingFields.length
        ? missingFields.map((field) => `Choose the ${field}.`)
        : [
            "Estimate the folder size before scanning.",
            "Keep duplicate filtering enabled unless you need every occurrence.",
            "Confirm the destination before sending contacts outside OMAZYNC.",
          ],
  },
  {
    id: "export",
    title: "Contact Export",
    keywords: ["export", "csv", "excel", "json", "download", "spreadsheet", "contacts"],
    missingFields: [
      { field: "export format", detector: /(csv|excel|xlsx|json|google sheets|spreadsheet)/i },
      { field: "contact scope", detector: /(all|new|customers|leads|folder|tag|filtered|duplicates|original senders)/i },
    ],
    actionLinks: [
      { label: "Exports", href: "/export" },
      { label: "Contacts", href: "/contacts" },
    ],
    requiresConfirmation: true,
    response: (_input, missingFields) =>
      missingFields.length
        ? "I can help shape the export. I need the format and which contacts should be included first."
        : "I can prepare the export request. I will not export personal data until you confirm the scope and destination.",
    checklist: (missingFields) =>
      missingFields.length
        ? missingFields.map((field) => `Select the ${field}.`)
        : [
            "Review filters and ignored email rules.",
            "Confirm whether duplicates should be skipped.",
            "Generate the file from the Exports workspace.",
          ],
  },
  {
    id: "automation",
    title: "Automation Builder",
    keywords: ["automation", "schedule", "every", "daily", "weekly", "monthly", "friday", "tomorrow", "retry", "backup"],
    missingFields: [
      { field: "schedule", detector: /(daily|weekly|monthly|every|tomorrow|tonight|monday|tuesday|wednesday|thursday|friday|saturday|sunday|cron|\d{1,2}\s?(am|pm))/i },
      { field: "source", detector: /(outlook|gmail|imap|folder|inbox|sales|customers|leads)/i },
      { field: "destination", detector: /(kit|mailchimp|brevo|beehiiv|activecampaign|csv|excel|json|report|email)/i },
    ],
    actionLinks: [
      { label: "Automation", href: "/automation" },
      { label: "Integrations", href: "/dashboard/integrations" },
    ],
    requiresConfirmation: true,
    response: (_input, missingFields) =>
      missingFields.length
        ? "I can draft this automation once the schedule, source, and destination are clear."
        : "This sounds ready to convert into an automation rule. Recurring schedules need confirmation before I create or enable them.",
    checklist: (missingFields) =>
      missingFields.length
        ? missingFields.map((field) => `Define the ${field}.`)
        : [
            "Verify account ownership and destination access.",
            "Review the first-run estimate.",
            "Confirm the recurring schedule before enabling it.",
          ],
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    keywords: ["failed", "error", "why", "timeout", "invalid", "credentials", "rate limit", "permission", "missing"],
    missingFields: [
      { field: "failed run or page", detector: /(sync|export|automation|connection|kit|mailchimp|brevo|log|history|run)/i },
    ],
    actionLinks: [
      { label: "Logs", href: "/logs" },
      { label: "Sync History", href: "/sync-history" },
      { label: "Security Vault", href: "/settings/security-vault" },
    ],
    requiresConfirmation: false,
    response: (_input, missingFields) =>
      missingFields.length
        ? "I can troubleshoot this. Tell me whether the issue happened during sync, export, automation, or connection testing."
        : "I can help diagnose this from the relevant logs and connection state. I will separate likely cause from confirmed facts.",
    checklist: () => [
      "Check the latest run status and error message.",
      "Test the mailbox or integration connection.",
      "Retry only after the cause is understood.",
    ],
  },
  {
    id: "reporting",
    title: "Reports and Statistics",
    keywords: ["report", "statistics", "stats", "how many", "this month", "today", "weekly", "success rate", "largest"],
    missingFields: [
      { field: "report period", detector: /(today|yesterday|week|weekly|month|monthly|year|last \d+ days)/i },
    ],
    actionLinks: [
      { label: "Analytics", href: "/analytics" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Sync History", href: "/sync-history" },
    ],
    requiresConfirmation: false,
    response: (_input, missingFields) =>
      missingFields.length
        ? "I can help with that report. Choose the period first so the numbers stay precise."
        : "I can guide you to the matching report view and summarize results once the data is loaded.",
    checklist: (missingFields) =>
      missingFields.length
        ? missingFields.map((field) => `Choose the ${field}.`)
        : ["Open analytics.", "Review sync, export, and automation totals.", "Share the report only with authorized recipients."],
  },
];

const fallbackLinks: OmaActionLink[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Helpful starting point", href: "/settings" },
  { label: "Automation", href: "/automation" },
];

export function maskSensitiveText(input: string) {
  return input.replace(SENSITIVE_PATTERN, (_match, label: string) => `${label}: [hidden]`);
}

export function getOmaAssistantResponse(input: string): OmaAssistantResponse {
  const cleanedInput = maskSensitiveText(input.trim());
  const normalized = cleanedInput.toLowerCase();

  const rankedIntents = intents
    .map((intent) => ({
      intent,
      score: intent.keywords.reduce((total, keyword) => (normalized.includes(keyword) ? total + 1 : total), 0),
    }))
    .sort((a, b) => b.score - a.score);

  const selected = rankedIntents[0]?.score ? rankedIntents[0].intent : null;

  if (!selected) {
    return {
      title: "OMA Assistant",
      message:
        "I can help with mailbox syncs, exports, integrations, automations, reports, and troubleshooting. Tell me the outcome you want, and I will turn it into a safe next step.",
      checklist: [
        "Name the mailbox, folder, or workflow.",
        "Say where contacts should go.",
        "I will ask before exporting data, changing settings, or creating schedules.",
      ],
      needsConfirmation: false,
      missingFields: [],
      actionLinks: fallbackLinks,
    };
  }

  const missingFields = selected.missingFields
    .filter(({ detector }) => !detector.test(cleanedInput))
    .map(({ field }) => field);

  return {
    title: selected.title,
    message: selected.response(cleanedInput, missingFields),
    checklist: selected.checklist(missingFields),
    needsConfirmation: selected.requiresConfirmation,
    missingFields,
    actionLinks: selected.actionLinks,
  };
}


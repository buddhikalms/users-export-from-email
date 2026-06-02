export const automationTriggers = [
  "SCHEDULED",
  "FOLDER_SYNCED",
  "CONTACT_CREATED",
  "TAG_MATCHED",
  "MANUAL",
] as const;

export type AutomationTriggerValue = (typeof automationTriggers)[number];

export const automationSchedulePresets = [
  {
    value: "every_15_minutes",
    label: "Every 15 minutes",
    schedule: "every 15 minutes",
    minutes: 15,
  },
  {
    value: "hourly",
    label: "Hourly",
    schedule: "hourly",
    minutes: 60,
  },
  {
    value: "daily",
    label: "Daily",
    schedule: "daily",
    minutes: 60 * 24,
  },
  {
    value: "weekly",
    label: "Weekly",
    schedule: "weekly",
    minutes: 60 * 24 * 7,
  },
] as const;

export type AutomationSchedulePresetValue =
  (typeof automationSchedulePresets)[number]["value"];

export function getAutomationSchedulePreset(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  return (
    automationSchedulePresets.find(
      (preset) => preset.value === normalized || preset.schedule === normalized,
    ) ?? null
  );
}

export function getNextRunFromSchedule(
  schedule: string | null | undefined,
  from: Date = new Date(),
) {
  const preset = getAutomationSchedulePreset(schedule);

  if (!preset) {
    return null;
  }

  return new Date(from.getTime() + preset.minutes * 60 * 1000);
}

export function buildAutomationRulePayload({
  actionText,
  emailAccountId,
  marketingAccountId,
  marketingAccountType,
  marketingPlatform,
  conditionText,
  ruleId,
  schedule,
  trigger,
}: {
  actionText?: string;
  conditionText?: string;
  emailAccountId?: string;
  marketingAccountId?: string;
  marketingAccountType?: "kit" | "integration";
  marketingPlatform?: string;
  ruleId: string;
  schedule?: string | null;
  trigger: AutomationTriggerValue;
}) {
  return {
    ruleId,
    trigger,
    schedule: schedule || null,
    conditionText: conditionText || null,
    actionText: actionText || null,
    emailAccountId: emailAccountId || null,
    marketingAccountId: marketingAccountId || null,
    marketingAccountType: marketingAccountType || null,
    marketingPlatform: marketingPlatform || null,
    action: emailAccountId && marketingAccountId ? "EXPORT_CONTACTS_TO_PLATFORM" : null,
  };
}

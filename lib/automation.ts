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
  {
    value: "monthly",
    label: "Monthly",
    schedule: "monthly",
    minutes: 60 * 24 * 30,
  },
] as const;

export type AutomationSchedulePresetValue =
  (typeof automationSchedulePresets)[number]["value"];

export function getAutomationSchedulePreset(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  if (parseMonthlyScheduleDay(normalized)) {
    return automationSchedulePresets.find((preset) => preset.value === "monthly") ?? null;
  }

  return (
    automationSchedulePresets.find(
      (preset) => preset.value === normalized || preset.schedule === normalized,
    ) ?? null
  );
}

export function buildMonthlySchedule(day: number | string) {
  const parsedDay = Number(day);
  const safeDay = Number.isInteger(parsedDay)
    ? Math.min(31, Math.max(1, parsedDay))
    : 1;

  return `monthly:${safeDay}`;
}

export function parseMonthlyScheduleDay(schedule: string | null | undefined) {
  const match = schedule?.trim().toLowerCase().match(/^monthly:(\d{1,2})$/);
  if (!match) {
    return null;
  }

  const day = Number(match[1]);
  if (!Number.isInteger(day) || day < 1 || day > 31) {
    return null;
  }

  return day;
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getNextMonthlyRun(day: number, from: Date) {
  const next = new Date(from);
  next.setSeconds(0, 0);

  const setSafeDay = () => {
    next.setDate(Math.min(day, daysInMonth(next.getFullYear(), next.getMonth())));
  };

  setSafeDay();
  if (next <= from) {
    next.setMonth(next.getMonth() + 1, 1);
    setSafeDay();
  }

  return next;
}

export function getNextRunFromSchedule(
  schedule: string | null | undefined,
  from: Date = new Date(),
) {
  const monthlyDay = parseMonthlyScheduleDay(schedule);
  if (monthlyDay) {
    return getNextMonthlyRun(monthlyDay, from);
  }

  const preset = getAutomationSchedulePreset(schedule);

  if (!preset) {
    return null;
  }

  return new Date(from.getTime() + preset.minutes * 60 * 1000);
}

export function buildAutomationRulePayload({
  actionText,
  emailAccountId,
  folders,
  marketingAccountId,
  marketingAccountType,
  marketingPlatform,
  destinationId,
  destinationName,
  destinationType,
  conditionText,
  ruleId,
  schedule,
  trigger,
}: {
  actionText?: string;
  conditionText?: string;
  emailAccountId?: string;
  folders?: string[];
  marketingAccountId?: string;
  marketingAccountType?: "kit" | "integration";
  marketingPlatform?: string;
  destinationId?: string;
  destinationName?: string;
  destinationType?: string;
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
    folders: folders ?? [],
    marketingAccountId: marketingAccountId || null,
    marketingAccountType: marketingAccountType || null,
    marketingPlatform: marketingPlatform || null,
    destinationId: destinationId || null,
    destinationName: destinationName || null,
    destinationType: destinationType || null,
    action: emailAccountId && marketingAccountId ? "EXPORT_CONTACTS_TO_PLATFORM" : null,
  };
}

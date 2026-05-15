import { cleanEmail } from "@/lib/email-cleaner";

export const CONTACT_EMAIL_PATTERN =
  /^[a-z0-9](?:[a-z0-9.!#$%&'*+/=?^_`{|}~-]{0,62}[a-z0-9])?@(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;

export function isValidContactEmail(value: string) {
  const normalized = cleanEmail(value);
  if (!CONTACT_EMAIL_PATTERN.test(normalized)) {
    return false;
  }

  const [localPart, domain] = normalized.split("@");
  if (!localPart || !domain || localPart.length > 64 || normalized.length > 254) {
    return false;
  }

  return !localPart.includes("..") && !domain.includes("..");
}

export function normalizeContactEmail(value: string) {
  const normalized = cleanEmail(value);
  return isValidContactEmail(normalized) ? normalized : null;
}

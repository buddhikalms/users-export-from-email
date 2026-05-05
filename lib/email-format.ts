export const CONTACT_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

export function normalizeContactEmail(value: string) {
  const normalized = value.trim().toLowerCase();
  return CONTACT_EMAIL_PATTERN.test(normalized) ? normalized : null;
}

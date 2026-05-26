import { cleanEmail } from "@/lib/email-cleaner";

const PERSONAL_DOMAINS = new Set([
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "icloud.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
]);

const ROLE_PREFIXES = new Set([
  "admin",
  "billing",
  "contact",
  "hello",
  "info",
  "marketing",
  "sales",
  "support",
  "team",
]);

export function getEmailDomain(email: string) {
  const normalized = cleanEmail(email);
  return normalized.includes("@") ? normalized.split("@").at(-1) ?? "" : "";
}

export function detectCompanyFromEmail(email: string) {
  const domain = getEmailDomain(email);
  if (!domain || PERSONAL_DOMAINS.has(domain)) {
    return null;
  }

  const label = domain.split(".")[0] ?? "";
  return label
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}

export function classifyEmail(email: string) {
  const normalized = cleanEmail(email);
  const [localPart = ""] = normalized.split("@");
  const domain = getEmailDomain(normalized);

  if (!normalized.includes("@")) {
    return "UNKNOWN";
  }

  if (ROLE_PREFIXES.has(localPart.toLowerCase())) {
    return "ROLE_BASED";
  }

  if (PERSONAL_DOMAINS.has(domain)) {
    return "PERSONAL";
  }

  return "BUSINESS";
}

export function scoreDuplicate(candidate: {
  email: string;
  name?: string | null;
  sourceFolder?: string | null;
  originalSender?: string | null;
}) {
  let score = 50;

  if (candidate.name) {
    score += 15;
  }

  if (candidate.sourceFolder) {
    score += 10;
  }

  if (candidate.originalSender) {
    score += 15;
  }

  if (classifyEmail(candidate.email) === "ROLE_BASED") {
    score -= 20;
  }

  return Math.max(0, Math.min(100, score));
}

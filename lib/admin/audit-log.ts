import { headers } from "next/headers";
import type { Prisma } from "@prisma/client";

import { db } from "@/lib/db";

const SECRET_PATTERNS = [/password/i, /token/i, /secret/i, /api[_-]?key/i, /authorization/i, /credential/i];

function redact(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(redact);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        SECRET_PATTERNS.some((pattern) => pattern.test(key)) ? "[redacted]" : redact(item),
      ]),
    );
  }

  return value;
}

export async function writeAdminAuditLog(input: {
  adminUserId?: string | null;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  before?: unknown;
  after?: unknown;
  requestId?: string | null;
}) {
  try {
    const headerStore = await headers();
    await db.adminAuditLog.create({
      data: {
        adminUserId: input.adminUserId ?? null,
        action: input.action,
        resourceType: input.resourceType,
        resourceId: input.resourceId ?? null,
        beforeState: input.before === undefined ? undefined : (redact(input.before) as Prisma.InputJsonValue),
        afterState: input.after === undefined ? undefined : (redact(input.after) as Prisma.InputJsonValue),
        ipAddress:
          headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          headerStore.get("x-real-ip") ??
          null,
        userAgent: headerStore.get("user-agent"),
        requestId: input.requestId ?? headerStore.get("x-request-id"),
      },
    });
  } catch (error) {
    console.error("admin_audit_log_failed", error);
  }
}

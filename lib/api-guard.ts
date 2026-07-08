import { NextResponse } from "next/server";
import { ZodError } from "zod";

type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
};

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitBucket>();

const SECRET_PATTERNS = [
  /password/i,
  /api[_-]?key/i,
  /api[_-]?secret/i,
  /token/i,
  /authorization/i,
  /secret/i,
];

function now() {
  return Date.now();
}

export function getClientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function rateLimit(request: Request, options: Omit<RateLimitOptions, "key"> & { scope: string }) {
  const current = now();
  const key = `${options.scope}:${getClientIp(request)}`;
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= current) {
    buckets.set(key, { count: 1, resetAt: current + options.windowMs });
    return null;
  }

  existing.count += 1;

  if (existing.count <= options.limit) {
    return null;
  }

  const retryAfter = Math.ceil((existing.resetAt - current) / 1000);
  return NextResponse.json(
    { error: "Too many requests. Please wait and try again." },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
      },
    },
  );
}

export async function readJsonWithLimit<T = unknown>(request: Request, maxBytes: number): Promise<T> {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > maxBytes) {
    throw new ApiError("Request body is too large.", 413);
  }

  const body = await request.text();
  if (Buffer.byteLength(body, "utf8") > maxBytes) {
    throw new ApiError("Request body is too large.", 413);
  }

  try {
    return JSON.parse(body) as T;
  } catch {
    throw new ApiError("Invalid JSON request body.", 400);
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 500,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function getSafeErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? fallback;
  }

  return fallback;
}

export function getErrorStatus(error: unknown, fallback = 500) {
  return error instanceof ApiError ? error.statusCode : fallback;
}

export async function withTimeout<T>(
  operation: Promise<T>,
  timeoutMs: number,
  message = "The request took too long. Please try again.",
) {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      operation,
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => reject(new ApiError(message, 504)), timeoutMs);
      }),
    ]);
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}

function scrubValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(scrubValue);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        SECRET_PATTERNS.some((pattern) => pattern.test(key)) ? "[redacted]" : scrubValue(item),
      ]),
    );
  }

  return value;
}

export function logApiEvent(
  level: "info" | "warn" | "error",
  event: string,
  metadata: Record<string, unknown> = {},
) {
  const payload = {
    level,
    event,
    timestamp: new Date().toISOString(),
    ...(scrubValue(metadata) as Record<string, unknown>),
  };

  const line = JSON.stringify(payload);
  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.info(line);
  }
}

export async function timeOperation<T>(
  event: string,
  metadata: Record<string, unknown>,
  operation: () => Promise<T>,
) {
  const startedAt = performance.now();
  try {
    const result = await operation();
    logApiEvent("info", event, {
      ...metadata,
      durationMs: Math.round(performance.now() - startedAt),
      status: "success",
    });
    return result;
  } catch (error) {
    logApiEvent("error", event, {
      ...metadata,
      durationMs: Math.round(performance.now() - startedAt),
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
    throw error;
  }
}

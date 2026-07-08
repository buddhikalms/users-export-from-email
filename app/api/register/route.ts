import { NextResponse } from "next/server";

import {
  getErrorStatus,
  getSafeErrorMessage,
  logApiEvent,
  rateLimit,
  readJsonWithLimit,
} from "@/lib/api-guard";
import { getNextUserRole, hashPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const limited = rateLimit(request, { scope: "register", limit: 5, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const json = await readJsonWithLimit(request, 16_000);
    const parsed = registerSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message ?? "Invalid registration request.",
        },
        { status: 400 },
      );
    }

    const existingUser = await db.user.findUnique({
      where: {
        email: parsed.data.email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: "An account already exists for this email address.",
        },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(parsed.data.password);

    const user = await db.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash,
        role: await getNextUserRole(),
        subscription: {
          create: {
            plan: "FREE",
            status: "FREE",
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({
      user,
      message: "Your account has been created. You can sign in now.",
    });
  } catch (error) {
    logApiEvent("error", "register.failed", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      {
        error: getSafeErrorMessage(error, "Unable to create your account right now."),
      },
      { status: getErrorStatus(error) },
    );
  }
}

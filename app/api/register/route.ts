import { NextResponse } from "next/server";

import { getNextUserRole, hashPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const json = await request.json();
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
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create your account right now.",
      },
      { status: 500 },
    );
  }
}

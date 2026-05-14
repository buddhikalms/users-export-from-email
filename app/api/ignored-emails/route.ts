import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/auth";
import { addIgnoredEmail, listIgnoredEmails } from "@/lib/ignored-emails";
import { ignoredEmailSchema } from "@/lib/validation";

export const runtime = "nodejs";

async function getSessionUserId() {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const ignoredEmails = await listIgnoredEmails(userId);
  return NextResponse.json({ ignoredEmails });
}

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const json = await request.json();
    const parsed = ignoredEmailSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ??
            "Enter a valid email address to ignore.",
        },
        { status: 400 },
      );
    }

    const ignoredEmail = await addIgnoredEmail(userId, parsed.data.email);

    return NextResponse.json({
      ignoredEmail,
      message: `${ignoredEmail.email} will be skipped during future exports.`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to save the ignored email.",
      },
      { status: 500 },
    );
  }
}

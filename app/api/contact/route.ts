import { NextResponse } from "next/server";
import { z } from "zod";

import {
  getErrorStatus,
  getSafeErrorMessage,
  logApiEvent,
  rateLimit,
  readJsonWithLimit,
} from "@/lib/api-guard";
import { sendContactNotifications } from "@/lib/notifications";

export const runtime = "nodejs";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Name is required.").max(80, "Name is too long."),
  email: z.string().trim().email("Enter a valid email address."),
  company: z.string().trim().max(120, "Company is too long.").optional(),
  message: z.string().trim().min(10, "Message must be at least 10 characters.").max(2_000, "Message is too long."),
});

export async function POST(request: Request) {
  const limited = rateLimit(request, { scope: "contact", limit: 5, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const json = await readJsonWithLimit(request, 8_000);
    const parsed = contactSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid contact request." },
        { status: 400 },
      );
    }

    await sendContactNotifications(parsed.data);

    return NextResponse.json({
      message: "Thanks. Your message has been sent.",
    });
  } catch (error) {
    logApiEvent("error", "contact.failed", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      { error: getSafeErrorMessage(error, "Unable to send your message right now.") },
      { status: getErrorStatus(error) },
    );
  }
}

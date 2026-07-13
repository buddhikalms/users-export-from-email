import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/auth";
import { db } from "@/lib/db";
import {
  billingIntervalSchema,
  getPayPalClientId,
  getPayPalPlanId,
  paidPlanSchema,
} from "@/lib/paypal";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Sign in before starting checkout." },
      { status: 401 },
    );
  }

  const currentSubscription = await db.subscription.findUnique({
    where: { userId: session.user.id },
    select: { status: true, plan: true },
  });
  if (
    currentSubscription &&
    ["ACTIVE", "APPROVAL_PENDING"].includes(currentSubscription.status)
  ) {
    return NextResponse.json(
      {
        error: `You already have an ${currentSubscription.plan.toLowerCase()} subscription. Contact support before changing plans.`,
      },
      { status: 409 },
    );
  }

  const url = new URL(request.url);
  const plan = paidPlanSchema.safeParse(url.searchParams.get("plan"));
  const interval = billingIntervalSchema.safeParse(
    url.searchParams.get("interval"),
  );
  if (!plan.success || !interval.success) {
    return NextResponse.json({ error: "Invalid billing plan." }, { status: 400 });
  }

  try {
    return NextResponse.json({
      clientId: getPayPalClientId(),
      planId: await getPayPalPlanId(plan.data, interval.data),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "PayPal is not configured." },
      { status: 503 },
    );
  }
}

import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

import { authOptions } from "@/auth";
import { db } from "@/lib/db";
import { findPlanByPayPalId, paypalRequest } from "@/lib/paypal";

export const runtime = "nodejs";

const confirmationSchema = z.object({
  subscriptionId: z.string().trim().min(5).max(100),
});

type PayPalSubscription = {
  id: string;
  plan_id: string;
  status: string;
  subscriber?: { email_address?: string };
  billing_info?: { next_billing_time?: string };
};

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const parsed = confirmationSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid subscription." }, { status: 400 });
  }

  try {
    const subscription = await paypalRequest<PayPalSubscription>(
      `/v1/billing/subscriptions/${encodeURIComponent(parsed.data.subscriptionId)}`,
    );
    const selection = findPlanByPayPalId(subscription.plan_id);
    if (!selection) {
      return NextResponse.json(
        { error: "This PayPal plan does not belong to Omazync." },
        { status: 400 },
      );
    }
    if (!["ACTIVE", "APPROVAL_PENDING"].includes(subscription.status)) {
      return NextResponse.json(
        { error: `PayPal subscription is ${subscription.status.toLowerCase()}.` },
        { status: 409 },
      );
    }

    const existingOwner = await db.subscription.findUnique({
      where: { paypalSubscriptionId: subscription.id },
      select: { userId: true },
    });
    if (existingOwner && existingOwner.userId !== session.user.id) {
      return NextResponse.json(
        { error: "This PayPal subscription is already linked to another account." },
        { status: 409 },
      );
    }

    const saved = await db.subscription.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        plan: selection.plan.toUpperCase() as "STARTER" | "PROFESSIONAL" | "BUSINESS",
        interval: selection.interval.toUpperCase() as "MONTHLY" | "YEARLY",
        status: subscription.status as "ACTIVE" | "APPROVAL_PENDING",
        paypalSubscriptionId: subscription.id,
        paypalPlanId: subscription.plan_id,
        payerEmail: subscription.subscriber?.email_address,
        currentPeriodEnd: subscription.billing_info?.next_billing_time
          ? new Date(subscription.billing_info.next_billing_time)
          : null,
      },
      update: {
        plan: selection.plan.toUpperCase() as "STARTER" | "PROFESSIONAL" | "BUSINESS",
        interval: selection.interval.toUpperCase() as "MONTHLY" | "YEARLY",
        status: subscription.status as "ACTIVE" | "APPROVAL_PENDING",
        paypalSubscriptionId: subscription.id,
        paypalPlanId: subscription.plan_id,
        payerEmail: subscription.subscriber?.email_address,
        currentPeriodEnd: subscription.billing_info?.next_billing_time
          ? new Date(subscription.billing_info.next_billing_time)
          : null,
      },
      select: { plan: true, status: true },
    });

    return NextResponse.json({
      message: `${saved.plan.toLowerCase()} plan activated successfully.`,
      subscription: saved,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to verify the subscription." },
      { status: 502 },
    );
  }
}

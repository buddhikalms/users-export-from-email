import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

import { authOptions } from "@/auth";
import { db } from "@/lib/db";
import { paypalRequest } from "@/lib/paypal";

export const runtime = "nodejs";

const cancelSchema = z.object({
  reason: z.string().trim().max(300).optional(),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const parsed = cancelSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid cancellation request." }, { status: 400 });
  }

  const subscription = await db.subscription.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      paypalSubscriptionId: true,
      status: true,
    },
  });

  if (!subscription?.paypalSubscriptionId) {
    return NextResponse.json({ error: "No PayPal subscription is linked to this account." }, { status: 404 });
  }

  if (!["ACTIVE", "APPROVAL_PENDING", "SUSPENDED"].includes(subscription.status)) {
    return NextResponse.json({ error: `Subscription is already ${subscription.status.toLowerCase()}.` }, { status: 409 });
  }

  try {
    await paypalRequest<void>(
      `/v1/billing/subscriptions/${encodeURIComponent(subscription.paypalSubscriptionId)}/cancel`,
      {
        method: "POST",
        body: JSON.stringify({
          reason: parsed.data.reason || "Cancelled from OMAZYNC account settings.",
        }),
      },
    );

    const saved = await db.subscription.update({
      where: { id: subscription.id },
      data: { status: "CANCELLED" },
      select: { plan: true, status: true },
    });

    return NextResponse.json({
      message: "Your PayPal subscription has been cancelled.",
      subscription: saved,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to cancel PayPal subscription." },
      { status: 502 },
    );
  }
}

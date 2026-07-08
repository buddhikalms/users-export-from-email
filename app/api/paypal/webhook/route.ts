import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { findPlanByPayPalId, paypalRequest } from "@/lib/paypal";

export const runtime = "nodejs";

type WebhookEvent = {
  id: string;
  event_type: string;
  resource?: {
    id?: string;
    plan_id?: string;
    billing_agreement_id?: string;
    status?: string;
    subscriber?: { email_address?: string };
    billing_info?: { next_billing_time?: string };
  };
};

async function verifyWebhook(request: Request, event: WebhookEvent) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) throw new Error("PAYPAL_WEBHOOK_ID is not configured.");

  const verification = await paypalRequest<{ verification_status: string }>(
    "/v1/notifications/verify-webhook-signature",
    {
      method: "POST",
      body: JSON.stringify({
        auth_algo: request.headers.get("paypal-auth-algo"),
        cert_url: request.headers.get("paypal-cert-url"),
        transmission_id: request.headers.get("paypal-transmission-id"),
        transmission_sig: request.headers.get("paypal-transmission-sig"),
        transmission_time: request.headers.get("paypal-transmission-time"),
        webhook_id: webhookId,
        webhook_event: event,
      }),
    },
  );
  return verification.verification_status === "SUCCESS";
}

export async function POST(request: Request) {
  let event: WebhookEvent;
  try {
    event = JSON.parse(await request.text()) as WebhookEvent;
    if (!event.id || !event.event_type || !(await verifyWebhook(request, event))) {
      return NextResponse.json({ error: "Invalid PayPal signature." }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid webhook." },
      { status: 400 },
    );
  }

  const resource = event.resource ?? {};
  const subscriptionId = resource.billing_agreement_id ?? resource.id;
  const alreadyProcessed = await db.payPalWebhookEvent.findUnique({
    where: { paypalEventId: event.id },
  });
  if (alreadyProcessed) return NextResponse.json({ received: true });

  await db.$transaction(async (tx) => {
    await tx.payPalWebhookEvent.create({
      data: {
        paypalEventId: event.id,
        eventType: event.event_type,
        resourceId: subscriptionId,
      },
    });

    if (!subscriptionId) return;

    if (event.event_type === "PAYMENT.SALE.COMPLETED") {
      await tx.subscription.updateMany({
        where: { paypalSubscriptionId: subscriptionId },
        data: { lastPaymentAt: new Date(), status: "ACTIVE" },
      });
      return;
    }

    const statusByEvent = {
      "BILLING.SUBSCRIPTION.ACTIVATED": "ACTIVE",
      "BILLING.SUBSCRIPTION.SUSPENDED": "SUSPENDED",
      "BILLING.SUBSCRIPTION.CANCELLED": "CANCELLED",
      "BILLING.SUBSCRIPTION.EXPIRED": "EXPIRED",
    } as const;
    const status = statusByEvent[event.event_type as keyof typeof statusByEvent];
    if (!status) return;

    const selection = resource.plan_id
      ? findPlanByPayPalId(resource.plan_id)
      : null;
    await tx.subscription.updateMany({
      where: { paypalSubscriptionId: subscriptionId },
      data: {
        status,
        ...(selection
          ? {
              plan: selection.plan.toUpperCase() as "STARTER" | "PROFESSIONAL" | "BUSINESS",
              interval: selection.interval.toUpperCase() as "MONTHLY" | "YEARLY",
            }
          : {}),
        payerEmail: resource.subscriber?.email_address,
        currentPeriodEnd: resource.billing_info?.next_billing_time
          ? new Date(resource.billing_info.next_billing_time)
          : undefined,
      },
    });
  });

  return NextResponse.json({ received: true });
}

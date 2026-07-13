"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircle, CreditCard, Loader2 } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type SubscriptionSummary = {
  plan: string;
  interval: string;
  status: string;
  paypalSubscriptionId: string | null;
  currentPeriodEnd: Date | string | null;
};

function formatLabel(value: string) {
  return value.replace(/_/g, " ").toLowerCase();
}

function formatDate(value: Date | string | null) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(value));
}

export function BillingManagement({
  subscription,
}: {
  subscription: SubscriptionSummary | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const status = subscription?.status ?? "FREE";
  const canCancel = Boolean(
    subscription?.paypalSubscriptionId &&
      ["ACTIVE", "APPROVAL_PENDING", "SUSPENDED"].includes(status),
  );

  async function cancelSubscription() {
    if (!window.confirm("Cancel your current PayPal subscription? You can choose a new plan from pricing after cancellation.")) {
      return;
    }

    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch("/api/paypal/subscriptions/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "User requested cancellation before changing plan." }),
      });
      const body = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) throw new Error(body.error ?? "Unable to cancel subscription.");
      setMessage(body.message ?? "Subscription cancelled.");
      router.refresh();
    } catch (cancelError) {
      setError(cancelError instanceof Error ? cancelError.message : "Unable to cancel subscription.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <CreditCard className="h-4 w-4" />
            Billing
          </div>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">Plan & Subscription</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Manage your current plan, choose a higher package, or cancel your PayPal subscription.
          </p>
        </div>
        <Badge>{formatLabel(status)}</Badge>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-background/70 p-3">
          <p className="text-xs font-medium text-muted-foreground">Current plan</p>
          <p className="mt-1 font-semibold capitalize">{formatLabel(subscription?.plan ?? "FREE")}</p>
        </div>
        <div className="rounded-xl border border-border bg-background/70 p-3">
          <p className="text-xs font-medium text-muted-foreground">Billing interval</p>
          <p className="mt-1 font-semibold capitalize">{formatLabel(subscription?.interval ?? "MONTHLY")}</p>
        </div>
        <div className="rounded-xl border border-border bg-background/70 p-3">
          <p className="text-xs font-medium text-muted-foreground">Access until</p>
          <p className="mt-1 font-semibold">{formatDate(subscription?.currentPeriodEnd ?? null)}</p>
        </div>
      </div>

      {message ? (
        <Alert className="mt-4 border-emerald-500/30 bg-emerald-500/10">
          <AlertTitle>Subscription updated</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}

      {error ? (
        <Alert className="mt-4 border-destructive/30 bg-destructive/5">
          <AlertCircle className="mb-2 h-4 w-4" />
          <AlertTitle>Billing action failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        <Button asChild>
          <Link href="/pricing">{status === "FREE" || status === "CANCELLED" ? "Upgrade Plan" : "Change Plan"}</Link>
        </Button>
        {canCancel ? (
          <Button disabled={loading} onClick={() => void cancelSubscription()} variant="outline">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Cancel Subscription
          </Button>
        ) : null}
      </div>

      {canCancel ? (
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          To upgrade or change packages, cancel the current PayPal subscription first, then select the new package from pricing.
        </p>
      ) : null}
    </section>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Loader2, LockKeyhole } from "lucide-react";

import { Button } from "@/components/ui/button";

type PayPalPlan = "starter" | "professional" | "business";
type BillingInterval = "monthly";

type PayPalButtonsInstance = {
  render: (container: HTMLElement) => Promise<void>;
  close?: () => Promise<void>;
};

type PayPalNamespace = {
  Buttons: (options: {
    style?: Record<string, string | number>;
    createSubscription: (
      data: unknown,
      actions: {
        subscription: {
          create: (input: { plan_id: string }) => Promise<string>;
        };
      },
    ) => Promise<string>;
    onApprove: (data: { subscriptionID?: string }) => Promise<void>;
    onCancel: () => void;
    onError: (error: unknown) => void;
  }) => PayPalButtonsInstance;
};

declare global {
  interface Window {
    paypal?: PayPalNamespace;
  }
}

let sdkPromise: Promise<PayPalNamespace> | null = null;
let loadedClientId: string | null = null;

function loadPayPalSdk(clientId: string) {
  if (window.paypal && loadedClientId === clientId) {
    return Promise.resolve(window.paypal);
  }
  if (sdkPromise && loadedClientId === clientId) return sdkPromise;

  loadedClientId = clientId;
  sdkPromise = new Promise((resolve, reject) => {
    document
      .querySelector<HTMLScriptElement>('script[data-omazync-paypal="true"]')
      ?.remove();
    delete window.paypal;

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&components=buttons&currency=USD&vault=true&intent=subscription`;
    script.async = true;
    script.dataset.omazyncPaypal = "true";
    script.onload = () =>
      window.paypal
        ? resolve(window.paypal)
        : reject(new Error("PayPal did not initialize."));
    script.onerror = () => reject(new Error("Unable to load PayPal checkout."));
    document.head.appendChild(script);
  });
  return sdkPromise;
}

export function PayPalCheckout({
  plan,
  interval,
}: {
  plan: PayPalPlan;
  interval: BillingInterval;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<
    "loading" | "ready" | "signed-out" | "unavailable" | "success" | "cancelled"
  >("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    let buttons: PayPalButtonsInstance | undefined;

    async function initialize() {
      setState("loading");
      setMessage("");
      if (containerRef.current) containerRef.current.innerHTML = "";

      try {
        const response = await fetch(
          `/api/paypal/config?plan=${plan}&interval=${interval}`,
          { cache: "no-store" },
        );
        const config = (await response.json()) as {
          clientId?: string;
          planId?: string;
          error?: string;
        };
        if (!active) return;
        if (response.status === 401) {
          setState("signed-out");
          setMessage(config.error ?? "Sign in before starting checkout.");
          return;
        }
        if (!response.ok || !config.clientId || !config.planId) {
          throw new Error(config.error ?? "PayPal checkout is unavailable.");
        }

        const paypal = await loadPayPalSdk(config.clientId);
        if (!active || !containerRef.current) return;

        buttons = paypal.Buttons({
          style: {
            layout: "vertical",
            shape: "pill",
            label: "subscribe",
            height: 48,
          },
          createSubscription: (_data, actions) =>
            actions.subscription.create({ plan_id: config.planId! }),
          onApprove: async (data) => {
            if (!data.subscriptionID) {
              throw new Error("PayPal did not return a subscription ID.");
            }
            const confirmation = await fetch(
              "/api/paypal/subscriptions/confirm",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subscriptionId: data.subscriptionID }),
              },
            );
            const result = (await confirmation.json()) as {
              message?: string;
              error?: string;
            };
            if (!confirmation.ok) {
              throw new Error(result.error ?? "Unable to activate your plan.");
            }
            if (active) {
              setMessage(result.message ?? "Your subscription is active.");
              setState("success");
            }
          },
          onCancel: () => {
            if (active) {
              setMessage("Checkout was cancelled. You have not been charged.");
              setState("cancelled");
            }
          },
          onError: (error) => {
            if (active) {
              setMessage(
                error instanceof Error
                  ? error.message
                  : "PayPal could not complete checkout.",
              );
              setState("unavailable");
            }
          },
        });
        if (active) setState("ready");
        await buttons.render(containerRef.current);
      } catch (error) {
        if (active) {
          setMessage(
            error instanceof Error
              ? error.message
              : "PayPal checkout is unavailable.",
          );
          setState("unavailable");
        }
      }
    }

    void initialize();
    return () => {
      active = false;
      void buttons?.close?.();
    };
  }, [interval, plan]);

  if (state === "success") {
    return (
      <div className="mt-8 rounded-2xl border border-emerald-400/25 bg-emerald-400/10 p-4 text-center">
        <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-300" />
        <p className="mt-2 text-sm font-semibold text-white">{message}</p>
        <Link
          href="/dashboard"
          className="mt-2 inline-block text-xs font-semibold text-emerald-300 hover:text-emerald-200"
        >
          Continue to dashboard
        </Link>
      </div>
    );
  }

  if (state === "signed-out") {
    return (
      <div className="mt-8">
        <Button asChild size="lg" className="w-full bg-white text-slate-950 hover:bg-brand-blue/10">
          <Link href="/login?callbackUrl=/pricing">
            Sign in to subscribe
            <LockKeyhole className="h-4 w-4" />
          </Link>
        </Button>
        <p className="mt-3 text-center text-xs text-slate-400">
          Your subscription will be linked securely to your account.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      {state === "loading" ? (
        <div className="flex h-12 items-center justify-center rounded-full bg-white/10 text-sm text-slate-300">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading secure checkout
        </div>
      ) : null}
      <div
        ref={containerRef}
        className="min-h-12"
      />
      {state === "unavailable" || state === "cancelled" ? (
        <div className="mt-3 flex gap-2 rounded-xl border border-amber-300/20 bg-amber-300/10 p-3 text-xs leading-5 text-amber-100">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {message}
        </div>
      ) : null}
      <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-slate-400">
        <LockKeyhole className="h-3 w-3" />
        Recurring billing secured by PayPal. Cancel anytime.
      </p>
    </div>
  );
}

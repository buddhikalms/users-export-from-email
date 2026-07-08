import { z } from "zod";

export const paidPlanSchema = z.enum(["starter", "professional", "business"]);
export const billingIntervalSchema = z.enum(["monthly"]);

export type PaidPlan = z.infer<typeof paidPlanSchema>;
export type BillingInterval = z.infer<typeof billingIntervalSchema>;

const planEnvironmentKeys: Record<
  PaidPlan,
  Record<BillingInterval, string>
> = {
  starter: {
    monthly: "PAYPAL_STARTER_MONTHLY_PLAN_ID",
  },
  professional: {
    monthly: "PAYPAL_PROFESSIONAL_MONTHLY_PLAN_ID",
  },
  business: {
    monthly: "PAYPAL_BUSINESS_MONTHLY_PLAN_ID",
  },
};

export function getPayPalBaseUrl() {
  return process.env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

export function getPayPalClientId() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  if (!clientId) throw new Error("PayPal client ID is not configured.");
  return clientId;
}

export function getPayPalPlanId(
  plan: PaidPlan,
  interval: BillingInterval,
) {
  const environmentKey = planEnvironmentKeys[plan][interval];
  const planId = process.env[environmentKey];
  if (!planId) {
    throw new Error(`${environmentKey} is not configured.`);
  }
  return planId;
}

export function findPlanByPayPalId(paypalPlanId: string) {
  for (const plan of paidPlanSchema.options) {
    for (const interval of billingIntervalSchema.options) {
      if (process.env[planEnvironmentKeys[plan][interval]] === paypalPlanId) {
        return { plan, interval };
      }
    }
  }
  return null;
}

export async function getPayPalAccessToken() {
  const clientId = getPayPalClientId();
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!secret) throw new Error("PayPal client secret is not configured.");

  const response = await fetch(`${getPayPalBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  const body = (await response.json()) as {
    access_token?: string;
    error_description?: string;
  };

  if (!response.ok || !body.access_token) {
    throw new Error(body.error_description ?? "Unable to authenticate with PayPal.");
  }
  return body.access_token;
}

export async function paypalRequest<T>(path: string, init?: RequestInit) {
  const accessToken = await getPayPalAccessToken();
  const response = await fetch(`${getPayPalBaseUrl()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });
  const body = (await response.json()) as T & {
    message?: string;
    details?: Array<{ description?: string }>;
  };

  if (!response.ok) {
    throw new Error(
      body.details?.[0]?.description ??
        body.message ??
        "PayPal request failed.",
    );
  }
  return body;
}

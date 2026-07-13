import { z } from "zod";

import {
  getPayPalBaseUrl,
  getPayPalClientId,
  getPayPalAccessToken,
  paypalRequest,
} from "@/lib/paypal/client";
import {
  findPackageByPayPalPlanId,
  getCheckoutPlanId,
} from "@/lib/paypal/sync";

export const paidPlanSchema = z.enum(["starter", "professional", "business"]);
export const billingIntervalSchema = z.enum(["monthly"]);

export type PaidPlan = z.infer<typeof paidPlanSchema>;
export type BillingInterval = z.infer<typeof billingIntervalSchema>;

const planEnvironmentKeys: Record<PaidPlan, Record<BillingInterval, string>> = {
  starter: { monthly: "PAYPAL_STARTER_MONTHLY_PLAN_ID" },
  professional: { monthly: "PAYPAL_PROFESSIONAL_MONTHLY_PLAN_ID" },
  business: { monthly: "PAYPAL_BUSINESS_MONTHLY_PLAN_ID" },
};

export { getPayPalBaseUrl, getPayPalClientId, getPayPalAccessToken, paypalRequest };

export async function getPayPalPlanId(plan: PaidPlan, interval: BillingInterval) {
  return getCheckoutPlanId(plan, interval);
}

export async function findPlanByPayPalId(paypalPlanId: string) {
  const pricingPlan = await findPackageByPayPalPlanId(paypalPlanId);
  if (pricingPlan) {
    return {
      plan: pricingPlan.slug as PaidPlan,
      interval: pricingPlan.billingInterval.toLowerCase() as BillingInterval,
    };
  }

  for (const plan of paidPlanSchema.options) {
    for (const interval of billingIntervalSchema.options) {
      if (process.env[planEnvironmentKeys[plan][interval]] === paypalPlanId) {
        return { plan, interval };
      }
    }
  }
  return null;
}

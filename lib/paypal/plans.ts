import "server-only";

import { paypalRequest } from "@/lib/paypal/client";
import { PayPalSyncError, type LocalPayPalPackage, type PayPalBillingPlan, type PayPalPlanList } from "@/lib/paypal/types";

export function getPayPalPlanName(pkg: LocalPayPalPackage) {
  return pkg.code ?? `OMAZYNC_${pkg.slug.toUpperCase()}_MONTHLY`;
}

export async function listPayPalPlans(productId?: string) {
  const all: PayPalBillingPlan[] = [];
  const productParam = productId ? `&product_id=${encodeURIComponent(productId)}` : "";
  for (let page = 1; page <= 10; page += 1) {
    const response = await paypalRequest<PayPalPlanList>(
      `/v1/billing/plans?page_size=20&page=${page}&total_required=true${productParam}`,
    );
    all.push(...(response.plans ?? []));
    if ((response.plans ?? []).length < 20) break;
  }
  return all;
}

export async function readPayPalPlan(planId: string) {
  return paypalRequest<PayPalBillingPlan>(`/v1/billing/plans/${encodeURIComponent(planId)}`);
}

export async function createPayPalPlan(pkg: LocalPayPalPackage, productId: string) {
  if (!pkg.price) {
    throw new PayPalSyncError(`${pkg.name} does not have a subscription price.`, "INVALID_PRICE", 400);
  }
  return paypalRequest<PayPalBillingPlan>("/v1/billing/plans", {
    method: "POST",
    body: JSON.stringify({
      product_id: productId,
      name: getPayPalPlanName(pkg),
      description: `${pkg.code}: ${pkg.description}`,
      status: "ACTIVE",
      billing_cycles: [
        {
          frequency: {
            interval_unit: pkg.billingInterval === "YEARLY" ? "YEAR" : "MONTH",
            interval_count: pkg.billingIntervalCount,
          },
          tenure_type: "REGULAR",
          sequence: 1,
          total_cycles: 0,
          pricing_scheme: {
            fixed_price: {
              value: Number(pkg.price).toFixed(2),
              currency_code: pkg.currency,
            },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee_failure_action: "CONTINUE",
        payment_failure_threshold: 3,
      },
    }),
  });
}

export async function activatePayPalPlan(planId: string) {
  await paypalRequest<void>(`/v1/billing/plans/${encodeURIComponent(planId)}/activate`, {
    method: "POST",
  });
}

export function getRegularCycle(plan: PayPalBillingPlan) {
  return plan.billing_cycles?.find((cycle) => cycle.tenure_type === "REGULAR");
}

export function comparePlanToPackage(plan: PayPalBillingPlan, pkg: LocalPayPalPackage, productId: string) {
  const warnings: string[] = [];
  const cycle = getRegularCycle(plan);
  const fixedPrice = cycle?.pricing_scheme?.fixed_price;
  const expectedUnit = pkg.billingInterval === "YEARLY" ? "YEAR" : "MONTH";

  if (plan.product_id !== productId) warnings.push(`Product mismatch: PayPal has ${plan.product_id}.`);
  if (fixedPrice?.currency_code !== pkg.currency) warnings.push(`Currency mismatch: PayPal has ${fixedPrice?.currency_code ?? "none"}.`);
  if (Number(fixedPrice?.value) !== Number(pkg.price)) warnings.push(`Price mismatch: PayPal has ${fixedPrice?.value ?? "none"}.`);
  if (cycle?.frequency?.interval_unit !== expectedUnit) warnings.push(`Billing interval mismatch: PayPal has ${cycle?.frequency?.interval_unit ?? "none"}.`);
  if (Number(cycle?.frequency?.interval_count ?? 0) !== pkg.billingIntervalCount) warnings.push(`Billing count mismatch: PayPal has ${cycle?.frequency?.interval_count ?? "none"}.`);
  if (plan.status !== "ACTIVE") warnings.push(`Plan is ${plan.status}.`);

  return {
    exact:
      warnings.length === 0 &&
      plan.status === "ACTIVE" &&
      fixedPrice?.currency_code === pkg.currency &&
      Number(fixedPrice?.value) === Number(pkg.price),
    warnings,
  };
}

export function findMatchingPlan(plans: PayPalBillingPlan[], pkg: LocalPayPalPackage, productId: string) {
  const name = getPayPalPlanName(pkg);
  return plans.find((plan) => {
    if (plan.name !== name && !plan.description?.includes(pkg.code ?? "")) return false;
    const comparison = comparePlanToPackage(plan, pkg, productId);
    return comparison.exact;
  });
}

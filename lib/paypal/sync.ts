import "server-only";

import { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { getPayPalEnvironment, getMaskedPayPalClientId, getPayPalAccessToken } from "@/lib/paypal/client";
import { createPayPalPlan, comparePlanToPackage, findMatchingPlan, listPayPalPlans, readPayPalPlan } from "@/lib/paypal/plans";
import { createPayPalProduct, findMatchingProduct, listPayPalProducts, readPayPalProduct } from "@/lib/paypal/products";
import {
  PayPalSyncError,
  type LocalPayPalPackage,
  type PackageSyncResult,
  type PayPalBillingPlan,
  type PayPalEnvironment,
  type PayPalSyncReport,
  type SyncMode,
} from "@/lib/paypal/types";

type SyncOptions = {
  mode?: SyncMode;
  packageId?: string;
  adminUserId?: string;
};

function codeForPlan(slug: string, interval = "MONTHLY") {
  return `${slug.toUpperCase().replace(/[^A-Z0-9]+/g, "_")}_${interval}`;
}

function toLocalPackage(plan: Awaited<ReturnType<typeof getSyncablePackages>>[number]): LocalPayPalPackage {
  return {
    ...plan,
    code: plan.code ?? codeForPlan(plan.slug, plan.billingInterval),
    description: plan.summary,
    price: plan.monthlyPrice?.toFixed(2) ?? null,
  };
}

function envFields(environment: PayPalEnvironment) {
  return environment === "live"
    ? {
        productId: "paypalLiveProductId" as const,
        planId: "paypalLivePlanId" as const,
        planStatus: "paypalLivePlanStatus" as const,
        lastSyncAt: "lastLiveSyncAt" as const,
      }
    : {
        productId: "paypalSandboxProductId" as const,
        planId: "paypalSandboxPlanId" as const,
        planStatus: "paypalSandboxPlanStatus" as const,
        lastSyncAt: "lastSandboxSyncAt" as const,
      };
}

function getSyncablePackages(packageId?: string) {
  return db.pricingPlan.findMany({
    where: {
      isActive: true,
      monthlyPrice: { not: null },
      ...(packageId ? { id: packageId } : {}),
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

function validatePackage(pkg: LocalPayPalPackage) {
  if (!pkg.code) throw new PayPalSyncError(`${pkg.name} is missing a stable code.`, "MISSING_PACKAGE_DATA", 400);
  if (!pkg.price || Number(pkg.price) <= 0) throw new PayPalSyncError(`${pkg.name} has an invalid price.`, "INVALID_PRICE", 400);
  if (!/^[A-Z]{3}$/.test(pkg.currency)) throw new PayPalSyncError(`${pkg.name} has an invalid currency.`, "INVALID_CURRENCY", 400);
  if (pkg.billingInterval !== "MONTHLY" && pkg.billingInterval !== "YEARLY") {
    throw new PayPalSyncError(`${pkg.name} must use monthly or yearly billing.`, "MISSING_PACKAGE_DATA", 400);
  }
  if (pkg.billingIntervalCount < 1) throw new PayPalSyncError(`${pkg.name} has an invalid billing interval count.`, "MISSING_PACKAGE_DATA", 400);
}

async function logPayPalAudit(input: {
  adminUserId?: string;
  action: string;
  status: string;
  statusCode?: number;
  message?: string;
  metadata: Record<string, unknown>;
}) {
  const metadata = JSON.parse(JSON.stringify(input.metadata)) as Prisma.InputJsonValue;
  await db.apiLog.create({
    data: {
      ownerId: input.adminUserId,
      action: input.action,
      status: input.status,
      statusCode: input.statusCode,
      message: input.message,
      metadata,
    },
  });
}

async function syncProduct(pkg: LocalPayPalPackage, environment: PayPalEnvironment, mode: SyncMode, result: PackageSyncResult) {
  if (mode === "plans") {
    const fields = envFields(environment);
    const existingId = pkg[fields.productId];
    if (!existingId) {
      result.productStatus = "MISSING";
      throw new PayPalSyncError(`${pkg.name} does not have a PayPal product ID yet.`, "MISSING_PACKAGE_DATA", 400);
    }
    return existingId;
  }

  const fields = envFields(environment);
  const savedProductId = pkg[fields.productId];
  if (savedProductId) {
    try {
      const product = await readPayPalProduct(savedProductId);
      result.productStatus = "SYNCED";
      result.paypalProductId = product.id;
      return product.id;
    } catch {
      result.warnings.push(`Saved product ${savedProductId} was not found in ${environment}.`);
    }
  }

  if (mode === "validate") {
    result.productStatus = savedProductId ? "FAILED" : "MISSING";
    return savedProductId ?? undefined;
  }

  const products = await listPayPalProducts();
  const matched = findMatchingProduct(products, pkg);
  if (matched) {
    result.productStatus = "REUSED";
    result.paypalProductId = matched.id;
    return matched.id;
  }

  const created = await createPayPalProduct(pkg);
  result.productStatus = "CREATED";
  result.paypalProductId = created.id;
  return created.id;
}

async function syncPlan(pkg: LocalPayPalPackage, productId: string, environment: PayPalEnvironment, mode: SyncMode, result: PackageSyncResult) {
  if (mode === "products") {
    result.planStatus = "SKIPPED";
    return null;
  }

  const fields = envFields(environment);
  const savedPlanId = pkg[fields.planId];
  if (savedPlanId) {
    try {
      const plan = await readPayPalPlan(savedPlanId);
      const comparison = comparePlanToPackage(plan, pkg, productId);
      result.paypalPlanId = plan.id;
      result.paypalStatus = plan.status;
      result.warnings.push(...comparison.warnings);
      result.planStatus = comparison.exact
        ? "SYNCED"
        : comparison.warnings.some((warning) => warning.startsWith("Currency mismatch"))
          ? "CURRENCY_MISMATCH"
          : plan.status === "ACTIVE"
            ? "PRICE_MISMATCH"
            : "INACTIVE";
      return plan;
    } catch {
      result.warnings.push(`Saved plan ${savedPlanId} was not found in ${environment}.`);
    }
  }

  if (mode === "validate") {
    result.planStatus = savedPlanId ? "FAILED" : "MISSING";
    return null;
  }

  const plans = await listPayPalPlans(productId);
  const matched = findMatchingPlan(plans, pkg, productId);
  if (matched) {
    result.planStatus = "REUSED";
    result.paypalPlanId = matched.id;
    result.paypalStatus = matched.status;
    return matched;
  }

  const created = await createPayPalPlan(pkg, productId);
  result.planStatus = "CREATED";
  result.paypalPlanId = created.id;
  result.paypalStatus = created.status;
  return created;
}

async function saveSyncState(pkg: LocalPayPalPackage, environment: PayPalEnvironment, productId: string | undefined, plan: PayPalBillingPlan | null, previous: Record<string, unknown>) {
  const fields = envFields(environment);
  await db.pricingPlan.update({
    where: { id: pkg.id },
    data: {
      code: pkg.code,
      [fields.productId]: productId,
      ...(plan
        ? {
            [fields.planId]: plan.id,
            [fields.planStatus]: plan.status,
          }
        : {}),
      [fields.lastSyncAt]: new Date(),
    },
  });
  return {
    previous,
    next: {
      [fields.productId]: productId,
      [fields.planId]: plan?.id ?? previous[fields.planId],
      [fields.planStatus]: plan?.status ?? previous[fields.planStatus],
    },
  };
}

export async function testPayPalConnection(adminUserId?: string) {
  const startedAt = Date.now();
  const environment = getPayPalEnvironment();
  try {
    await getPayPalAccessToken();
    await logPayPalAudit({
      adminUserId,
      action: "paypal.test_connection",
      status: "success",
      statusCode: 200,
      metadata: { environment },
    });
    return {
      success: true,
      environment,
      connectedAt: new Date().toISOString(),
      durationMs: Date.now() - startedAt,
      clientId: getMaskedPayPalClientId(),
    };
  } catch (error) {
    await logPayPalAudit({
      adminUserId,
      action: "paypal.test_connection",
      status: "failed",
      statusCode: error instanceof PayPalSyncError ? error.statusCode : 502,
      message: error instanceof Error ? error.message : "PayPal connection failed.",
      metadata: { environment },
    });
    throw error;
  }
}

export async function synchronizePayPalPackages(options: SyncOptions = {}): Promise<PayPalSyncReport> {
  const environment = getPayPalEnvironment();
  const mode = options.mode ?? "sync";
  const plans = await getSyncablePackages(options.packageId);
  const results: PackageSyncResult[] = [];

  for (const plan of plans) {
    const pkg = toLocalPackage(plan);
    const fields = envFields(environment);
    const previous = {
      [fields.productId]: pkg[fields.productId],
      [fields.planId]: pkg[fields.planId],
      [fields.planStatus]: pkg[fields.planStatus],
    };
    const result: PackageSyncResult = {
      packageId: pkg.id,
      packageCode: pkg.code ?? pkg.slug,
      packageName: pkg.name,
      productStatus: "SKIPPED",
      planStatus: "SKIPPED",
      warnings: [],
      errors: [],
    };

    try {
      validatePackage(pkg);
      const productId = await syncProduct(pkg, environment, mode, result);
      const syncedPlan = productId ? await syncPlan(pkg, productId, environment, mode, result) : null;
      if (mode !== "validate" && productId) {
        const changes = await saveSyncState(pkg, environment, productId, syncedPlan, previous);
        await logPayPalAudit({
          adminUserId: options.adminUserId,
          action: `paypal.${mode}`,
          status: "success",
          statusCode: 200,
          metadata: {
            environment,
            packageId: pkg.id,
            packageCode: pkg.code,
            productId,
            planId: syncedPlan?.id ?? null,
            ...changes,
          },
        });
      }
    } catch (error) {
      result.productStatus = result.productStatus === "SKIPPED" ? "FAILED" : result.productStatus;
      result.planStatus = result.planStatus === "SKIPPED" ? "FAILED" : result.planStatus;
      result.errors.push(error instanceof Error ? error.message : "PayPal synchronization failed.");
      await logPayPalAudit({
        adminUserId: options.adminUserId,
        action: `paypal.${mode}`,
        status: "failed",
        statusCode: error instanceof PayPalSyncError ? error.statusCode : 502,
        message: result.errors[0],
        metadata: {
          environment,
          packageId: pkg.id,
          packageCode: pkg.code,
          previous,
        },
      });
    }
    results.push(result);
  }

  const summary = {
    total: results.length,
    synced: results.filter((result) => !result.errors.length && result.planStatus !== "MISSING").length,
    created: results.filter((result) => result.productStatus === "CREATED" || result.planStatus === "CREATED").length,
    reused: results.filter((result) => result.productStatus === "REUSED" || result.planStatus === "REUSED").length,
    warnings: results.filter((result) => result.warnings.length > 0).length,
    failed: results.filter((result) => result.errors.length > 0).length,
  };

  return {
    success: summary.failed === 0,
    environment,
    syncedAt: new Date().toISOString(),
    summary,
    results,
  };
}

export async function getPayPalSyncStatus() {
  const environment = getPayPalEnvironment();
  const packages = (await getSyncablePackages()).map(toLocalPackage);
  const fields = envFields(environment);
  const lastConnectionTest = await db.apiLog.findFirst({
    where: { action: "paypal.test_connection" },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true, status: true, message: true },
  });
  const lastSync = await db.apiLog.findFirst({
    where: { action: { startsWith: "paypal." }, NOT: { action: "paypal.test_connection" } },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true, status: true, message: true },
  });

  return {
    environment,
    clientId: getMaskedPayPalClientId(),
    lastConnectionTest,
    lastSync,
    packages: packages.map((pkg) => ({
      id: pkg.id,
      code: pkg.code,
      slug: pkg.slug,
      name: pkg.name,
      price: pkg.price,
      currency: pkg.currency,
      billingInterval: pkg.billingInterval,
      billingIntervalCount: pkg.billingIntervalCount,
      paypalProductId: pkg[fields.productId],
      paypalPlanId: pkg[fields.planId],
      paypalStatus: pkg[fields.planStatus],
      lastSyncedAt: pkg[fields.lastSyncAt],
    })),
  };
}

export async function findPackageByPayPalPlanId(paypalPlanId: string) {
  const environment = getPayPalEnvironment();
  return db.pricingPlan.findFirst({
    where:
      environment === "live"
        ? { paypalLivePlanId: paypalPlanId, isActive: true }
        : { paypalSandboxPlanId: paypalPlanId, isActive: true },
  });
}

export async function getCheckoutPlanId(planSlug: string, interval: string) {
  const environment = getPayPalEnvironment();
  const normalizedInterval = interval.toUpperCase() === "YEARLY" ? "YEARLY" : "MONTHLY";
  const plan = await db.pricingPlan.findFirst({
    where: {
      slug: planSlug,
      isActive: true,
      billingInterval: normalizedInterval,
      monthlyPrice: { not: null },
    },
  });
  if (!plan) {
    throw new PayPalSyncError("Invalid or inactive billing plan.", "MISSING_PACKAGE_DATA", 400);
  }

  const planId = environment === "live" ? plan.paypalLivePlanId : plan.paypalSandboxPlanId;
  if (planId) return planId;

  const fallbackKey = `PAYPAL_${plan.slug.toUpperCase()}_${normalizedInterval}_PLAN_ID`;
  const fallback = process.env[fallbackKey];
  if (fallback) return fallback;

  throw new PayPalSyncError(
    `${plan.name} does not have a ${environment} PayPal plan ID. Ask an admin to sync PayPal plans.`,
    "MISSING_PACKAGE_DATA",
    503,
  );
}

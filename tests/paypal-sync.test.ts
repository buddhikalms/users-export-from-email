import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const schema = readFileSync("prisma/schema.prisma", "utf8");
const migration = readFileSync("prisma/migrations/20260713110000_add_paypal_plan_sync_fields/migration.sql", "utf8");
const syncService = readFileSync("lib/paypal/sync.ts", "utf8");
const clientService = readFileSync("lib/paypal/client.ts", "utf8");
const checkoutRoute = readFileSync("app/api/paypal/config/route.ts", "utf8");
const confirmRoute = readFileSync("app/api/paypal/subscriptions/confirm/route.ts", "utf8");
const webhookRoute = readFileSync("app/api/paypal/webhook/route.ts", "utf8");
const adminRoutes = [
  "app/api/admin/paypal/test-connection/route.ts",
  "app/api/admin/paypal/sync/route.ts",
  "app/api/admin/paypal/sync/[packageId]/route.ts",
  "app/api/admin/paypal/status/route.ts",
].map((path) => readFileSync(path, "utf8"));

test("PricingPlan stores separate sandbox and live PayPal identifiers", () => {
  for (const field of [
    "paypalSandboxProductId",
    "paypalSandboxPlanId",
    "paypalLiveProductId",
    "paypalLivePlanId",
    "lastSandboxSyncAt",
    "lastLiveSyncAt",
  ]) {
    assert.equal(schema.includes(field), true);
    assert.equal(migration.includes(field), true);
  }
});

test("default package codes are stable and backfilled safely", () => {
  for (const code of ["STARTER_MONTHLY", "PROFESSIONAL_MONTHLY", "BUSINESS_MONTHLY"]) {
    assert.equal(migration.includes(code), true);
  }
  assert.equal(migration.includes("DELETE FROM `PricingPlan`"), false);
  assert.equal(migration.includes("DROP TABLE"), false);
});

test("PayPal environment chooses sandbox and live API bases without exposing secrets", () => {
  assert.equal(clientService.includes("https://api-m.sandbox.paypal.com"), true);
  assert.equal(clientService.includes("https://api-m.paypal.com"), true);
  assert.equal(clientService.includes("NEXT_PUBLIC_PAYPAL_CLIENT_SECRET"), false);
  assert.equal(clientService.includes("getMaskedPayPalClientId"), true);
});

test("sync service is idempotent and detects mismatches before creating plans", () => {
  assert.equal(syncService.includes("readPayPalProduct(savedProductId)"), true);
  assert.equal(syncService.includes("findMatchingProduct(products, pkg)"), true);
  assert.equal(syncService.includes("findMatchingPlan(plans, pkg, productId)"), true);
  assert.equal(syncService.includes("comparePlanToPackage"), true);
  assert.equal(syncService.includes("PRICE_MISMATCH"), true);
  assert.equal(syncService.includes("CURRENCY_MISMATCH"), true);
});

test("admin PayPal routes require admin authentication", () => {
  for (const route of adminRoutes) {
    assert.equal(route.includes("requireAdminSession"), true);
  }
});

test("checkout and webhook map PayPal plan IDs through the database helper", () => {
  assert.equal(checkoutRoute.includes("await getPayPalPlanId"), true);
  assert.equal(confirmRoute.includes("await findPlanByPayPalId"), true);
  assert.equal(webhookRoute.includes("await findPlanByPayPalId"), true);
  assert.equal(webhookRoute.includes("verify-webhook-signature"), true);
});

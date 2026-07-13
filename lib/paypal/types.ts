import type { BillingInterval } from "@prisma/client";

export type PayPalEnvironment = "sandbox" | "live";

export type PayPalErrorCode =
  | "INVALID_CLIENT_ID"
  | "INVALID_CLIENT_SECRET"
  | "CONNECTION_FAILED"
  | "RATE_LIMITED"
  | "INVALID_CURRENCY"
  | "INVALID_PRICE"
  | "DUPLICATE_PRODUCT"
  | "DUPLICATE_PLAN"
  | "INACTIVE_PLAN"
  | "ENVIRONMENT_MISMATCH"
  | "MISSING_PACKAGE_DATA"
  | "NETWORK_TIMEOUT"
  | "PARTIAL_SYNC_FAILURE"
  | "PAYPAL_REQUEST_FAILED";

export class PayPalSyncError extends Error {
  constructor(
    message: string,
    readonly code: PayPalErrorCode,
    readonly statusCode = 500,
  ) {
    super(message);
    this.name = "PayPalSyncError";
  }
}

export type PayPalProduct = {
  id: string;
  name: string;
  description?: string;
  type?: string;
  category?: string;
};

export type PayPalProductList = {
  products?: PayPalProduct[];
  total_items?: number;
};

export type PayPalPlanStatus = "CREATED" | "INACTIVE" | "ACTIVE";

export type PayPalBillingPlan = {
  id: string;
  product_id: string;
  name: string;
  description?: string;
  status: PayPalPlanStatus | string;
  billing_cycles?: Array<{
    frequency?: {
      interval_unit?: string;
      interval_count?: number;
    };
    tenure_type?: string;
    total_cycles?: number;
    pricing_scheme?: {
      fixed_price?: {
        value?: string;
        currency_code?: string;
      };
    };
  }>;
};

export type PayPalPlanList = {
  plans?: PayPalBillingPlan[];
  total_items?: number;
};

export type SyncMode = "sync" | "products" | "plans" | "validate";

export type LocalPayPalPackage = {
  id: string;
  slug: string;
  code: string | null;
  name: string;
  description: string;
  price: string | null;
  currency: string;
  billingInterval: BillingInterval;
  billingIntervalCount: number;
  isActive: boolean;
  paypalSandboxProductId: string | null;
  paypalSandboxPlanId: string | null;
  paypalSandboxPlanStatus: string | null;
  paypalLiveProductId: string | null;
  paypalLivePlanId: string | null;
  paypalLivePlanStatus: string | null;
  lastSandboxSyncAt: Date | null;
  lastLiveSyncAt: Date | null;
};

export type PackageSyncResult = {
  packageId: string;
  packageCode: string;
  packageName: string;
  productStatus: "SKIPPED" | "REUSED" | "CREATED" | "SYNCED" | "FAILED" | "MISSING";
  planStatus: "SKIPPED" | "REUSED" | "CREATED" | "SYNCED" | "VALIDATED" | "FAILED" | "MISSING" | "PRICE_MISMATCH" | "CURRENCY_MISMATCH" | "INACTIVE";
  paypalProductId?: string;
  paypalPlanId?: string;
  paypalStatus?: string;
  warnings: string[];
  errors: string[];
};

export type PayPalSyncReport = {
  success: boolean;
  environment: PayPalEnvironment;
  syncedAt: string;
  summary: {
    total: number;
    synced: number;
    created: number;
    reused: number;
    warnings: number;
    failed: number;
  };
  results: PackageSyncResult[];
};

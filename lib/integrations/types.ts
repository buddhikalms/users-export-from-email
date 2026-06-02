export type MarketingPlatformId =
  | "kit"
  | "mailchimp"
  | "brevo"
  | "beehiiv"
  | "activecampaign"
  | "convertkit_legacy"
  | "hubspot"
  | "mailerlite"
  | "constant_contact"
  | "sendgrid_marketing"
  | "campaign_monitor"
  | "zoho_campaigns";

export type IntegrationDestinationType = "tag" | "list" | "form" | "audience" | "segment";

export type IntegrationHealthStatus = "unknown" | "healthy" | "degraded" | "failed";

export interface IntegrationCredentials {
  apiKey: string;
  apiSecret?: string;
  serverPrefix?: string;
  accountId?: string;
}

export interface IntegrationDestination {
  id: string;
  name: string;
  type: IntegrationDestinationType;
  contactCount?: number;
}

export interface IntegrationContactPayload {
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  company?: string;
  sourceFolders?: string[];
  sourceTypes?: string[];
  tags?: string[];
  customFields?: Record<string, string | number | boolean | null>;
}

export interface IntegrationValidationResult {
  ok: boolean;
  status: IntegrationHealthStatus;
  accountName?: string;
  message: string;
  rateLimitRemaining?: number;
}

export interface IntegrationSyncRequest {
  credentials: IntegrationCredentials;
  contacts: IntegrationContactPayload[];
  destination: IntegrationDestination;
  batchSize?: number;
}

export interface IntegrationSyncResult {
  totalContacts: number;
  uploaded: number;
  updated: number;
  skippedDuplicates: number;
  failed: number;
  logs: string[];
}

export interface IntegrationAdapter {
  platform: MarketingPlatformId;
  label: string;
  description: string;
  destinationTypes: IntegrationDestinationType[];
  validate(credentials: IntegrationCredentials): Promise<IntegrationValidationResult>;
  listDestinations(credentials: IntegrationCredentials): Promise<IntegrationDestination[]>;
  syncContacts(request: IntegrationSyncRequest): Promise<IntegrationSyncResult>;
}

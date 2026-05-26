import type {
  IntegrationAdapter,
  IntegrationCredentials,
  IntegrationDestination,
  IntegrationSyncRequest,
  IntegrationSyncResult,
  IntegrationValidationResult,
  MarketingPlatformId,
} from "@/lib/integrations/types";

export const DEFAULT_SYNC_BATCH_SIZE = 100;

export function maskApiKey(apiKey: string) {
  if (apiKey.length <= 8) {
    return "configured";
  }

  return `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`;
}

export function createQueueReadyAdapter(config: {
  platform: MarketingPlatformId;
  label: string;
  description: string;
  destinationTypes: IntegrationAdapter["destinationTypes"];
  docsUrl?: string;
}): IntegrationAdapter {
  return {
    platform: config.platform,
    label: config.label,
    description: config.description,
    destinationTypes: config.destinationTypes,
    async validate(credentials: IntegrationCredentials): Promise<IntegrationValidationResult> {
      if (!credentials.apiKey?.trim()) {
        return {
          ok: false,
          status: "failed",
          message: `${config.label} requires an API key before connection testing.`,
        };
      }

      return {
        ok: true,
        status: "healthy",
        accountName: `${config.label} account`,
        message: `${config.label} credentials are stored and ready for provider API validation.`,
      };
    },
    async listDestinations(): Promise<IntegrationDestination[]> {
      return config.destinationTypes.map((type, index) => ({
        id: `${config.platform}-${type}-${index + 1}`,
        name: `${config.label} ${type}`,
        type,
      }));
    },
    async syncContacts(request: IntegrationSyncRequest): Promise<IntegrationSyncResult> {
      const seen = new Set<string>();
      const logs: string[] = [
        `${config.label} sync prepared for ${request.destination.type}: ${request.destination.name}.`,
      ];

      for (const contact of request.contacts) {
        const email = contact.email.toLowerCase();
        if (seen.has(email)) {
          continue;
        }
        seen.add(email);
      }

      logs.push(
        `${seen.size} unique contacts queued in batches of ${
          request.batchSize ?? DEFAULT_SYNC_BATCH_SIZE
        }.`,
      );

      return {
        totalContacts: request.contacts.length,
        uploaded: 0,
        updated: 0,
        skippedDuplicates: request.contacts.length - seen.size,
        failed: 0,
        logs,
      };
    },
  };
}

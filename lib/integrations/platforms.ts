import type { MarketingPlatform } from "@prisma/client";
import type { IntegrationHealthStatus, MarketingPlatformId } from "@/lib/integrations/types";

export const prismaPlatformByIntegrationId: Record<MarketingPlatformId, MarketingPlatform> = {
  kit: "KIT",
  mailchimp: "MAILCHIMP",
  brevo: "BREVO",
  beehiiv: "BEEHIIV",
  activecampaign: "ACTIVECAMPAIGN",
  convertkit_legacy: "CONVERTKIT_LEGACY",
  hubspot: "HUBSPOT",
  mailerlite: "MAILERLITE",
  constant_contact: "CONSTANT_CONTACT",
  sendgrid_marketing: "SENDGRID_MARKETING",
  campaign_monitor: "CAMPAIGN_MONITOR",
  zoho_campaigns: "ZOHO_CAMPAIGNS",
};

export const integrationIdByPrismaPlatform = Object.fromEntries(
  Object.entries(prismaPlatformByIntegrationId).map(([key, value]) => [value, key]),
) as Record<MarketingPlatform, MarketingPlatformId>;

export function toPrismaIntegrationHealth(status: IntegrationHealthStatus) {
  switch (status) {
    case "healthy":
      return "HEALTHY";
    case "degraded":
      return "DEGRADED";
    case "failed":
      return "FAILED";
    default:
      return "UNKNOWN";
  }
}

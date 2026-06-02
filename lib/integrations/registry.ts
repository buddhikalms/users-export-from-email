import { kitIntegration } from "@/lib/integrations/kit";
import { mailchimpIntegration } from "@/lib/integrations/mailchimp";
import { brevoIntegration } from "@/lib/integrations/brevo";
import { beehiivIntegration } from "@/lib/integrations/beehiiv";
import { hubspotIntegration } from "@/lib/integrations/hubspot";
import { createQueueReadyAdapter } from "@/lib/integrations/base";
import type { IntegrationAdapter, MarketingPlatformId } from "@/lib/integrations/types";

export const integrationRegistry: IntegrationAdapter[] = [
  kitIntegration,
  mailchimpIntegration,
  brevoIntegration,
  beehiivIntegration,
  createQueueReadyAdapter({
    platform: "activecampaign",
    label: "ActiveCampaign",
    description: "Sync contacts into lists, tags, automations, and CRM pipelines.",
    destinationTypes: ["list", "tag"],
  }),
  createQueueReadyAdapter({
    platform: "convertkit_legacy",
    label: "ConvertKit Legacy",
    description: "Maintain legacy ConvertKit V3 API exports while teams migrate to Kit.",
    destinationTypes: ["tag", "form"],
  }),
  hubspotIntegration,
  createQueueReadyAdapter({
    platform: "mailerlite",
    label: "MailerLite",
    description: "Export cleaned contacts into MailerLite groups and fields.",
    destinationTypes: ["list", "segment"],
  }),
  createQueueReadyAdapter({
    platform: "constant_contact",
    label: "Constant Contact",
    description: "Batch sync contacts into lists with retry-ready export history.",
    destinationTypes: ["list"],
  }),
  createQueueReadyAdapter({
    platform: "sendgrid_marketing",
    label: "SendGrid Marketing",
    description: "Send contact batches to SendGrid Marketing lists and segments.",
    destinationTypes: ["list", "segment"],
  }),
  createQueueReadyAdapter({
    platform: "campaign_monitor",
    label: "Campaign Monitor",
    description: "Update subscribers and custom fields in Campaign Monitor lists.",
    destinationTypes: ["list"],
  }),
  createQueueReadyAdapter({
    platform: "zoho_campaigns",
    label: "Zoho Campaigns",
    description: "Sync cleaned contacts into Zoho Campaigns mailing lists and segments.",
    destinationTypes: ["list", "segment"],
  }),
];

export function getIntegrationAdapter(platform: MarketingPlatformId) {
  return integrationRegistry.find((integration) => integration.platform === platform);
}

import { createQueueReadyAdapter } from "@/lib/integrations/base";

export const hubspotIntegration = createQueueReadyAdapter({
  platform: "hubspot",
  label: "HubSpot",
  description: "Create and update CRM contacts, lists, lifecycle stages, and company fields.",
  destinationTypes: ["list", "segment"],
});

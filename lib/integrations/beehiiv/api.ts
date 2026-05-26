import { createQueueReadyAdapter } from "@/lib/integrations/base";

export const beehiivIntegration = createQueueReadyAdapter({
  platform: "beehiiv",
  label: "Beehiiv",
  description: "Sync subscribers into Beehiiv publications and audience segments.",
  destinationTypes: ["audience", "segment"],
});

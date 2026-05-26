import { createQueueReadyAdapter } from "@/lib/integrations/base";

export const brevoIntegration = createQueueReadyAdapter({
  platform: "brevo",
  label: "Brevo",
  description: "Push contacts to Brevo lists with source fields and dedupe metadata.",
  destinationTypes: ["list"],
});

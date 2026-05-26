import { createQueueReadyAdapter } from "@/lib/integrations/base";

export const mailchimpIntegration = createQueueReadyAdapter({
  platform: "mailchimp",
  label: "Mailchimp",
  description: "Export leads into Mailchimp audiences, tags, segments, and merge fields.",
  destinationTypes: ["audience", "tag", "segment"],
});

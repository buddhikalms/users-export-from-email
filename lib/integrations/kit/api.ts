import { createQueueReadyAdapter } from "@/lib/integrations/base";

export const kitIntegration = createQueueReadyAdapter({
  platform: "kit",
  label: "Kit",
  description: "Sync cleaned contacts into Kit tags and forms with V4 and legacy V3 support.",
  destinationTypes: ["tag", "form"],
});

import { create } from "zustand";

import type { MarketingPlatformId } from "@/lib/integrations/types";

type ExportWorkflowState = {
  platform: MarketingPlatformId;
  accountId: string;
  destinationId: string;
  destinationType: string;
  setPlatform: (platform: MarketingPlatformId) => void;
  setAccountId: (accountId: string) => void;
  setDestination: (destinationId: string, destinationType: string) => void;
  reset: () => void;
};

const initialState = {
  platform: "kit" as MarketingPlatformId,
  accountId: "",
  destinationId: "",
  destinationType: "tag",
};

export const useExportWorkflowStore = create<ExportWorkflowState>((set) => ({
  ...initialState,
  setPlatform: (platform) => set({ platform, accountId: "", destinationId: "" }),
  setAccountId: (accountId) => set({ accountId }),
  setDestination: (destinationId, destinationType) => set({ destinationId, destinationType }),
  reset: () => set(initialState),
}));

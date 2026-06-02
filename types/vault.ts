import type { MarketingPlatformId } from "@/lib/integrations/types";
import type { SecurityType } from "@/types/email";

export type VaultEmailAccount = {
  id: string;
  name: string;
  type: "imap";
  email: string;
  host: string;
  port: number;
  secure: boolean;
  security?: SecurityType;
  username: string;
  password: string;
};

export type VaultMarketingAccount = {
  id: string;
  platform: Extract<
    MarketingPlatformId,
    | "kit"
    | "mailchimp"
    | "brevo"
    | "hubspot"
    | "beehiiv"
    | "activecampaign"
    | "zoho_campaigns"
  >;
  name: string;
  apiKey: string;
  apiSecret?: string;
  serverPrefix?: string;
  accountId?: string;
};

export type VaultData = {
  emailAccounts: VaultEmailAccount[];
  marketingAccounts: VaultMarketingAccount[];
};

export type EncryptedVaultPayload = {
  name: string;
  encryptedBlob: string;
  salt: string;
  iv: string;
  kdf: "PBKDF2";
  iterations: number;
};

export type EncryptedVaultRecord = EncryptedVaultPayload & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

export const emptyVaultData = (): VaultData => ({
  emailAccounts: [],
  marketingAccounts: [],
});

import type { ConnectionSettings } from "@/types/email";

import { getSavedAccountSettings } from "@/lib/server-accounts";

export async function resolveConnectionSettings(
  input: { settings: ConnectionSettings } | { savedAccountId: string },
  userId: string,
) {
  if ("settings" in input) {
    return input.settings;
  }

  return getSavedAccountSettings(userId, input.savedAccountId);
}

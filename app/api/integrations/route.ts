import { NextResponse } from "next/server";

import { launchIntegrationRegistry } from "@/lib/integrations/registry";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    integrations: launchIntegrationRegistry.map((integration) => ({
      platform: integration.platform,
      label: integration.label,
      description: integration.description,
      destinationTypes: integration.destinationTypes,
    })),
  });
}

import { NextResponse } from "next/server";

import { integrationRegistry } from "@/lib/integrations/registry";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    integrations: integrationRegistry.map((integration) => ({
      platform: integration.platform,
      label: integration.label,
      description: integration.description,
      destinationTypes: integration.destinationTypes,
    })),
  });
}

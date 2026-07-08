import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = performance.now();

  try {
    await db.$queryRaw`SELECT 1`;

    return NextResponse.json(
      {
        status: "ok",
        uptimeSeconds: Math.round(process.uptime()),
        database: "ok",
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "no-store",
          "X-Response-Time-Ms": String(Math.round(performance.now() - startedAt)),
        },
      },
    );
  } catch {
    return NextResponse.json(
      {
        status: "error",
        database: "unavailable",
        timestamp: new Date().toISOString(),
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}

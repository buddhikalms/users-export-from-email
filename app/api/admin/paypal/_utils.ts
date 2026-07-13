import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/auth";

export async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return {
      response: NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 }),
      session: null,
    };
  }
  if (session.user.role !== "ADMIN") {
    return {
      response: NextResponse.json({ success: false, error: "Admin access required." }, { status: 403 }),
      session: null,
    };
  }
  return { response: null, session };
}

export function errorResponse(error: unknown, fallback = "PayPal request failed.") {
  const statusCode =
    error instanceof Error && "statusCode" in error && typeof error.statusCode === "number"
      ? error.statusCode
      : 502;
  return NextResponse.json(
    {
      success: false,
      error: error instanceof Error ? error.message : fallback,
    },
    { status: statusCode },
  );
}

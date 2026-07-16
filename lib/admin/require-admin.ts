import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

import { authOptions } from "@/auth";
import { type AdminPermission, hasAdminPermission, normalizeAdminRole } from "@/lib/admin/permissions";

export async function requireAdminPage(permission: AdminPermission = "admin:view") {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (!normalizeAdminRole(session.user.role) || !hasAdminPermission(session.user.role, permission)) {
    redirect("/settings");
  }

  return session;
}

export async function requireAdminApi(permission: AdminPermission = "admin:view") {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { ok: false as const, response: NextResponse.json({ error: "Authentication required" }, { status: 401 }) };
  }

  if (!normalizeAdminRole(session.user.role) || !hasAdminPermission(session.user.role, permission)) {
    return { ok: false as const, response: NextResponse.json({ error: "Admin permission denied" }, { status: 403 }) };
  }

  return { ok: true as const, session };
}

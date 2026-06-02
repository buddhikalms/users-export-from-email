import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getVerifiedSessionUserId, staleSessionMessage } from "@/lib/session-user";
import { encryptedVaultSchema } from "@/lib/validation";

export const runtime = "nodejs";

const noStoreHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, private",
  Pragma: "no-cache",
};

function vaultResponse(body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, {
    ...init,
    headers: {
      ...noStoreHeaders,
      ...(init?.headers ?? {}),
    },
  });
}

function mapVault(vault: {
  id: string;
  name: string;
  encryptedBlob: string;
  salt: string;
  iv: string;
  kdf: string;
  iterations: number;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: vault.id,
    name: vault.name,
    encryptedBlob: vault.encryptedBlob,
    salt: vault.salt,
    iv: vault.iv,
    kdf: vault.kdf,
    iterations: vault.iterations,
    createdAt: vault.createdAt.toISOString(),
    updatedAt: vault.updatedAt.toISOString(),
  };
}

export async function GET() {
  const userId = await getVerifiedSessionUserId();
  if (!userId) {
    return vaultResponse({ error: staleSessionMessage }, { status: 401 });
  }

  const vault = await db.encryptedVault.findFirst({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });

  return vaultResponse({ vault: vault ? mapVault(vault) : null });
}

export async function POST(request: Request) {
  const userId = await getVerifiedSessionUserId();
  if (!userId) {
    return vaultResponse({ error: staleSessionMessage }, { status: 401 });
  }

  const json = await request.json();
  const parsed = encryptedVaultSchema.safeParse(json);

  if (!parsed.success) {
    return vaultResponse(
      { error: parsed.error.issues[0]?.message ?? "Invalid encrypted vault payload." },
      { status: 400 },
    );
  }

  const existing = await db.encryptedVault.findFirst({
    where: { userId, name: parsed.data.name },
    select: { id: true },
  });

  if (existing) {
    return vaultResponse(
      { error: "A vault with this name already exists. Use PUT to update it." },
      { status: 409 },
    );
  }

  const vault = await db.encryptedVault.create({
    data: {
      userId,
      ...parsed.data,
    },
  });

  return vaultResponse({ vault: mapVault(vault) }, { status: 201 });
}

export async function PUT(request: Request) {
  const userId = await getVerifiedSessionUserId();
  if (!userId) {
    return vaultResponse({ error: staleSessionMessage }, { status: 401 });
  }

  const json = await request.json();
  const parsed = encryptedVaultSchema.safeParse(json);

  if (!parsed.success) {
    return vaultResponse(
      { error: parsed.error.issues[0]?.message ?? "Invalid encrypted vault payload." },
      { status: 400 },
    );
  }

  const existing = await db.encryptedVault.findFirst({
    where: { userId, name: parsed.data.name },
    select: { id: true },
  });

  if (!existing) {
    return vaultResponse({ error: "Vault not found." }, { status: 404 });
  }

  const vault = await db.encryptedVault.update({
    where: { id: existing.id },
    data: parsed.data,
  });

  return vaultResponse({ vault: mapVault(vault) });
}

export async function DELETE() {
  const userId = await getVerifiedSessionUserId();
  if (!userId) {
    return vaultResponse({ error: staleSessionMessage }, { status: 401 });
  }

  await db.encryptedVault.deleteMany({
    where: { userId },
  });

  return vaultResponse({ ok: true });
}

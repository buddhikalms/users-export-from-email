import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { webcrypto } from "node:crypto";
import test from "node:test";

import {
  decryptVaultData,
  encryptVaultData,
} from "../lib/crypto/vault-crypto.ts";
import type { VaultData } from "../types/vault.ts";

const cryptoForTest = webcrypto as unknown as Crypto;

Object.defineProperty(globalThis, "crypto", {
  configurable: true,
  value: cryptoForTest,
});

Object.defineProperty(globalThis, "window", {
  configurable: true,
  value: { crypto: cryptoForTest },
});

const sampleVault: VaultData = {
  emailAccounts: [
    {
      id: "email-1",
      name: "Outlook Main",
      type: "imap",
      email: "user@example.com",
      host: "outlook.office365.com",
      port: 993,
      secure: true,
      username: "user@example.com",
      password: "imap-app-password",
    },
  ],
  marketingAccounts: [
    {
      id: "kit-1",
      platform: "kit",
      name: "Main Kit Account",
      apiKey: "sk_live_secret1234",
      apiSecret: "kit-api-secret",
    },
  ],
};

test("encrypts and decrypts vault data with the correct master password", async () => {
  const encrypted = await encryptVaultData(sampleVault, "correct horse battery staple");
  const decrypted = await decryptVaultData(
    encrypted.encryptedBlob,
    "correct horse battery staple",
    encrypted.salt,
    encrypted.iv,
    encrypted.iterations,
  );

  assert.deepEqual(decrypted, sampleVault);
});

test("wrong master password fails to decrypt", async () => {
  const encrypted = await encryptVaultData(sampleVault, "correct password");

  await assert.rejects(
    () =>
      decryptVaultData(
        encrypted.encryptedBlob,
        "wrong password",
        encrypted.salt,
        encrypted.iv,
        encrypted.iterations,
      ),
    /operation failed|decrypt/i,
  );
});

test("different IV produces different ciphertext", async () => {
  const first = await encryptVaultData(sampleVault, "same password");
  const second = await encryptVaultData(sampleVault, "same password");

  assert.notEqual(first.iv, second.iv);
  assert.notEqual(first.encryptedBlob, second.encryptedBlob);
});

test("stored vault payload does not contain raw secrets", async () => {
  const encrypted = await encryptVaultData(sampleVault, "correct password");
  const databasePayload = JSON.stringify({
    name: "Default Vault",
    ...encrypted,
  });

  assert.equal(databasePayload.includes("sk_live_secret1234"), false);
  assert.equal(databasePayload.includes("imap-app-password"), false);
  assert.equal(databasePayload.includes("kit-api-secret"), false);
});

test("mail credentials are not logged in IMAP routes", () => {
  const syncRoute = readFileSync("app/api/imap/sync/route.ts", "utf8");
  const foldersRoute = readFileSync("app/api/imap/folders/route.ts", "utf8");
  const testRoute = readFileSync("app/api/imap/test-connection/route.ts", "utf8");

  assert.equal(/console\.(log|debug|info|warn|error)/.test(syncRoute), false);
  assert.equal(/console\.(log|debug|info|warn|error)/.test(foldersRoute), false);
  assert.equal(/console\.(log|debug|info|warn|error)/.test(testRoute), false);
});

test("browser storage helpers do not persist decrypted credential fields", () => {
  const storage = readFileSync("lib/storage.ts", "utf8");

  assert.equal(storage.includes("localStorage.setItem"), false);
  assert.equal(storage.includes("sessionStorage.setItem(SESSION_SETTINGS_KEY"), false);
  assert.equal(storage.includes("PERSISTED_SETTINGS_KEY"), false);
});

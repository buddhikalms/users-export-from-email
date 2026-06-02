import type { VaultData } from "@/types/vault";

const DEFAULT_ITERATIONS = 250000;
const SALT_BYTES = 16;
const IV_BYTES = 12;

function getCrypto() {
  const cryptoSource = typeof window !== "undefined" ? window.crypto : globalThis.crypto;

  if (!cryptoSource?.subtle) {
    throw new Error("Web Crypto API is not available in this browser.");
  }

  return cryptoSource;
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary);
}

function base64ToBytes(value: string) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

export function generateSalt() {
  const bytes = new Uint8Array(SALT_BYTES);
  getCrypto().getRandomValues(bytes);
  return bytesToBase64(bytes);
}

export function generateIv() {
  const bytes = new Uint8Array(IV_BYTES);
  getCrypto().getRandomValues(bytes);
  return bytesToBase64(bytes);
}

export async function deriveVaultKey(
  masterPassword: string,
  salt: string,
  iterations = DEFAULT_ITERATIONS,
) {
  const cryptoSource = getCrypto();
  const encoder = new TextEncoder();
  const keyMaterial = await cryptoSource.subtle.importKey(
    "raw",
    encoder.encode(masterPassword),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return cryptoSource.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: base64ToBytes(salt),
      iterations,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptVaultData(
  data: VaultData,
  masterPassword: string,
  iterations = DEFAULT_ITERATIONS,
) {
  const salt = generateSalt();
  const iv = generateIv();
  const key = await deriveVaultKey(masterPassword, salt, iterations);
  const encodedData = new TextEncoder().encode(JSON.stringify(data));
  const encrypted = await getCrypto().subtle.encrypt(
    { name: "AES-GCM", iv: base64ToBytes(iv) },
    key,
    encodedData,
  );

  return {
    encryptedBlob: bytesToBase64(new Uint8Array(encrypted)),
    salt,
    iv,
    kdf: "PBKDF2" as const,
    iterations,
  };
}

export async function decryptVaultData(
  encryptedBlob: string,
  masterPassword: string,
  salt: string,
  iv: string,
  iterations = DEFAULT_ITERATIONS,
): Promise<VaultData> {
  const key = await deriveVaultKey(masterPassword, salt, iterations);
  const decrypted = await getCrypto().subtle.decrypt(
    { name: "AES-GCM", iv: base64ToBytes(iv) },
    key,
    base64ToBytes(encryptedBlob),
  );
  const parsed = JSON.parse(new TextDecoder().decode(decrypted)) as VaultData;

  return {
    emailAccounts: Array.isArray(parsed.emailAccounts) ? parsed.emailAccounts : [],
    marketingAccounts: Array.isArray(parsed.marketingAccounts)
      ? parsed.marketingAccounts
      : [],
  };
}

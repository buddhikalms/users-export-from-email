import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

function getEncryptionKey() {
  const secret = process.env.ACCOUNT_ENCRYPTION_KEY;

  if (!secret) {
    throw new Error(
      "ACCOUNT_ENCRYPTION_KEY is not configured. Add it to your environment before saving account passwords.",
    );
  }

  return createHash("sha256").update(secret).digest();
}

export function encryptSecret(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    encryptedPassword: encrypted.toString("base64"),
    encryptionIv: iv.toString("base64"),
    encryptionTag: tag.toString("base64"),
  };
}

export function decryptSecret(payload: {
  encryptedPassword: string;
  encryptionIv: string;
  encryptionTag: string;
}) {
  const decipher = createDecipheriv(
    "aes-256-gcm",
    getEncryptionKey(),
    Buffer.from(payload.encryptionIv, "base64"),
  );
  decipher.setAuthTag(Buffer.from(payload.encryptionTag, "base64"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(payload.encryptedPassword, "base64")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

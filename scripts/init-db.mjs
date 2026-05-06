import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

function loadEnvFile() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) {
    return;
  }

  const contents = fs.readFileSync(envPath, "utf8");
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separator = trimmed.indexOf("=");
    if (separator === -1) {
      continue;
    }

    const key = trimmed.slice(0, separator).trim();
    const rawValue = trimmed.slice(separator + 1).trim();
    const value = rawValue.replace(/^"(.*)"$/, "$1");

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function assertMySqlDatabaseUrl(databaseUrl) {
  if (!databaseUrl?.startsWith("mysql://")) {
    throw new Error(
      "DATABASE_URL must use a MySQL connection string, for example mysql://user:password@127.0.0.1:3306/database_name.",
    );
  }
}

function getNpxCommand() {
  return process.platform === "win32" ? "npx.cmd" : "npx";
}

loadEnvFile();
assertMySqlDatabaseUrl(process.env.DATABASE_URL);

const result = spawnSync(getNpxCommand(), ["prisma", "db", "push"], {
  cwd: process.cwd(),
  stdio: "inherit",
  env: process.env,
});

if (result.error) {
  throw result.error;
}

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

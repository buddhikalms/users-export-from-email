import "server-only";

import { z } from "zod";

import { PayPalSyncError, type PayPalEnvironment } from "@/lib/paypal/types";

const environmentSchema = z.enum(["sandbox", "live"]);

type PayPalTokenResponse = {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
};

type PayPalErrorResponse = {
  name?: string;
  message?: string;
  details?: Array<{ issue?: string; description?: string }>;
};

export function getPayPalEnvironment(): PayPalEnvironment {
  return environmentSchema.catch("sandbox").parse(process.env.PAYPAL_ENV);
}

export function getPayPalBaseUrl(environment = getPayPalEnvironment()) {
  return environment === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

export function getPayPalClientId() {
  const clientId = process.env.PAYPAL_CLIENT_ID?.trim();
  if (!clientId) {
    throw new PayPalSyncError("PayPal client ID is not configured.", "INVALID_CLIENT_ID", 503);
  }
  return clientId;
}

export function getMaskedPayPalClientId() {
  const clientId = process.env.PAYPAL_CLIENT_ID?.trim();
  if (!clientId) return null;
  if (clientId.length <= 10) return `${clientId.slice(0, 3)}...`;
  return `${clientId.slice(0, 6)}...${clientId.slice(-4)}`;
}

function getPayPalClientSecret() {
  const secret = process.env.PAYPAL_CLIENT_SECRET?.trim();
  if (!secret) {
    throw new PayPalSyncError("PayPal client secret is not configured.", "INVALID_CLIENT_SECRET", 503);
  }
  return secret;
}

function mapPayPalError(response: Response, body: PayPalErrorResponse | PayPalTokenResponse) {
  const detail = "details" in body ? body.details?.[0] : undefined;
  const message =
    detail?.description ??
    ("error_description" in body ? body.error_description : undefined) ??
    ("message" in body ? body.message : undefined) ??
    "PayPal request failed.";

  if (response.status === 401) {
    return new PayPalSyncError(message, "INVALID_CLIENT_SECRET", 401);
  }
  if (response.status === 429) {
    return new PayPalSyncError(message, "RATE_LIMITED", 429);
  }
  return new PayPalSyncError(message, "PAYPAL_REQUEST_FAILED", response.status);
}

async function parseJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  return text ? (JSON.parse(text) as T) : ({} as T);
}

export async function getPayPalAccessToken() {
  const clientId = getPayPalClientId();
  const secret = getPayPalClientSecret();

  let response: Response;
  try {
    response = await fetch(`${getPayPalBaseUrl()}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
  } catch (error) {
    throw new PayPalSyncError(
      error instanceof DOMException && error.name === "TimeoutError"
        ? "PayPal authentication timed out."
        : "Unable to connect to PayPal.",
      error instanceof DOMException && error.name === "TimeoutError" ? "NETWORK_TIMEOUT" : "CONNECTION_FAILED",
      504,
    );
  }

  const body = await parseJson<PayPalTokenResponse>(response);
  if (!response.ok || !body.access_token) {
    throw mapPayPalError(response, body);
  }
  return body.access_token;
}

export async function paypalRequest<T>(path: string, init?: RequestInit) {
  const accessToken = await getPayPalAccessToken();

  let response: Response;
  try {
    response = await fetch(`${getPayPalBaseUrl()}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        ...init?.headers,
      },
      cache: "no-store",
      signal: init?.signal ?? AbortSignal.timeout(20000),
    });
  } catch (error) {
    throw new PayPalSyncError(
      error instanceof DOMException && error.name === "TimeoutError"
        ? "PayPal request timed out."
        : "Unable to connect to PayPal.",
      error instanceof DOMException && error.name === "TimeoutError" ? "NETWORK_TIMEOUT" : "CONNECTION_FAILED",
      504,
    );
  }

  const body = await parseJson<T & PayPalErrorResponse>(response);
  if (!response.ok) {
    throw mapPayPalError(response, body);
  }
  return body as T;
}

export async function readJsonResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return (await response.json()) as T;
  }

  const body = await response.text();
  const preview = body
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 220);

  throw new Error(
    `Expected JSON but received ${contentType || "an unknown content type"} from ${response.url}. HTTP ${response.status}. ${preview}`,
  );
}

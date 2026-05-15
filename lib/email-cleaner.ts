export function cleanEmail(rawEmail: string): string {
  if (!rawEmail) {
    return "";
  }

  const markdownMailtoMatch = rawEmail.match(/\]\(\s*mailto:([^)#?\s]+)(?:[?#][^)]*)?\s*\)/i);
  const markdownTextMatch = rawEmail.match(/\[\s*([^\]\s]+@[^\]\s]+)\s*\]/i);
  const candidate = markdownMailtoMatch?.[1] ?? markdownTextMatch?.[1] ?? rawEmail;
  const stripped = candidate.replace(/[<>"']/g, "").trim();

  return stripped
    .replace(/^mailto:/i, "")
    .split("?")[0]
    .split("#")[0]
    .trim()
    .toLowerCase();
}

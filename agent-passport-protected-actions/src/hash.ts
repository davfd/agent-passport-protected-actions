import { createHash } from "node:crypto";

export function stableStringify(value: unknown): string {
  return JSON.stringify(sortValue(value));
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortValue);
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, v]) => v !== undefined)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => [k, sortValue(v)])
    );
  }
  return value;
}

export function sha256Hex(value: unknown): string {
  const bytes = typeof value === "string" ? value : stableStringify(value);
  return createHash("sha256").update(bytes).digest("hex");
}

export function sha256Urn(value: unknown): string {
  return `sha256:${sha256Hex(value)}`;
}

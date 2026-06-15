import { createHash } from "node:crypto";
import type { ProtectedActionDecision, T3nExecutePayload } from "./protected-action.js";

export const SAFE_EGRESS_ACTION = "agent-passport.safe-egress";
export const SAFE_EGRESS_TARGET = "terminal3.testnet.safe-egress";
export const SAFE_EGRESS_ALLOWED_HOST = "httpbin.org";
export const SAFE_EGRESS_ALLOWED_URL = "https://httpbin.org/post";
export const SAFE_EGRESS_CONTRACT_VERSION = "0.1.0";
export const SAFE_EGRESS_WASM_PATH = "../repos/z-safe-egress-demo/target/wasm32-wasip2/release/z_safe_egress_demo.wasm";

export type SafeEgressEdge = "denied-egress" | "placeholder-denial" | "allowed-egress";

export interface SafeEgressCallInput {
  requestId: string;
  url?: string;
  action?: string;
  target?: string;
}

export function buildSafeEgressContractInput(input: SafeEgressCallInput): Record<string, unknown> {
  return {
    requestId: input.requestId,
    url: input.url ?? SAFE_EGRESS_ALLOWED_URL,
    action: input.action ?? SAFE_EGRESS_ACTION,
    target: input.target ?? SAFE_EGRESS_TARGET,
  };
}

export function sha256HexBytes(bytes: string | Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}

export function sanitizeLiveError(error: unknown, secrets: Array<string | undefined> = []): string {
  const raw = error instanceof Error
    ? `${error.name}: ${error.message}`
    : typeof error === "string"
      ? error
      : JSON.stringify(error);
  let sanitized = raw;
  for (const secret of secrets) {
    if (secret) {
      sanitized = sanitized.split(secret).join("[REDACTED]");
    }
  }
  return sanitized
    .replace(/0x[a-fA-F0-9]{64,}/g, "0x[REDACTED_HEX]")
    .slice(0, 2000);
}

export function forbiddenEvidenceHits(value: unknown): string[] {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  const checks: Array<[string, RegExp]> = [
    ["env filename", /\.env/i],
    ["T3N api key name", /T3N_API_KEY/],
    ["private key", /private[_ -]?key/i],
    ["raw pii marker", /raw\s+PII\s*[:=]\s*true/i],
    ["real payment", /real\s+payment|money\s+movement\s*[:=]\s*true/i],
    ["kyc overclaim", /\bKYC\b.*(verified|complete|solved|production)/i],
    ["legal governance overclaim", /legal\s+governance|recognized\s+governance|production\s+governance/i],
  ];
  return checks.filter(([, re]) => re.test(text)).map(([label]) => label);
}

export function edgeReceiptName(edge: SafeEgressEdge, requestId: string, status: string): string {
  return `safe_egress_${edge}-${requestId}-${status}.json`;
}

export function executePayloadFromAllowedDecision(decision: ProtectedActionDecision): T3nExecutePayload {
  if (!decision.allowed || !decision.t3nExecutePayload) {
    throw new Error("safe-egress execution requires an allowed decision with a canonical T3N execute payload");
  }
  return decision.t3nExecutePayload;
}

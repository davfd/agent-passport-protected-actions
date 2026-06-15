import { sha256Urn, sha256Hex, stableStringify } from "./hash.js";

export type ProbeOutcome = "ok" | "refused" | "unavailable";

export interface IdentityStatusInput {
  ok: boolean;
  status?: string;
  provider?: string;
  vcIds?: string[];
  updatedAt?: number;
  error?: string;
}

export interface HumanIdentitySummary {
  outcome: ProbeOutcome;
  provider?: string;
  terminalStatus?: string;
  vcCount?: number;
  updatedAt?: number;
  error?: string;
  safeClaim: "not-proved-by-this-probe" | "provider-status-only-not-legal-claim";
}

export interface SdkBreadthReceiptInput {
  issuedAt: string;
  sdkVersion: string;
  environment: string;
  nodeUrl: string;
  did: string;
  auth: { ok: boolean; address?: string; error?: string };
  usage: { ok: boolean; responseHash?: string; balanceAvailable?: number; error?: string };
  wallet: {
    ok: boolean;
    primary?: string | null;
    secondary?: string[];
    historyHash?: string;
    error?: string;
  };
  humanIdentity: HumanIdentitySummary;
  auditRead: { ok: boolean; batchCount?: number; eventCount?: number; responseHash?: string; error?: string };
}

export interface SdkBreadthReceipt {
  schema: "leonardo.t3n.sdk-breadth-receipt.v0.1";
  issuedAt: string;
  sdkVersion: string;
  environment: string;
  nodeUrl: string;
  did: string;
  surfaces: {
    auth: { ok: boolean; addressHash?: string; error?: string };
    usage: { ok: boolean; responseHash?: string; balanceAvailable?: number; error?: string };
    wallet: {
      ok: boolean;
      primaryAddressHash?: string;
      secondaryAddressHashes: string[];
      historyHash?: string;
      error?: string;
    };
    humanIdentity: HumanIdentitySummary;
    auditRead: { ok: boolean; batchCount?: number; eventCount?: number; responseHash?: string; error?: string };
  };
  boundaries: {
    testnetOnly: boolean;
    noRawPiiReturned: boolean;
    noMoneyMovement: boolean;
    productionTrustClaim: false;
    humanIdentityProofClaim: false;
    realPaymentClaim: false;
    rawPiiDisclosureClaim: false;
  };
  receiptHash: string;
}

function normalizeHash(value?: string): string | undefined {
  if (!value) return undefined;
  return value.startsWith("sha256:") ? value : `sha256:${value}`;
}

export function sanitizeProbeError(error: unknown, secrets: Array<string | undefined> = []): string {
  const raw = error instanceof Error
    ? `${error.name}: ${error.message}`
    : typeof error === "string"
      ? error
      : JSON.stringify(error);
  let sanitized = raw;
  for (const secret of secrets) {
    if (secret) {
      sanitized = sanitized.split(secret).join("[REDACTED_SECRET]");
    }
  }
  return sanitized
    .replace(/private[_ -]?key/gi, "[REDACTED_SECRET_TERM]")
    .replace(/0x[a-fA-F0-9]{40,}/g, "0x[REDACTED_HEX]")
    .replace(/[A-Za-z0-9_-]{48,}/g, (match) => match.startsWith("sha256") ? match : "[REDACTED_LONG_TOKEN]")
    .slice(0, 2000);
}

export function summarizeIdentityStatus(input: IdentityStatusInput): HumanIdentitySummary {
  if (!input.ok) {
    return {
      outcome: input.error ? "refused" : "unavailable",
      error: input.error,
      safeClaim: "not-proved-by-this-probe",
    };
  }

  return {
    outcome: "ok",
    provider: input.provider,
    terminalStatus: input.status,
    vcCount: input.vcIds?.length ?? 0,
    updatedAt: input.updatedAt,
    safeClaim: input.status === "verified"
      ? "provider-status-only-not-legal-claim"
      : "not-proved-by-this-probe",
  };
}

export function buildSdkBreadthReceipt(input: SdkBreadthReceiptInput): SdkBreadthReceipt {
  const body = {
    schema: "leonardo.t3n.sdk-breadth-receipt.v0.1" as const,
    issuedAt: new Date(input.issuedAt).toISOString(),
    sdkVersion: input.sdkVersion,
    environment: input.environment,
    nodeUrl: input.nodeUrl,
    did: input.did,
    surfaces: {
      auth: {
        ok: input.auth.ok,
        addressHash: input.auth.address ? sha256Urn(input.auth.address.toLowerCase()) : undefined,
        error: input.auth.error,
      },
      usage: {
        ok: input.usage.ok,
        responseHash: normalizeHash(input.usage.responseHash),
        balanceAvailable: input.usage.balanceAvailable,
        error: input.usage.error,
      },
      wallet: {
        ok: input.wallet.ok,
        primaryAddressHash: input.wallet.primary ? sha256Urn(input.wallet.primary.toLowerCase()) : undefined,
        secondaryAddressHashes: (input.wallet.secondary ?? []).map((address) => sha256Urn(address.toLowerCase())),
        historyHash: normalizeHash(input.wallet.historyHash),
        error: input.wallet.error,
      },
      humanIdentity: input.humanIdentity,
      auditRead: {
        ok: input.auditRead.ok,
        batchCount: input.auditRead.batchCount,
        eventCount: input.auditRead.eventCount,
        responseHash: normalizeHash(input.auditRead.responseHash),
        error: input.auditRead.error,
      },
    },
    boundaries: {
      testnetOnly: input.environment === "testnet",
      noRawPiiReturned: true,
      noMoneyMovement: true,
      productionTrustClaim: false as const,
      humanIdentityProofClaim: false as const,
      realPaymentClaim: false as const,
      rawPiiDisclosureClaim: false as const,
    },
  };

  return {
    ...body,
    receiptHash: `sha256:${sha256Hex(stableStringify(body))}`,
  };
}

export function forbiddenSdkBreadthEvidenceHits(value: unknown): string[] {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  const checks: Array<[string, RegExp]> = [
    ["env filename", /\.env/i],
    ["T3N api key name", /T3N_API_KEY/],
    ["private-key term", /private[_ -]?key/i],
    ["raw pii true", /raw\s*pii\s*(returned|disclosure)?\s*[:=]\s*true/i],
    ["money movement true", /money\s*movement\s*[:=]\s*true/i],
    ["production trust claim", /production\s+trust\s+(solved|complete|proved)/i],
    ["real payment claim", /real\s+payment\s+(movement\s+)?(solved|complete|proved)/i],
    ["human identity overclaim", /human\s+identity\s+(proof\s+)?(complete|solved|proved)/i],
  ];
  return checks.filter(([, re]) => re.test(text)).map(([label]) => label);
}

export function sdkBreadthReceiptName(stamp: string, status: "live-submitted" | "live-failed"): string {
  return `sdk_breadth-${stamp}-${status}.json`;
}

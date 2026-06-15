import { sha256Hex, stableStringify } from "./hash.js";

export type PiiMode = "placeholder-only";

export interface PassportAuthority {
  allowedActions: string[];
  allowedTargets: string[];
  maxAmountCents: number;
  currency: string;
  piiMode: PiiMode;
}

export interface BuildAgentPassportInput {
  agentName: string;
  agentDid: string;
  issuer: string;
  issuedAt: string;
  expiresAt: string;
  authority: PassportAuthority;
}

export interface AgentPassport {
  schema: "leonardo.agent-passport.v0.1";
  passportId: string;
  agent: {
    name: string;
    did: string;
  };
  issuer: {
    did: string;
  };
  issuedAt: string;
  expiresAt: string;
  authority: PassportAuthority;
}

const T3_DID_RE = /^did:t3n:[0-9a-fA-F]{40}$/;

export function isT3Did(value: string): boolean {
  return T3_DID_RE.test(value);
}

export function buildAgentPassport(input: BuildAgentPassportInput): AgentPassport {
  if (!isT3Did(input.agentDid)) {
    throw new Error(`agentDid must be a Terminal 3 DID of form did:t3n:<40 hex>; got ${input.agentDid}`);
  }
  if (!isT3Did(input.issuer)) {
    throw new Error(`issuer must be a Terminal 3 DID of form did:t3n:<40 hex>; got ${input.issuer}`);
  }
  if (!Number.isSafeInteger(input.authority.maxAmountCents) || input.authority.maxAmountCents < 0) {
    throw new Error("authority.maxAmountCents must be a non-negative safe integer");
  }
  if (Number.isNaN(Date.parse(input.issuedAt)) || Number.isNaN(Date.parse(input.expiresAt))) {
    throw new Error("issuedAt and expiresAt must be ISO-parseable timestamps");
  }
  if (new Date(input.expiresAt).getTime() <= new Date(input.issuedAt).getTime()) {
    throw new Error("expiresAt must be after issuedAt");
  }
  if (input.authority.piiMode !== "placeholder-only") {
    throw new Error("only placeholder-only PII mode is supported for this demo");
  }

  const canonicalAuthority: PassportAuthority = {
    allowedActions: Array.from(new Set(input.authority.allowedActions)).sort(),
    allowedTargets: Array.from(new Set(input.authority.allowedTargets)).sort(),
    maxAmountCents: input.authority.maxAmountCents,
    currency: input.authority.currency.toUpperCase(),
    piiMode: input.authority.piiMode
  };

  const unsigned = {
    schema: "leonardo.agent-passport.v0.1",
    agent: { name: input.agentName, did: input.agentDid.toLowerCase() },
    issuer: { did: input.issuer.toLowerCase() },
    issuedAt: new Date(input.issuedAt).toISOString(),
    expiresAt: new Date(input.expiresAt).toISOString(),
    authority: canonicalAuthority
  } as const;

  return {
    ...unsigned,
    passportId: `awe_${sha256Hex(stableStringify(unsigned))}`
  };
}

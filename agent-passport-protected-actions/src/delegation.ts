import type { PassportAuthority } from "./passport.js";
import { sha256Hex, sha256Urn, stableStringify } from "./hash.js";

export type DelegationGrantStatus = "active" | "revoked";

export interface BuildDelegationGrantInput {
  humanRefHash: string;
  issuerDid: string;
  agentDid: string;
  issuedAt: string;
  expiresAt: string;
  nonce: string;
  evidenceHash: string;
  authority: PassportAuthority;
  status?: DelegationGrantStatus;
}

export interface DelegationConsentProof {
  algorithm: "ed25519";
  challengeHash: string;
  signatureHash: string;
  publicKeyFingerprint: string;
  signedAt: string;
}

export interface DelegationGrant {
  schema: "leonardo.delegation-grant.v0.1";
  grantId: string;
  grantHash: string;
  humanRefHash: string;
  issuer: {
    did: string;
  };
  agent: {
    did: string;
  };
  issuedAt: string;
  expiresAt: string;
  nonce: string;
  evidenceHash: string;
  authority: PassportAuthority;
  status: DelegationGrantStatus;
  consentProof?: DelegationConsentProof;
}

const SHA256_URN_RE = /^sha256:[a-f0-9]{64}$/;
const T3_DID_RE = /^did:t3n:[0-9a-fA-F]{40}$/;

export function isSha256Urn(value: string): boolean {
  return SHA256_URN_RE.test(value);
}

function normalizeAuthority(authority: PassportAuthority): PassportAuthority {
  if (!Number.isSafeInteger(authority.maxAmountCents) || authority.maxAmountCents < 0) {
    throw new Error("delegation authority.maxAmountCents must be a non-negative safe integer");
  }
  if (authority.piiMode !== "placeholder-only") {
    throw new Error("only placeholder-only PII mode is supported for delegation grants");
  }
  return {
    allowedActions: Array.from(new Set(authority.allowedActions)).sort(),
    allowedTargets: Array.from(new Set(authority.allowedTargets)).sort(),
    maxAmountCents: authority.maxAmountCents,
    currency: authority.currency.toUpperCase(),
    piiMode: authority.piiMode
  };
}

export function buildDelegationGrant(input: BuildDelegationGrantInput): DelegationGrant {
  if (!isSha256Urn(input.humanRefHash)) {
    throw new Error("humanRefHash must be a sha256:<64 hex> opaque subject hash, not raw identity");
  }
  if (!isSha256Urn(input.evidenceHash)) {
    throw new Error("evidenceHash must be a sha256:<64 hex> hash of the consent evidence");
  }
  if (!T3_DID_RE.test(input.issuerDid)) {
    throw new Error(`issuerDid must be a Terminal 3 DID of form did:t3n:<40 hex>; got ${input.issuerDid}`);
  }
  if (!T3_DID_RE.test(input.agentDid)) {
    throw new Error(`agentDid must be a Terminal 3 DID of form did:t3n:<40 hex>; got ${input.agentDid}`);
  }
  if (Number.isNaN(Date.parse(input.issuedAt)) || Number.isNaN(Date.parse(input.expiresAt))) {
    throw new Error("issuedAt and expiresAt must be ISO-parseable timestamps");
  }
  if (new Date(input.expiresAt).getTime() <= new Date(input.issuedAt).getTime()) {
    throw new Error("expiresAt must be after issuedAt");
  }
  if (!input.nonce.trim()) {
    throw new Error("delegation nonce is required");
  }

  const body = {
    schema: "leonardo.delegation-grant.v0.1" as const,
    humanRefHash: input.humanRefHash,
    issuer: { did: input.issuerDid.toLowerCase() },
    agent: { did: input.agentDid.toLowerCase() },
    issuedAt: new Date(input.issuedAt).toISOString(),
    expiresAt: new Date(input.expiresAt).toISOString(),
    nonce: input.nonce,
    evidenceHash: input.evidenceHash,
    authority: normalizeAuthority(input.authority),
    status: input.status ?? "active"
  };
  const grantHash = `sha256:${sha256Hex(stableStringify(body))}`;
  return {
    ...body,
    grantHash,
    grantId: `deleg_${sha256Hex(grantHash).slice(0, 32)}`
  };
}

export function delegationNonceHash(grant: DelegationGrant): string {
  return sha256Urn(grant.nonce);
}

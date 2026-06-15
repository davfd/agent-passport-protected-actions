import type { PassportAuthority } from "./passport.js";
import { isSha256Urn } from "./delegation.js";
import { sha256Hex, stableStringify } from "./hash.js";

export type ConsentPolicyStatus = "active" | "revoked";

export interface BuildConsentPolicyAnchorInput {
  policyId: string;
  version: string;
  sourceUri: string;
  sourceHash: string;
  issuedAt: string;
  effectiveAt: string;
  expiresAt: string;
  issuerDids: string[];
  authority: PassportAuthority;
  requiresSignedConsent: boolean;
  requiresAudit: boolean;
  status?: ConsentPolicyStatus;
}

export interface ConsentPolicyAnchor {
  schema: "leonardo.consent-policy-anchor.v0.1";
  policyId: string;
  policyHash: string;
  version: string;
  source: {
    sourceUri: string;
    sourceHash: string;
  };
  issuedAt: string;
  effectiveAt: string;
  expiresAt: string;
  issuerDids: string[];
  authority: PassportAuthority;
  requiresSignedConsent: boolean;
  requiresAudit: boolean;
  status: ConsentPolicyStatus;
}

const T3_DID_RE = /^did:t3n:[0-9a-fA-F]{40}$/;

function normalizeAuthority(authority: PassportAuthority): PassportAuthority {
  if (!Number.isSafeInteger(authority.maxAmountCents) || authority.maxAmountCents < 0) {
    throw new Error("consent policy authority.maxAmountCents must be a non-negative safe integer");
  }
  if (authority.piiMode !== "placeholder-only") {
    throw new Error("only placeholder-only PII mode is supported for consent policy anchors");
  }
  return {
    allowedActions: Array.from(new Set(authority.allowedActions)).sort(),
    allowedTargets: Array.from(new Set(authority.allowedTargets)).sort(),
    maxAmountCents: authority.maxAmountCents,
    currency: authority.currency.toUpperCase(),
    piiMode: authority.piiMode
  };
}

export function buildConsentPolicyAnchor(input: BuildConsentPolicyAnchorInput | ConsentPolicyAnchor): ConsentPolicyAnchor {
  const sourceUri = "sourceUri" in input ? input.sourceUri : input.source.sourceUri;
  const sourceHash = "sourceHash" in input ? input.sourceHash : input.source.sourceHash;
  if (!input.policyId.trim()) {
    throw new Error("policyId is required");
  }
  if (!input.version.trim()) {
    throw new Error("policy version is required");
  }
  if (!sourceUri.trim()) {
    throw new Error("policy sourceUri is required");
  }
  if (!isSha256Urn(sourceHash)) {
    throw new Error("sourceHash must be a sha256:<64 hex> hash of the policy source document");
  }
  if (Number.isNaN(Date.parse(input.issuedAt)) || Number.isNaN(Date.parse(input.effectiveAt)) || Number.isNaN(Date.parse(input.expiresAt))) {
    throw new Error("issuedAt, effectiveAt, and expiresAt must be ISO-parseable timestamps");
  }
  if (new Date(input.expiresAt).getTime() <= new Date(input.effectiveAt).getTime()) {
    throw new Error("policy expiresAt must be after effectiveAt");
  }
  if (input.issuerDids.length === 0) {
    throw new Error("policy must name at least one issuer DID");
  }
  const issuerDids = Array.from(new Set(input.issuerDids.map((did) => did.toLowerCase()))).sort();
  const badDid = issuerDids.find((did) => !T3_DID_RE.test(did));
  if (badDid) {
    throw new Error(`issuer DID ${badDid} is not a Terminal 3 DID of form did:t3n:<40 hex>`);
  }

  const body = {
    schema: "leonardo.consent-policy-anchor.v0.1" as const,
    policyId: input.policyId,
    version: input.version,
    source: {
      sourceUri,
      sourceHash
    },
    issuedAt: new Date(input.issuedAt).toISOString(),
    effectiveAt: new Date(input.effectiveAt).toISOString(),
    expiresAt: new Date(input.expiresAt).toISOString(),
    issuerDids,
    authority: normalizeAuthority(input.authority),
    requiresSignedConsent: input.requiresSignedConsent,
    requiresAudit: input.requiresAudit,
    status: input.status ?? "active"
  };

  return {
    ...body,
    policyHash: `sha256:${sha256Hex(stableStringify(body))}`
  };
}

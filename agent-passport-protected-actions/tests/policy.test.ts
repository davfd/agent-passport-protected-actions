import { describe, expect, it } from "vitest";
import { buildConsentChallenge, buildSignedDelegationGrant, generateConsentKeyPair, signConsentChallenge } from "../src/consent.js";
import { buildAgentPassport } from "../src/passport.js";
import { buildConsentPolicyAnchor } from "../src/policy.js";
import { decideProtectedAction } from "../src/protected-action.js";
import { buildActionReceipt } from "../src/receipt.js";
import { sha256Urn } from "../src/hash.js";

const passport = buildAgentPassport({
  agentName: "leonardo-protected-action-agent",
  agentDid: "did:t3n:1234567890abcdef1234567890abcdef12345678",
  issuer: "did:t3n:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  issuedAt: "2026-06-15T00:00:00.000Z",
  expiresAt: "2026-06-22T15:59:00.000Z",
  authority: {
    allowedActions: ["payment.intent.create"],
    allowedTargets: ["stripe-test-merchant"],
    maxAmountCents: 50000,
    currency: "USD",
    piiMode: "placeholder-only"
  }
});

const grantInput = {
  humanRefHash: "sha256:1111111111111111111111111111111111111111111111111111111111111111",
  issuerDid: passport.issuer.did,
  agentDid: passport.agent.did,
  issuedAt: "2026-06-15T00:00:30.000Z",
  expiresAt: "2026-06-15T00:10:00.000Z",
  nonce: "human-consent-nonce-policy-001",
  evidenceHash: "sha256:2222222222222222222222222222222222222222222222222222222222222222",
  authority: {
    allowedActions: ["payment.intent.create"],
    allowedTargets: ["stripe-test-merchant"],
    maxAmountCents: 50000,
    currency: "USD",
    piiMode: "placeholder-only" as const
  }
};

const policyDocument = {
  policyId: "policy-agent-passport-demo-v0.1",
  statement: "Demo policy source of truth: signed consent required; no raw PII; no money movement in this scaffold."
};
const policy = buildConsentPolicyAnchor({
  policyId: "policy-agent-passport-demo-v0.1",
  version: "0.1.0",
  sourceUri: "file://policies/agent-passport-consent-policy-v0.1.json",
  sourceHash: sha256Urn(policyDocument),
  issuedAt: "2026-06-15T00:00:00.000Z",
  effectiveAt: "2026-06-15T00:00:00.000Z",
  expiresAt: "2026-06-22T00:00:00.000Z",
  issuerDids: [passport.issuer.did],
  authority: {
    allowedActions: ["payment.intent.create"],
    allowedTargets: ["stripe-test-merchant"],
    maxAmountCents: 50000,
    currency: "USD",
    piiMode: "placeholder-only"
  },
  requiresSignedConsent: true,
  requiresAudit: true
});

const challenge = buildConsentChallenge(grantInput, { issuedAt: grantInput.issuedAt });
const keyPair = generateConsentKeyPair();
const signed = signConsentChallenge(challenge, keyPair.privateKeyPem, keyPair.publicKeyPem, "2026-06-15T00:00:32.000Z");
const signedGrant = buildSignedDelegationGrant(grantInput, signed);

const request = {
  action: "payment.intent.create",
  target: "stripe-test-merchant",
  amountCents: 42500,
  currency: "USD",
  piiRefs: ["{{profile.email}}"],
  purpose: "policy anchored signed delegated checkout"
};

describe("consent policy source-of-truth anchor", () => {
  it("builds a deterministic policy anchor and rejects raw source hashes", () => {
    expect(policy.policyHash).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(policy.source.sourceHash).toBe(sha256Urn(policyDocument));
    expect(() => buildConsentPolicyAnchor({
      ...policy,
      sourceUri: policy.source.sourceUri,
      sourceHash: "not-a-hash"
    })).toThrow(/sourceHash.*sha256/i);
  });

  it("refuses before payload when required policy anchor is missing", () => {
    const decision = decideProtectedAction(passport, request, {
      now: "2026-06-15T00:01:00.000Z",
      requestId: "req_missing_policy",
      requireDelegationGrant: true,
      requireSignedDelegationGrant: true,
      delegationGrant: signedGrant,
      requireConsentPolicyAnchor: true
    });

    expect(decision.allowed).toBe(false);
    expect(decision.reason).toMatch(/consent policy anchor is required/i);
    expect(decision.t3nExecutePayload).toBeUndefined();
  });

  it("refuses revoked or over-cap policies before payload", () => {
    const revokedDecision = decideProtectedAction(passport, request, {
      now: "2026-06-15T00:01:00.000Z",
      requestId: "req_revoked_policy",
      requireDelegationGrant: true,
      requireSignedDelegationGrant: true,
      delegationGrant: signedGrant,
      requireConsentPolicyAnchor: true,
      consentPolicyAnchor: policy,
      revokedConsentPolicyIds: [policy.policyId]
    });
    expect(revokedDecision.allowed).toBe(false);
    expect(revokedDecision.reason).toMatch(/policy.*revoked/i);
    expect(revokedDecision.t3nExecutePayload).toBeUndefined();

    const lowCapPolicy = buildConsentPolicyAnchor({
      ...policy,
      sourceUri: policy.source.sourceUri,
      sourceHash: policy.source.sourceHash,
      authority: {
        ...policy.authority,
        maxAmountCents: 1000
      }
    });
    const overCapDecision = decideProtectedAction(passport, request, {
      now: "2026-06-15T00:01:00.000Z",
      requestId: "req_over_policy_cap",
      requireDelegationGrant: true,
      requireSignedDelegationGrant: true,
      delegationGrant: signedGrant,
      requireConsentPolicyAnchor: true,
      consentPolicyAnchor: lowCapPolicy
    });
    expect(overCapDecision.allowed).toBe(false);
    expect(overCapDecision.reason).toMatch(/exceeds consent policy cap/i);
    expect(overCapDecision.t3nExecutePayload).toBeUndefined();
  });

  it("allows a signed grant only when covered by active policy and injects policy hashes into payload", () => {
    const decision = decideProtectedAction(passport, request, {
      now: "2026-06-15T00:01:00.000Z",
      requestId: "req_policy_allowed",
      requireDelegationGrant: true,
      requireSignedDelegationGrant: true,
      delegationGrant: signedGrant,
      requireConsentPolicyAnchor: true,
      consentPolicyAnchor: policy
    });

    expect(decision.allowed).toBe(true);
    if (!decision.allowed) {
      throw new Error(decision.reason);
    }
    expect(decision.consentPolicyId).toBe(policy.policyId);
    expect(decision.consentPolicyHash).toBe(policy.policyHash);
    expect(decision.t3nExecutePayload.input).toMatchObject({
      consent_policy_id: policy.policyId,
      consent_policy_hash: policy.policyHash,
      consent_policy_source_hash: policy.source.sourceHash
    });
  });

  it("binds policy anchor into receipts without raw policy text", () => {
    const decision = decideProtectedAction(passport, request, {
      now: "2026-06-15T00:01:00.000Z",
      requestId: "req_policy_receipt",
      requireDelegationGrant: true,
      requireSignedDelegationGrant: true,
      delegationGrant: signedGrant,
      requireConsentPolicyAnchor: true,
      consentPolicyAnchor: policy
    });
    const receipt = buildActionReceipt({
      passport,
      request,
      decision,
      t3n: {
        environment: "testnet",
        nodeUrl: "policy-anchor-local-demo",
        status: "dry-run-no-api-key"
      },
      issuedAt: "2026-06-15T00:01:02.000Z"
    });

    expect(receipt.evidence.policy).toEqual({
      policyId: policy.policyId,
      policyHash: policy.policyHash,
      version: policy.version,
      sourceUri: policy.source.sourceUri,
      sourceHash: policy.source.sourceHash,
      requiresSignedConsent: true,
      requiresAudit: true
    });
    expect(JSON.stringify(receipt)).not.toContain(policyDocument.statement);
  });
});

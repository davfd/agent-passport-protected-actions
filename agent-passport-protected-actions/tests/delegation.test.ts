import { describe, expect, it } from "vitest";
import { buildDelegationGrant } from "../src/delegation.js";
import { buildAgentPassport } from "../src/passport.js";
import { decideProtectedAction } from "../src/protected-action.js";
import { buildActionReceipt } from "../src/receipt.js";

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

const baseGrantInput = {
  humanRefHash: "sha256:1111111111111111111111111111111111111111111111111111111111111111",
  issuerDid: passport.issuer.did,
  agentDid: passport.agent.did,
  issuedAt: "2026-06-15T00:00:30.000Z",
  expiresAt: "2026-06-15T00:10:00.000Z",
  nonce: "human-consent-nonce-001",
  evidenceHash: "sha256:2222222222222222222222222222222222222222222222222222222222222222",
  authority: {
    allowedActions: ["payment.intent.create"],
    allowedTargets: ["stripe-test-merchant"],
    maxAmountCents: 50000,
    currency: "USD",
    piiMode: "placeholder-only" as const
  }
};

const validGrant = buildDelegationGrant(baseGrantInput);

const request = {
  action: "payment.intent.create",
  target: "stripe-test-merchant",
  amountCents: 42500,
  currency: "USD",
  piiRefs: ["{{profile.email}}"],
  purpose: "delegated checkout under human-approved cap"
};

describe("delegated consent gate", () => {
  it("refuses before payload when a delegation grant is required but absent", () => {
    const decision = decideProtectedAction(passport, request, {
      now: "2026-06-15T00:01:00.000Z",
      requestId: "req_missing_grant",
      requireDelegationGrant: true
    });

    expect(decision.allowed).toBe(false);
    expect(decision.reason).toMatch(/delegation grant.*required/i);
    expect(decision.t3nExecutePayload).toBeUndefined();
  });

  it("allows a request only when the active delegation grant covers the same agent, issuer, action, target, amount, currency, and PII mode", () => {
    const decision = decideProtectedAction(passport, request, {
      now: "2026-06-15T00:01:00.000Z",
      requestId: "req_delegated_ok",
      requireDelegationGrant: true,
      delegationGrant: validGrant,
      trustedIssuerDids: [passport.issuer.did]
    });

    expect(decision.allowed).toBe(true);
    if (!decision.allowed) {
      throw new Error(decision.reason);
    }
    expect(decision.delegationGrantId).toBe(validGrant.grantId);
    expect(decision.delegationGrantHash).toBe(validGrant.grantHash);
    expect(decision.t3nExecutePayload.input).toMatchObject({
      delegation_grant_id: validGrant.grantId,
      delegation_grant_hash: validGrant.grantHash
    });
  });

  it("refuses revoked and replayed delegation grants before payload", () => {
    const revokedDecision = decideProtectedAction(passport, request, {
      now: "2026-06-15T00:01:00.000Z",
      requestId: "req_revoked_grant",
      requireDelegationGrant: true,
      delegationGrant: validGrant,
      revokedDelegationGrantIds: [validGrant.grantId]
    });
    expect(revokedDecision.allowed).toBe(false);
    expect(revokedDecision.reason).toMatch(/delegation grant.*revoked/i);
    expect(revokedDecision.t3nExecutePayload).toBeUndefined();

    const replayDecision = decideProtectedAction(passport, request, {
      now: "2026-06-15T00:01:00.000Z",
      requestId: "req_replay_grant",
      requireDelegationGrant: true,
      delegationGrant: validGrant,
      usedDelegationNonces: [validGrant.nonce]
    });
    expect(replayDecision.allowed).toBe(false);
    expect(replayDecision.reason).toMatch(/delegation nonce.*already used/i);
    expect(replayDecision.t3nExecutePayload).toBeUndefined();
  });

  it("refuses grants that mismatch the passport issuer or exceed the delegated cap", () => {
    const wrongIssuerGrant = buildDelegationGrant({
      ...baseGrantInput,
      issuerDid: "did:t3n:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
    });
    const wrongIssuerDecision = decideProtectedAction(passport, request, {
      now: "2026-06-15T00:01:00.000Z",
      requestId: "req_wrong_delegation_issuer",
      requireDelegationGrant: true,
      delegationGrant: wrongIssuerGrant
    });
    expect(wrongIssuerDecision.allowed).toBe(false);
    expect(wrongIssuerDecision.reason).toMatch(/delegation issuer.*does not match passport issuer/i);

    const lowCapGrant = buildDelegationGrant({
      ...baseGrantInput,
      authority: {
        ...baseGrantInput.authority,
        maxAmountCents: 1000
      }
    });
    const lowCapDecision = decideProtectedAction(passport, request, {
      now: "2026-06-15T00:01:00.000Z",
      requestId: "req_delegation_over_cap",
      requireDelegationGrant: true,
      delegationGrant: lowCapGrant
    });
    expect(lowCapDecision.allowed).toBe(false);
    expect(lowCapDecision.reason).toMatch(/exceeds delegation cap 1000/i);
  });

  it("rejects grants that try to store raw human identity instead of an opaque hash", () => {
    expect(() => buildDelegationGrant({
      ...baseGrantInput,
      humanRefHash: "jane@example.com"
    })).toThrow(/humanRefHash.*sha256/i);
  });

  it("binds delegation evidence into receipts without raw human identity", () => {
    const decision = decideProtectedAction(passport, request, {
      now: "2026-06-15T00:01:00.000Z",
      requestId: "req_delegated_receipt",
      requireDelegationGrant: true,
      delegationGrant: validGrant
    });

    const receipt = buildActionReceipt({
      passport,
      request,
      decision,
      t3n: {
        environment: "testnet",
        nodeUrl: "https://node.testnet.example",
        status: "dry-run-no-api-key"
      },
      issuedAt: "2026-06-15T00:01:02.000Z"
    });

    expect(receipt.evidence.delegation).toEqual({
      grantId: validGrant.grantId,
      grantHash: validGrant.grantHash,
      humanRefHash: validGrant.humanRefHash,
      evidenceHash: validGrant.evidenceHash,
      nonceHash: expect.stringMatching(/^sha256:[a-f0-9]{64}$/)
    });
    expect(JSON.stringify(receipt)).not.toContain("jane@example.com");
  });
});

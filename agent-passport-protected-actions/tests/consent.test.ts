import { describe, expect, it } from "vitest";
import { buildDelegationGrant } from "../src/delegation.js";
import { buildAgentPassport } from "../src/passport.js";
import { decideProtectedAction } from "../src/protected-action.js";
import {
  buildConsentChallenge,
  buildSignedDelegationGrant,
  generateConsentKeyPair,
  signConsentChallenge,
  verifyConsentSignature
} from "../src/consent.js";
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

const grantInput = {
  humanRefHash: "sha256:1111111111111111111111111111111111111111111111111111111111111111",
  issuerDid: passport.issuer.did,
  agentDid: passport.agent.did,
  issuedAt: "2026-06-15T00:00:30.000Z",
  expiresAt: "2026-06-15T00:10:00.000Z",
  nonce: "human-consent-nonce-002",
  evidenceHash: "sha256:2222222222222222222222222222222222222222222222222222222222222222",
  authority: {
    allowedActions: ["payment.intent.create"],
    allowedTargets: ["stripe-test-merchant"],
    maxAmountCents: 50000,
    currency: "USD",
    piiMode: "placeholder-only" as const
  }
};

const request = {
  action: "payment.intent.create",
  target: "stripe-test-merchant",
  amountCents: 42500,
  currency: "USD",
  piiRefs: ["{{profile.email}}"],
  purpose: "signed delegated checkout under human-approved cap"
};

describe("signed delegated-consent ceremony", () => {
  it("builds a canonical consent challenge and verifies an Ed25519 signature over it", () => {
    const challenge = buildConsentChallenge(grantInput, { issuedAt: grantInput.issuedAt });
    const keyPair = generateConsentKeyPair();
    const signed = signConsentChallenge(challenge, keyPair.privateKeyPem, keyPair.publicKeyPem, "2026-06-15T00:00:32.000Z");

    expect(challenge.challengeHash).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(signed.signatureHash).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(signed.publicKeyFingerprint).toBe(keyPair.publicKeyFingerprint);
    expect(verifyConsentSignature(challenge, signed)).toBe(true);
  });

  it("rejects a signed consent proof when the challenge is tampered", () => {
    const challenge = buildConsentChallenge(grantInput, { issuedAt: grantInput.issuedAt });
    const keyPair = generateConsentKeyPair();
    const signed = signConsentChallenge(challenge, keyPair.privateKeyPem, keyPair.publicKeyPem, "2026-06-15T00:00:32.000Z");
    const tampered = buildConsentChallenge({
      ...grantInput,
      authority: {
        ...grantInput.authority,
        maxAmountCents: 999999
      }
    }, { issuedAt: "2026-06-15T00:00:31.000Z" });

    expect(verifyConsentSignature(tampered, signed)).toBe(false);
  });

  it("requires signed consent when signed delegation is required", () => {
    const unsignedGrant = buildDelegationGrant(grantInput);
    const unsignedDecision = decideProtectedAction(passport, request, {
      now: "2026-06-15T00:01:00.000Z",
      requestId: "req_unsigned_grant",
      requireDelegationGrant: true,
      requireSignedDelegationGrant: true,
      delegationGrant: unsignedGrant
    });

    expect(unsignedDecision.allowed).toBe(false);
    expect(unsignedDecision.reason).toMatch(/signed consent.*required/i);
    expect(unsignedDecision.t3nExecutePayload).toBeUndefined();

    const challenge = buildConsentChallenge(grantInput, { issuedAt: grantInput.issuedAt });
    const keyPair = generateConsentKeyPair();
    const signed = signConsentChallenge(challenge, keyPair.privateKeyPem, keyPair.publicKeyPem, "2026-06-15T00:00:32.000Z");
    const signedGrant = buildSignedDelegationGrant(grantInput, signed);
    const signedDecision = decideProtectedAction(passport, request, {
      now: "2026-06-15T00:01:00.000Z",
      requestId: "req_signed_grant",
      requireDelegationGrant: true,
      requireSignedDelegationGrant: true,
      delegationGrant: signedGrant
    });

    expect(signedDecision.allowed).toBe(true);
    if (!signedDecision.allowed) {
      throw new Error(signedDecision.reason);
    }
    expect(signedDecision.delegationConsentSignatureHash).toBe(signed.signatureHash);
    expect(signedDecision.delegationConsentChallengeHash).toBe(challenge.challengeHash);
    expect(signedDecision.t3nExecutePayload.input).toMatchObject({
      delegation_grant_id: signedGrant.grantId,
      delegation_grant_hash: signedGrant.grantHash,
      delegation_consent_signature_hash: signed.signatureHash
    });
  });

  it("binds signed consent proof into receipts without raw private key or raw human identity", () => {
    const challenge = buildConsentChallenge(grantInput, { issuedAt: grantInput.issuedAt });
    const keyPair = generateConsentKeyPair();
    const signed = signConsentChallenge(challenge, keyPair.privateKeyPem, keyPair.publicKeyPem, "2026-06-15T00:00:32.000Z");
    const signedGrant = buildSignedDelegationGrant(grantInput, signed);
    const decision = decideProtectedAction(passport, request, {
      now: "2026-06-15T00:01:00.000Z",
      requestId: "req_signed_receipt",
      requireDelegationGrant: true,
      requireSignedDelegationGrant: true,
      delegationGrant: signedGrant
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

    expect(receipt.evidence.delegation?.consentSignatureHash).toBe(signed.signatureHash);
    expect(receipt.evidence.delegation?.consentChallengeHash).toBe(challenge.challengeHash);
    expect(receipt.evidence.delegation?.publicKeyFingerprint).toBe(signed.publicKeyFingerprint);
    expect(JSON.stringify(receipt)).not.toContain("PRIVATE KEY");
    expect(JSON.stringify(receipt)).not.toContain("jane@example.com");
  });
});

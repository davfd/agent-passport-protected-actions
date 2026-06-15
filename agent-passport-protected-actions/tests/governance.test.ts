import { describe, expect, it } from "vitest";
import { buildConsentChallenge, buildSignedDelegationGrant, generateConsentKeyPair, signConsentChallenge } from "../src/consent.js";
import {
  buildGovernanceWitnessAttestation,
  buildGovernanceWitnessChallenge,
  generateGovernanceWitnessKeyPair,
  verifyGovernanceWitnessAttestation
} from "../src/governance.js";
import { sha256Urn } from "../src/hash.js";
import { buildAgentPassport } from "../src/passport.js";
import { buildConsentPolicyAnchor } from "../src/policy.js";
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

const request = {
  action: "payment.intent.create",
  target: "stripe-test-merchant",
  amountCents: 42500,
  currency: "USD",
  piiRefs: ["{{profile.email}}"],
  purpose: "governance witnessed signed delegated checkout"
};

const policyDocument = {
  policyId: "policy-agent-passport-demo-v0.1",
  statement: "Demo governance witness policy; no raw PII; no money movement."
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
  authority: passport.authority,
  requiresSignedConsent: true,
  requiresAudit: true
});

const grantInput = {
  humanRefHash: "sha256:1111111111111111111111111111111111111111111111111111111111111111",
  issuerDid: passport.issuer.did,
  agentDid: passport.agent.did,
  issuedAt: "2026-06-15T00:00:30.000Z",
  expiresAt: "2026-06-15T00:10:00.000Z",
  nonce: "human-consent-nonce-governance-001",
  evidenceHash: "sha256:2222222222222222222222222222222222222222222222222222222222222222",
  authority: passport.authority
};
const consentChallenge = buildConsentChallenge(grantInput, { issuedAt: grantInput.issuedAt });
const consentKeys = generateConsentKeyPair();
const signedConsent = signConsentChallenge(consentChallenge, consentKeys.privateKeyPem, consentKeys.publicKeyPem, "2026-06-15T00:00:32.000Z");
const signedGrant = buildSignedDelegationGrant(grantInput, signedConsent);

const witnessKeys = generateGovernanceWitnessKeyPair();
const witness = buildGovernanceWitnessAttestation({
  witnessId: "witness-demo-council-seat-1",
  witnessRole: "policy-governance-witness",
  issuedAt: "2026-06-15T00:00:40.000Z",
  expiresAt: "2026-06-15T00:10:00.000Z",
  policy,
  grant: signedGrant,
  request,
  privateKeyPem: witnessKeys.privateKeyPem,
  publicKeyPem: witnessKeys.publicKeyPem
});

describe("governance witness scaffold", () => {
  it("signs a canonical challenge over policy, signed grant, and request scope", () => {
    const challenge = buildGovernanceWitnessChallenge({
      witnessId: "witness-demo-council-seat-1",
      witnessRole: "policy-governance-witness",
      issuedAt: "2026-06-15T00:00:40.000Z",
      expiresAt: "2026-06-15T00:10:00.000Z",
      policy,
      grant: signedGrant,
      request
    });

    expect(challenge.policy.policyHash).toBe(policy.policyHash);
    expect(challenge.delegation.grantHash).toBe(signedGrant.grantHash);
    expect(challenge.delegation.consentSignatureHash).toBe(signedGrant.consentProof?.signatureHash);
    expect(challenge.request.requestHash).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(witness.attestationHash).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(verifyGovernanceWitnessAttestation(challenge, witness)).toBe(true);
  });

  it("fails verification if the request scope is tampered", () => {
    const tampered = buildGovernanceWitnessChallenge({
      witnessId: "witness-demo-council-seat-1",
      witnessRole: "policy-governance-witness",
      issuedAt: "2026-06-15T00:00:40.000Z",
      expiresAt: "2026-06-15T00:10:00.000Z",
      policy,
      grant: signedGrant,
      request: {
        ...request,
        amountCents: 49999
      }
    });

    expect(verifyGovernanceWitnessAttestation(tampered, witness)).toBe(false);
  });

  it("refuses before payload when governance witness is required but missing", () => {
    const decision = decideProtectedAction(passport, request, {
      now: "2026-06-15T00:01:00.000Z",
      requestId: "req_missing_witness",
      requireDelegationGrant: true,
      requireSignedDelegationGrant: true,
      delegationGrant: signedGrant,
      requireConsentPolicyAnchor: true,
      consentPolicyAnchor: policy,
      requireGovernanceWitness: true
    });

    expect(decision.allowed).toBe(false);
    expect(decision.reason).toMatch(/governance witness/i);
    expect(decision.t3nExecutePayload).toBeUndefined();
  });

  it("refuses revoked or request-mismatched witness attestations before payload", () => {
    const revokedDecision = decideProtectedAction(passport, request, {
      now: "2026-06-15T00:01:00.000Z",
      requestId: "req_revoked_witness",
      requireDelegationGrant: true,
      requireSignedDelegationGrant: true,
      delegationGrant: signedGrant,
      requireConsentPolicyAnchor: true,
      consentPolicyAnchor: policy,
      requireGovernanceWitness: true,
      governanceWitness: witness,
      revokedGovernanceWitnessIds: [witness.witnessId]
    });
    expect(revokedDecision.allowed).toBe(false);
    expect(revokedDecision.reason).toMatch(/governance witness.*revoked/i);

    const mismatchedWitness = buildGovernanceWitnessAttestation({
      witnessId: "witness-demo-council-seat-1",
      witnessRole: "policy-governance-witness",
      issuedAt: "2026-06-15T00:00:40.000Z",
      expiresAt: "2026-06-15T00:10:00.000Z",
      policy,
      grant: signedGrant,
      request: {
        ...request,
        target: "other-target"
      },
      privateKeyPem: witnessKeys.privateKeyPem,
      publicKeyPem: witnessKeys.publicKeyPem
    });
    const mismatchDecision = decideProtectedAction(passport, request, {
      now: "2026-06-15T00:01:00.000Z",
      requestId: "req_mismatched_witness",
      requireDelegationGrant: true,
      requireSignedDelegationGrant: true,
      delegationGrant: signedGrant,
      requireConsentPolicyAnchor: true,
      consentPolicyAnchor: policy,
      requireGovernanceWitness: true,
      governanceWitness: mismatchedWitness
    });
    expect(mismatchDecision.allowed).toBe(false);
    expect(mismatchDecision.reason).toMatch(/does not match request/i);
  });

  it("allows a request only when signed grant, policy, and governance witness all match", () => {
    const decision = decideProtectedAction(passport, request, {
      now: "2026-06-15T00:01:00.000Z",
      requestId: "req_witness_allowed",
      requireDelegationGrant: true,
      requireSignedDelegationGrant: true,
      delegationGrant: signedGrant,
      requireConsentPolicyAnchor: true,
      consentPolicyAnchor: policy,
      requireGovernanceWitness: true,
      governanceWitness: witness
    });

    expect(decision.allowed).toBe(true);
    if (!decision.allowed) {
      throw new Error(decision.reason);
    }
    expect(decision.governanceWitnessId).toBe(witness.witnessId);
    expect(decision.governanceWitnessAttestationHash).toBe(witness.attestationHash);
    expect(decision.t3nExecutePayload.input).toMatchObject({
      governance_witness_id: witness.witnessId,
      governance_witness_attestation_hash: witness.attestationHash,
      governance_witness_signature_hash: witness.signatureHash
    });
  });

  it("binds governance witness hashes into receipts without private key material", () => {
    const decision = decideProtectedAction(passport, request, {
      now: "2026-06-15T00:01:00.000Z",
      requestId: "req_witness_receipt",
      requireDelegationGrant: true,
      requireSignedDelegationGrant: true,
      delegationGrant: signedGrant,
      requireConsentPolicyAnchor: true,
      consentPolicyAnchor: policy,
      requireGovernanceWitness: true,
      governanceWitness: witness
    });
    const receipt = buildActionReceipt({
      passport,
      request,
      decision,
      t3n: {
        environment: "testnet",
        nodeUrl: "governance-witness-local-demo",
        status: "dry-run-no-api-key"
      },
      issuedAt: "2026-06-15T00:01:02.000Z"
    });

    expect(receipt.evidence.governanceWitness).toEqual({
      witnessId: witness.witnessId,
      witnessRole: witness.witnessRole,
      attestationHash: witness.attestationHash,
      signatureHash: witness.signatureHash,
      publicKeyFingerprint: witness.publicKeyFingerprint,
      challengeHash: witness.challengeHash
    });
    expect(JSON.stringify(receipt)).not.toContain("PRIVATE KEY");
  });
});

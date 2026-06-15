import { describe, expect, it } from "vitest";
import { buildConsentChallenge, buildSignedDelegationGrant, generateConsentKeyPair, signConsentChallenge } from "../src/consent.js";
import { buildGovernanceWitnessAttestation, generateGovernanceWitnessKeyPair } from "../src/governance.js";
import { sha256Urn } from "../src/hash.js";
import { buildAgentPassport } from "../src/passport.js";
import { buildConsentPolicyAnchor } from "../src/policy.js";
import { decideProtectedAction } from "../src/protected-action.js";
import { buildExternalRegistryAnchor, buildExternalRegistrySubject, verifyExternalRegistryAnchor } from "../src/registry.js";
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
  purpose: "externally anchored governance witnessed signed delegated checkout"
};

const policyDocument = {
  policyId: "policy-agent-passport-demo-v0.1",
  statement: "Demo external audit registry anchor policy; no raw PII; no money movement."
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
  nonce: "human-consent-nonce-registry-001",
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

const subject = buildExternalRegistrySubject({ policy, grant: signedGrant, governanceWitness: witness, request });
const anchor = buildExternalRegistryAnchor({
  registryId: "t3n-audit-registry-demo-1",
  registryKind: "terminal3-testnet-audit",
  registryUrl: "https://cn-api.sg.testnet.t3n.terminal3.io",
  registryRecordId: "batch-1:event-1",
  registryRecordHash: "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  observedAt: "2026-06-15T00:00:50.000Z",
  expiresAt: "2026-06-15T00:15:00.000Z",
  subject,
  evidence: {
    t3nStatus: "live-audited",
    auditEventCommitted: true,
    auditEventId: "batch-1:event-1",
    auditEventHash: "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
  }
});

describe("external audit registry anchor gate", () => {
  it("builds a committed Terminal 3 registry anchor over policy, signed grant, governance witness, and request scope", () => {
    expect(subject.subjectHash).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(subject.policyHash).toBe(policy.policyHash);
    expect(subject.grantHash).toBe(signedGrant.grantHash);
    expect(subject.governanceWitnessAttestationHash).toBe(witness.attestationHash);
    expect(anchor.anchorHash).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(anchor.registryRecordHash).toBe(anchor.evidence.auditEventHash);
    expect(verifyExternalRegistryAnchor(anchor, { policy, grant: signedGrant, governanceWitness: witness, request })).toBe(true);
  });

  it("rejects non-live-audited or uncommitted registry evidence", () => {
    expect(() => buildExternalRegistryAnchor({
      ...anchor,
      evidence: { ...anchor.evidence, t3nStatus: "live-submitted" }
    })).toThrow(/live-audited/i);

    expect(() => buildExternalRegistryAnchor({
      ...anchor,
      evidence: { ...anchor.evidence, auditEventCommitted: false }
    })).toThrow(/committed/i);
  });

  it("refuses before payload when an external registry anchor is required but missing", () => {
    const decision = decideProtectedAction(passport, request, {
      now: "2026-06-15T00:01:00.000Z",
      requestId: "req_missing_registry_anchor",
      requireDelegationGrant: true,
      requireSignedDelegationGrant: true,
      delegationGrant: signedGrant,
      requireConsentPolicyAnchor: true,
      consentPolicyAnchor: policy,
      requireGovernanceWitness: true,
      governanceWitness: witness,
      requireExternalRegistryAnchor: true
    });

    expect(decision.allowed).toBe(false);
    expect(decision.reason).toMatch(/external registry anchor/i);
    expect(decision.t3nExecutePayload).toBeUndefined();
  });

  it("refuses a request-mismatched external registry anchor before payload", () => {
    const mismatchedSubject = buildExternalRegistrySubject({
      policy,
      grant: signedGrant,
      governanceWitness: witness,
      request: { ...request, amountCents: 49999 }
    });
    const mismatchedAnchor = buildExternalRegistryAnchor({
      ...anchor,
      registryId: "t3n-audit-registry-demo-mismatch",
      subjectHash: mismatchedSubject.subjectHash,
      subject: mismatchedSubject
    });

    const decision = decideProtectedAction(passport, request, {
      now: "2026-06-15T00:01:00.000Z",
      requestId: "req_mismatched_registry_anchor",
      requireDelegationGrant: true,
      requireSignedDelegationGrant: true,
      delegationGrant: signedGrant,
      requireConsentPolicyAnchor: true,
      consentPolicyAnchor: policy,
      requireGovernanceWitness: true,
      governanceWitness: witness,
      requireExternalRegistryAnchor: true,
      externalRegistryAnchor: mismatchedAnchor
    });

    expect(decision.allowed).toBe(false);
    expect(decision.reason).toMatch(/does not match external registry subject/i);
    expect(decision.t3nExecutePayload).toBeUndefined();
  });

  it("allows only when grant, policy, witness, and external registry anchor all match and binds anchor hashes into receipts", () => {
    const decision = decideProtectedAction(passport, request, {
      now: "2026-06-15T00:01:00.000Z",
      requestId: "req_registry_anchor_allowed",
      requireDelegationGrant: true,
      requireSignedDelegationGrant: true,
      delegationGrant: signedGrant,
      requireConsentPolicyAnchor: true,
      consentPolicyAnchor: policy,
      requireGovernanceWitness: true,
      governanceWitness: witness,
      requireExternalRegistryAnchor: true,
      externalRegistryAnchor: anchor
    });

    expect(decision.allowed).toBe(true);
    if (!decision.allowed) {
      throw new Error(decision.reason);
    }
    expect(decision.externalRegistryAnchorHash).toBe(anchor.anchorHash);
    expect(decision.t3nExecutePayload.input).toMatchObject({
      external_registry_id: anchor.registryId,
      external_registry_anchor_hash: anchor.anchorHash,
      external_registry_record_hash: anchor.registryRecordHash
    });

    const receipt = buildActionReceipt({
      passport,
      request,
      decision,
      t3n: {
        environment: "testnet",
        nodeUrl: "external-registry-anchor-demo",
        status: "dry-run-no-api-key"
      },
      issuedAt: "2026-06-15T00:01:02.000Z"
    });

    expect(receipt.evidence.externalRegistry).toEqual({
      registryId: anchor.registryId,
      registryKind: anchor.registryKind,
      registryUrl: anchor.registryUrl,
      registryRecordId: anchor.registryRecordId,
      registryRecordHash: anchor.registryRecordHash,
      subjectHash: anchor.subjectHash,
      anchorHash: anchor.anchorHash
    });
    expect(JSON.stringify(receipt)).not.toContain("PRIVATE KEY");
    expect(JSON.stringify(receipt)).not.toContain("@example.com");
  });
});

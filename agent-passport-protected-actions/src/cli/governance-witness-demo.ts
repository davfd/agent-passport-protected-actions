import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildConsentChallenge, buildSignedDelegationGrant, generateConsentKeyPair, signConsentChallenge } from "../consent.js";
import { buildGovernanceWitnessAttestation, generateGovernanceWitnessKeyPair, verifyGovernanceWitnessAttestation, buildGovernanceWitnessChallenge } from "../governance.js";
import { sha256Urn } from "../hash.js";
import { buildAgentPassport } from "../passport.js";
import { buildConsentPolicyAnchor } from "../policy.js";
import { decideProtectedAction } from "../protected-action.js";
import { buildActionReceipt } from "../receipt.js";

function sha256Hex(bytes: string | Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}

const startedAt = new Date();
const stamp = startedAt.toISOString().replace(/[-:.]/g, "").replace("T", "t").replace("Z", "z");
const outDir = "receipts";
const logDir = "logs";
mkdirSync(outDir, { recursive: true });
mkdirSync(logDir, { recursive: true });

const policySourcePath = "policies/agent-passport-consent-policy-v0.1.json";
const policySourceBytes = readFileSync(policySourcePath);
const policySource = JSON.parse(policySourceBytes.toString("utf8")) as {
  policyId: string;
  version: string;
  scope: {
    allowedActions: string[];
    allowedTargets: string[];
    maxAmountCents: number;
    currency: string;
    piiMode: "placeholder-only";
  };
  requirements: {
    requiresSignedConsent: boolean;
    requiresAudit: boolean;
  };
};

const passport = buildAgentPassport({
  agentName: "leonardo-protected-action-agent",
  agentDid: process.env.T3N_AGENT_DID ?? "did:t3n:5c946503c2d9924f58ee273dbd2efba8d03a12df",
  issuer: process.env.T3N_ISSUER_DID ?? "did:t3n:5c946503c2d9924f58ee273dbd2efba8d03a12df",
  issuedAt: startedAt.toISOString(),
  expiresAt: new Date(startedAt.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  authority: policySource.scope
});

const policy = buildConsentPolicyAnchor({
  policyId: policySource.policyId,
  version: policySource.version,
  sourceUri: `file://${policySourcePath}`,
  sourceHash: sha256Urn(policySourceBytes),
  issuedAt: startedAt.toISOString(),
  effectiveAt: startedAt.toISOString(),
  expiresAt: new Date(startedAt.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  issuerDids: [passport.issuer.did],
  authority: policySource.scope,
  requiresSignedConsent: policySource.requirements.requiresSignedConsent,
  requiresAudit: policySource.requirements.requiresAudit
});

const request = {
  action: "payment.intent.create",
  target: "stripe-test-merchant",
  amountCents: 42500,
  currency: "USD",
  piiRefs: ["{{profile.email}}", "{{profile.payment_method}}"],
  purpose: "governance witnessed policy anchored signed delegated-consent demo; no raw PII, no money movement"
};

const grantInput = {
  humanRefHash: sha256Urn("demo-human-opaque-ref:governance-witness"),
  issuerDid: passport.issuer.did,
  agentDid: passport.agent.did,
  issuedAt: startedAt.toISOString(),
  expiresAt: new Date(startedAt.getTime() + 10 * 60 * 1000).toISOString(),
  nonce: `governance-witness-${stamp}`,
  evidenceHash: sha256Urn(`governance witnessed signed consent: ${policy.policyHash}`),
  authority: policySource.scope
};

const consentChallenge = buildConsentChallenge(grantInput, { issuedAt: grantInput.issuedAt });
const consentKeys = generateConsentKeyPair();
const signedConsent = signConsentChallenge(consentChallenge, consentKeys.privateKeyPem, consentKeys.publicKeyPem, new Date().toISOString());
const grant = buildSignedDelegationGrant(grantInput, signedConsent);
const witnessKeys = generateGovernanceWitnessKeyPair();
const witness = buildGovernanceWitnessAttestation({
  witnessId: "witness-local-governance-demo-1",
  witnessRole: "policy-governance-witness",
  issuedAt: startedAt.toISOString(),
  expiresAt: new Date(startedAt.getTime() + 10 * 60 * 1000).toISOString(),
  policy,
  grant,
  request,
  privateKeyPem: witnessKeys.privateKeyPem,
  publicKeyPem: witnessKeys.publicKeyPem
});
const witnessChallenge = buildGovernanceWitnessChallenge({
  witnessId: witness.witnessId,
  witnessRole: witness.witnessRole,
  issuedAt: witness.issuedAt,
  expiresAt: witness.expiresAt,
  policy,
  grant,
  request
});
const witnessVerified = verifyGovernanceWitnessAttestation(witnessChallenge, witness);
if (!witnessVerified) {
  throw new Error("governance witness failed verification immediately after signing");
}

const missingWitnessDecision = decideProtectedAction(passport, request, {
  now: new Date().toISOString(),
  requestId: `req-witness-missing-${stamp}`,
  requireDelegationGrant: true,
  requireSignedDelegationGrant: true,
  delegationGrant: grant,
  requireConsentPolicyAnchor: true,
  consentPolicyAnchor: policy,
  requireGovernanceWitness: true,
  trustedIssuerDids: [passport.issuer.did]
});
const missingWitnessReceipt = buildActionReceipt({
  passport,
  request,
  decision: missingWitnessDecision,
  t3n: {
    environment: "testnet",
    nodeUrl: "not-submitted-governance-witness-local-demo",
    status: "dry-run-no-api-key"
  },
  issuedAt: new Date().toISOString()
});
const refusedPath = join(outDir, `demo_governance_witness_missing-${stamp}-refused.json`);
writeFileSync(refusedPath, `${JSON.stringify(missingWitnessReceipt, null, 2)}\n`);

const decision = decideProtectedAction(passport, request, {
  now: new Date().toISOString(),
  requestId: `req-governance-witness-${stamp}`,
  requireDelegationGrant: true,
  requireSignedDelegationGrant: true,
  delegationGrant: grant,
  requireConsentPolicyAnchor: true,
  consentPolicyAnchor: policy,
  requireGovernanceWitness: true,
  governanceWitness: witness,
  trustedIssuerDids: [passport.issuer.did]
});
const receipt = buildActionReceipt({
  passport,
  request,
  decision,
  t3n: {
    environment: "testnet",
    nodeUrl: "not-submitted-governance-witness-local-demo",
    status: "dry-run-no-api-key"
  },
  issuedAt: new Date().toISOString()
});
const receiptSuffix = decision.allowed ? "allowed" : "refused";
const receiptPath = join(outDir, `demo_governance_witness-${stamp}-${receiptSuffix}.json`);
writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);

const publicLog = {
  startedAt: startedAt.toISOString(),
  completedAt: new Date().toISOString(),
  ceremony: "governance witness scaffold local demo",
  privateKeysPersisted: false,
  rawHumanIdentityIncluded: false,
  realExternalGovernanceClaimed: false,
  policy: {
    policyId: policy.policyId,
    version: policy.version,
    policyHash: policy.policyHash,
    sourceUri: policy.source.sourceUri,
    sourceHash: policy.source.sourceHash
  },
  witness: {
    witnessId: witness.witnessId,
    witnessRole: witness.witnessRole,
    attestationHash: witness.attestationHash,
    challengeHash: witness.challengeHash,
    signatureHash: witness.signatureHash,
    publicKeyFingerprint: witness.publicKeyFingerprint,
    witnessVerified
  },
  negativeControl: {
    requestId: missingWitnessDecision.requestId,
    allowed: missingWitnessDecision.allowed,
    reason: missingWitnessDecision.reason,
    receiptPath: refusedPath,
    wholeFileSha256: sha256Hex(readFileSync(refusedPath)),
    receiptHash: missingWitnessReceipt.receiptHash
  },
  positiveControl: {
    requestId: decision.requestId,
    allowed: decision.allowed,
    reason: decision.reason,
    receiptPath,
    wholeFileSha256: sha256Hex(readFileSync(receiptPath)),
    receiptHash: receipt.receiptHash,
    policy: receipt.evidence.policy,
    governanceWitness: receipt.evidence.governanceWitness,
    delegation: receipt.evidence.delegation
  }
};
const logPath = join(logDir, `governance-witness-ceremony-${stamp}.json`);
writeFileSync(logPath, `${JSON.stringify(publicLog, null, 2)}\n`);

console.log(JSON.stringify({
  ok: decision.allowed && !missingWitnessDecision.allowed && witnessVerified,
  logPath,
  policy: publicLog.policy,
  witness: publicLog.witness,
  negativeControl: publicLog.negativeControl,
  positiveControl: publicLog.positiveControl,
  privateKeysPersisted: false,
  rawHumanIdentityIncluded: false,
  realExternalGovernanceClaimed: false
}, null, 2));

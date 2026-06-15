import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildConsentChallenge, buildSignedDelegationGrant, generateConsentKeyPair, signConsentChallenge, verifyConsentSignature } from "../consent.js";
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
  claimBoundary?: {
    proves?: string;
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

const grantInput = {
  humanRefHash: sha256Urn("demo-human-opaque-ref:policy-anchor"),
  issuerDid: passport.issuer.did,
  agentDid: passport.agent.did,
  issuedAt: startedAt.toISOString(),
  expiresAt: new Date(startedAt.getTime() + 10 * 60 * 1000).toISOString(),
  nonce: `policy-anchor-${stamp}`,
  evidenceHash: sha256Urn(`policy anchored signed consent: ${policy.policyHash}`),
  authority: policySource.scope
};

const challenge = buildConsentChallenge(grantInput, { issuedAt: grantInput.issuedAt });
const keyPair = generateConsentKeyPair();
const signed = signConsentChallenge(challenge, keyPair.privateKeyPem, keyPair.publicKeyPem, new Date().toISOString());
const signatureVerified = verifyConsentSignature(challenge, signed);
if (!signatureVerified) {
  throw new Error("policy-anchor signature failed verification immediately after signing");
}
const grant = buildSignedDelegationGrant(grantInput, signed);

const request = {
  action: "payment.intent.create",
  target: "stripe-test-merchant",
  amountCents: 42500,
  currency: "USD",
  piiRefs: ["{{profile.email}}", "{{profile.payment_method}}"],
  purpose: "policy anchored signed delegated-consent demo; no raw PII, no money movement"
};

const missingPolicyDecision = decideProtectedAction(passport, request, {
  now: new Date().toISOString(),
  requestId: `req-policy-missing-${stamp}`,
  requireDelegationGrant: true,
  requireSignedDelegationGrant: true,
  delegationGrant: grant,
  requireConsentPolicyAnchor: true,
  trustedIssuerDids: [passport.issuer.did]
});
const missingPolicyReceipt = buildActionReceipt({
  passport,
  request,
  decision: missingPolicyDecision,
  t3n: {
    environment: "testnet",
    nodeUrl: "not-submitted-policy-anchor-local-demo",
    status: "dry-run-no-api-key"
  },
  issuedAt: new Date().toISOString()
});
const refusedPath = join(outDir, `demo_policy_anchor_missing-${stamp}-refused.json`);
writeFileSync(refusedPath, `${JSON.stringify(missingPolicyReceipt, null, 2)}\n`);

const decision = decideProtectedAction(passport, request, {
  now: new Date().toISOString(),
  requestId: `req-policy-anchor-${stamp}`,
  requireDelegationGrant: true,
  requireSignedDelegationGrant: true,
  delegationGrant: grant,
  requireConsentPolicyAnchor: true,
  consentPolicyAnchor: policy,
  trustedIssuerDids: [passport.issuer.did]
});
const receipt = buildActionReceipt({
  passport,
  request,
  decision,
  t3n: {
    environment: "testnet",
    nodeUrl: "not-submitted-policy-anchor-local-demo",
    status: "dry-run-no-api-key"
  },
  issuedAt: new Date().toISOString()
});
const receiptSuffix = decision.allowed ? "allowed" : "refused";
const receiptPath = join(outDir, `demo_policy_anchor-${stamp}-${receiptSuffix}.json`);
writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);

const publicLog = {
  startedAt: startedAt.toISOString(),
  completedAt: new Date().toISOString(),
  ceremony: "consent policy source-of-truth anchor local demo",
  privateKeyPersisted: false,
  rawHumanIdentityIncluded: false,
  rawPolicyTextInReceipt: JSON.stringify(receipt).includes(policySource.claimBoundary?.proves ?? "impossible-string"),
  policy: {
    policyId: policy.policyId,
    version: policy.version,
    policyHash: policy.policyHash,
    sourceUri: policy.source.sourceUri,
    sourceHash: policy.source.sourceHash,
    requiresSignedConsent: policy.requiresSignedConsent,
    requiresAudit: policy.requiresAudit
  },
  negativeControl: {
    requestId: missingPolicyDecision.requestId,
    allowed: missingPolicyDecision.allowed,
    reason: missingPolicyDecision.reason,
    receiptPath: refusedPath,
    wholeFileSha256: sha256Hex(readFileSync(refusedPath)),
    receiptHash: missingPolicyReceipt.receiptHash
  },
  positiveControl: {
    requestId: decision.requestId,
    allowed: decision.allowed,
    reason: decision.reason,
    receiptPath,
    wholeFileSha256: sha256Hex(readFileSync(receiptPath)),
    receiptHash: receipt.receiptHash,
    policy: receipt.evidence.policy,
    delegation: receipt.evidence.delegation
  },
  signature: {
    challengeHash: signed.challengeHash,
    signatureHash: signed.signatureHash,
    publicKeyFingerprint: signed.publicKeyFingerprint,
    signatureVerified
  }
};
const logPath = join(logDir, `policy-anchor-ceremony-${stamp}.json`);
writeFileSync(logPath, `${JSON.stringify(publicLog, null, 2)}\n`);

console.log(JSON.stringify({
  ok: decision.allowed && !missingPolicyDecision.allowed,
  logPath,
  policy: publicLog.policy,
  negativeControl: publicLog.negativeControl,
  positiveControl: publicLog.positiveControl,
  signature: publicLog.signature,
  privateKeyPersisted: false,
  rawHumanIdentityIncluded: false,
  rawPolicyTextInReceipt: publicLog.rawPolicyTextInReceipt
}, null, 2));

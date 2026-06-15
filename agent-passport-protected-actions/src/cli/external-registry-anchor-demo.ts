import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { buildConsentChallenge, buildSignedDelegationGrant, generateConsentKeyPair, signConsentChallenge } from "../consent.js";
import { buildGovernanceWitnessAttestation, generateGovernanceWitnessKeyPair } from "../governance.js";
import { sha256Urn } from "../hash.js";
import { buildAgentPassport } from "../passport.js";
import { buildConsentPolicyAnchor } from "../policy.js";
import { decideProtectedAction } from "../protected-action.js";
import { buildExternalRegistryAnchor, buildExternalRegistrySubject } from "../registry.js";
import { buildActionReceipt, type ActionReceipt } from "../receipt.js";

function sha256Hex(bytes: string | Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function latestLiveAuditedReceiptPath(): string {
  const receiptsDir = "receipts";
  if (!existsSync(receiptsDir)) {
    throw new Error("receipts directory does not exist; run a live registry audit probe first");
  }
  const candidates = readdirSync(receiptsDir)
    .filter((name) => name.startsWith("live_audit_probe-") && name.endsWith("-live-audited.json"))
    .map((name) => join(receiptsDir, name))
    .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs);
  if (candidates.length === 0) {
    throw new Error("no live_audit_probe-*-live-audited.json receipt found; run pnpm t3n:audit-probe first");
  }
  return candidates[0];
}

function loadRegistryReceipt(path: string): ActionReceipt {
  const receipt = JSON.parse(readFileSync(path, "utf8")) as ActionReceipt;
  if (receipt.evidence.t3n.status !== "live-audited") {
    throw new Error(`registry receipt ${path} is ${receipt.evidence.t3n.status}, not live-audited`);
  }
  if (!receipt.evidence.t3n.auditEventId || !receipt.evidence.t3n.auditEventHash || receipt.evidence.t3n.auditEventCommitted !== true) {
    throw new Error(`registry receipt ${path} lacks committed audit event binding`);
  }
  return receipt;
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
  purpose: "external audit registry anchored policy + governance witness demo; no raw PII, no money movement"
};

const grantInput = {
  humanRefHash: sha256Urn("demo-human-opaque-ref:external-registry-anchor"),
  issuerDid: passport.issuer.did,
  agentDid: passport.agent.did,
  issuedAt: startedAt.toISOString(),
  expiresAt: new Date(startedAt.getTime() + 10 * 60 * 1000).toISOString(),
  nonce: `external-registry-anchor-${stamp}`,
  evidenceHash: sha256Urn(`external registry anchored signed consent: ${policy.policyHash}`),
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

const subject = buildExternalRegistrySubject({ policy, grant, governanceWitness: witness, request });
const registryReceiptPath = process.env.T3N_REGISTRY_RECEIPT ?? latestLiveAuditedReceiptPath();
const registryReceipt = loadRegistryReceipt(registryReceiptPath);
const anchor = buildExternalRegistryAnchor({
  registryId: `t3n-audit:${basename(registryReceiptPath).replace(/\.json$/, "")}`,
  registryKind: "terminal3-testnet-audit",
  registryUrl: registryReceipt.evidence.t3n.nodeUrl,
  registryRecordId: registryReceipt.evidence.t3n.auditEventId ?? "",
  registryRecordHash: registryReceipt.evidence.t3n.auditEventHash ?? "",
  observedAt: startedAt.toISOString(),
  expiresAt: new Date(startedAt.getTime() + 10 * 60 * 1000).toISOString(),
  subject,
  evidence: {
    t3nStatus: registryReceipt.evidence.t3n.status,
    auditEventCommitted: registryReceipt.evidence.t3n.auditEventCommitted === true,
    auditEventId: registryReceipt.evidence.t3n.auditEventId ?? "",
    auditEventHash: registryReceipt.evidence.t3n.auditEventHash ?? ""
  }
});

const missingAnchorDecision = decideProtectedAction(passport, request, {
  now: new Date().toISOString(),
  requestId: `req-registry-missing-${stamp}`,
  requireDelegationGrant: true,
  requireSignedDelegationGrant: true,
  delegationGrant: grant,
  requireConsentPolicyAnchor: true,
  consentPolicyAnchor: policy,
  requireGovernanceWitness: true,
  governanceWitness: witness,
  requireExternalRegistryAnchor: true,
  trustedIssuerDids: [passport.issuer.did]
});
const missingAnchorReceipt = buildActionReceipt({
  passport,
  request,
  decision: missingAnchorDecision,
  t3n: {
    environment: "testnet",
    nodeUrl: "not-submitted-external-registry-anchor-demo",
    status: "dry-run-no-api-key"
  },
  issuedAt: new Date().toISOString()
});
const refusedPath = join(outDir, `demo_external_registry_missing-${stamp}-refused.json`);
writeFileSync(refusedPath, `${JSON.stringify(missingAnchorReceipt, null, 2)}\n`);

const decision = decideProtectedAction(passport, request, {
  now: new Date().toISOString(),
  requestId: `req-external-registry-${stamp}`,
  requireDelegationGrant: true,
  requireSignedDelegationGrant: true,
  delegationGrant: grant,
  requireConsentPolicyAnchor: true,
  consentPolicyAnchor: policy,
  requireGovernanceWitness: true,
  governanceWitness: witness,
  requireExternalRegistryAnchor: true,
  externalRegistryAnchor: anchor,
  trustedIssuerDids: [passport.issuer.did]
});
const receipt = buildActionReceipt({
  passport,
  request,
  decision,
  t3n: {
    environment: "testnet",
    nodeUrl: "not-submitted-external-registry-anchor-demo",
    status: "dry-run-no-api-key"
  },
  issuedAt: new Date().toISOString()
});
const receiptSuffix = decision.allowed ? "allowed" : "refused";
const receiptPath = join(outDir, `demo_external_registry_anchor-${stamp}-${receiptSuffix}.json`);
writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);

const publicLog = {
  startedAt: startedAt.toISOString(),
  completedAt: new Date().toISOString(),
  ceremony: "external audit registry anchor demo",
  privateKeysPersisted: false,
  rawHumanIdentityIncluded: false,
  realExternalGovernanceClaimed: false,
  externalRegistryRecordLiveAudited: true,
  registryReceipt: {
    path: registryReceiptPath,
    wholeFileSha256: sha256Hex(readFileSync(registryReceiptPath)),
    receiptHash: registryReceipt.receiptHash,
    t3n: registryReceipt.evidence.t3n
  },
  subject: {
    subjectHash: subject.subjectHash,
    policyHash: subject.policyHash,
    grantHash: subject.grantHash,
    governanceWitnessAttestationHash: subject.governanceWitnessAttestationHash,
    requestHash: subject.requestHash
  },
  anchor: {
    registryId: anchor.registryId,
    registryKind: anchor.registryKind,
    registryUrl: anchor.registryUrl,
    registryRecordId: anchor.registryRecordId,
    registryRecordHash: anchor.registryRecordHash,
    subjectHash: anchor.subjectHash,
    anchorHash: anchor.anchorHash
  },
  negativeControl: {
    requestId: missingAnchorDecision.requestId,
    allowed: missingAnchorDecision.allowed,
    reason: missingAnchorDecision.reason,
    receiptPath: refusedPath,
    wholeFileSha256: sha256Hex(readFileSync(refusedPath)),
    receiptHash: missingAnchorReceipt.receiptHash
  },
  positiveControl: {
    requestId: decision.requestId,
    allowed: decision.allowed,
    reason: decision.reason,
    receiptPath,
    wholeFileSha256: sha256Hex(readFileSync(receiptPath)),
    receiptHash: receipt.receiptHash,
    externalRegistry: receipt.evidence.externalRegistry,
    governanceWitness: receipt.evidence.governanceWitness,
    policy: receipt.evidence.policy,
    delegation: receipt.evidence.delegation
  }
};
const logPath = join(logDir, `external-registry-anchor-${stamp}.json`);
writeFileSync(logPath, `${JSON.stringify(publicLog, null, 2)}\n`);

console.log(JSON.stringify({
  ok: decision.allowed && !missingAnchorDecision.allowed,
  logPath,
  registryReceipt: publicLog.registryReceipt,
  subject: publicLog.subject,
  anchor: publicLog.anchor,
  negativeControl: publicLog.negativeControl,
  positiveControl: publicLog.positiveControl,
  privateKeysPersisted: false,
  rawHumanIdentityIncluded: false,
  realExternalGovernanceClaimed: false,
  externalRegistryRecordLiveAudited: true
}, null, 2));

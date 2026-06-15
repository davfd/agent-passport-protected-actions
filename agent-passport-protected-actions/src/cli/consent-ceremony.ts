import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildConsentChallenge, buildSignedDelegationGrant, generateConsentKeyPair, signConsentChallenge, verifyConsentSignature } from "../consent.js";
import { sha256Urn } from "../hash.js";
import { buildAgentPassport } from "../passport.js";
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

const passport = buildAgentPassport({
  agentName: "leonardo-protected-action-agent",
  agentDid: process.env.T3N_AGENT_DID ?? "did:t3n:5c946503c2d9924f58ee273dbd2efba8d03a12df",
  issuer: process.env.T3N_ISSUER_DID ?? "did:t3n:5c946503c2d9924f58ee273dbd2efba8d03a12df",
  issuedAt: startedAt.toISOString(),
  expiresAt: new Date(startedAt.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  authority: {
    allowedActions: ["payment.intent.create"],
    allowedTargets: ["stripe-test-merchant"],
    maxAmountCents: 50000,
    currency: "USD",
    piiMode: "placeholder-only"
  }
});

const grantInput = {
  humanRefHash: sha256Urn("demo-human-opaque-ref:signed-ceremony"),
  issuerDid: passport.issuer.did,
  agentDid: passport.agent.did,
  issuedAt: startedAt.toISOString(),
  expiresAt: new Date(startedAt.getTime() + 10 * 60 * 1000).toISOString(),
  nonce: `signed-consent-${stamp}`,
  evidenceHash: sha256Urn("signed consent ceremony: payment.intent.create stripe-test-merchant cap=50000 pii=placeholder-only"),
  authority: {
    allowedActions: ["payment.intent.create"],
    allowedTargets: ["stripe-test-merchant"],
    maxAmountCents: 50000,
    currency: "USD",
    piiMode: "placeholder-only" as const
  }
};

const challenge = buildConsentChallenge(grantInput, { issuedAt: grantInput.issuedAt });
const keyPair = generateConsentKeyPair();
const signed = signConsentChallenge(challenge, keyPair.privateKeyPem, keyPair.publicKeyPem, new Date().toISOString());
const signatureVerified = verifyConsentSignature(challenge, signed);
if (!signatureVerified) {
  throw new Error("signed consent proof failed verification immediately after signing");
}
const grant = buildSignedDelegationGrant(grantInput, signed);

const request = {
  action: "payment.intent.create",
  target: "stripe-test-merchant",
  amountCents: 42500,
  currency: "USD",
  piiRefs: ["{{profile.email}}", "{{profile.payment_method}}"],
  purpose: "signed delegated-consent ceremony demo; no raw PII, no money movement"
};
const decision = decideProtectedAction(passport, request, {
  now: new Date().toISOString(),
  requestId: `req-signed-consent-${stamp}`,
  requireDelegationGrant: true,
  requireSignedDelegationGrant: true,
  delegationGrant: grant,
  trustedIssuerDids: [passport.issuer.did]
});

const receipt = buildActionReceipt({
  passport,
  request,
  decision,
  t3n: {
    environment: "testnet",
    nodeUrl: "not-submitted-to-t3n-signed-consent-local-ceremony",
    status: "dry-run-no-api-key"
  },
  issuedAt: new Date().toISOString()
});
const receiptSuffix = decision.allowed ? "allowed" : "refused";
const receiptPath = join(outDir, `demo_signed_delegation-${stamp}-${receiptSuffix}.json`);
writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);
const receiptWholeFileSha256 = sha256Hex(readFileSync(receiptPath));

const publicLog = {
  startedAt: startedAt.toISOString(),
  completedAt: new Date().toISOString(),
  ceremony: "signed delegated-consent local ceremony",
  status: decision.allowed ? "signed-delegation-accepted" : "signed-delegation-refused",
  privateKeyPersisted: false,
  rawHumanIdentityIncluded: false,
  challenge: {
    challengeHash: challenge.challengeHash,
    statement: challenge.statement,
    humanRefHash: challenge.grant.humanRefHash,
    evidenceHash: challenge.grant.evidenceHash,
    nonce: challenge.grant.nonce,
    authority: challenge.grant.authority
  },
  signature: {
    algorithm: signed.algorithm,
    signedAt: signed.signedAt,
    challengeHash: signed.challengeHash,
    publicKeyFingerprint: signed.publicKeyFingerprint,
    signatureHash: signed.signatureHash,
    signatureVerified
  },
  grant: {
    grantId: grant.grantId,
    grantHash: grant.grantHash,
    consentProof: grant.consentProof
  },
  decision: {
    allowed: decision.allowed,
    reason: decision.reason,
    requestId: decision.requestId
  },
  receipt: {
    path: receiptPath,
    status: receipt.evidence.t3n.status,
    receiptHash: receipt.receiptHash,
    wholeFileSha256: receiptWholeFileSha256,
    delegation: receipt.evidence.delegation
  }
};
const logPath = join(logDir, `signed-consent-ceremony-${stamp}.json`);
writeFileSync(logPath, `${JSON.stringify(publicLog, null, 2)}\n`);

console.log(JSON.stringify({
  ok: decision.allowed,
  logPath,
  receipt: publicLog.receipt,
  signature: publicLog.signature,
  privateKeyPersisted: false,
  rawHumanIdentityIncluded: false
}, null, 2));

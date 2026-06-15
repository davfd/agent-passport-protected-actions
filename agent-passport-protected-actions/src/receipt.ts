import type { AgentPassport } from "./passport.js";
import type { ProtectedActionDecision, ProtectedActionRequest } from "./protected-action.js";
import { sha256Hex, sha256Urn, stableStringify } from "./hash.js";

export interface T3nEvidence {
  environment: string;
  nodeUrl: string;
  status: "dry-run-no-api-key" | "live-authenticated-only" | "live-submitted" | "live-failed" | "live-audited";
  did?: string;
  auditEventId?: string;
  auditBatchKey?: string;
  auditEventHash?: string;
  auditEventCommitted?: boolean;
  responseHash?: string;
  error?: string;
}

export interface BuildActionReceiptInput {
  passport: AgentPassport;
  request: ProtectedActionRequest;
  decision: ProtectedActionDecision;
  t3n: T3nEvidence;
  issuedAt: string;
}

export interface ActionReceipt {
  schema: "leonardo.t3n.action-receipt.v0.1";
  issuedAt: string;
  agent: AgentPassport["agent"];
  passportId: string;
  authority: AgentPassport["authority"];
  request: {
    action: string;
    target: string;
    amountCents: number;
    currency: string;
    purpose: string;
    piiRefHashes: string[];
  };
  decision: {
    allowed: boolean;
    reason: string;
    requestId: string;
    decidedAt: string;
  };
  evidence: {
    t3n: T3nEvidence;
    executePayloadHash?: string;
    delegation?: {
      grantId: string;
      grantHash: string;
      humanRefHash: string;
      evidenceHash: string;
      nonceHash: string;
      consentChallengeHash?: string;
      consentSignatureHash?: string;
      publicKeyFingerprint?: string;
    };
    policy?: {
      policyId: string;
      policyHash: string;
      version: string;
      sourceUri: string;
      sourceHash: string;
      requiresSignedConsent: boolean;
      requiresAudit: boolean;
    };
    governanceWitness?: {
      witnessId: string;
      witnessRole: string;
      attestationHash: string;
      signatureHash: string;
      publicKeyFingerprint: string;
      challengeHash: string;
    };
    externalRegistry?: {
      registryId: string;
      registryKind: string;
      registryUrl: string;
      registryRecordId: string;
      registryRecordHash: string;
      subjectHash: string;
      anchorHash: string;
    };
  };
  receiptHash: string;
}

export function buildActionReceipt(input: BuildActionReceiptInput): ActionReceipt {
  if (input.t3n.status === "live-audited" && !input.t3n.auditEventId) {
    throw new Error("live-audited receipts require t3n.auditEventId");
  }

  const body = {
    schema: "leonardo.t3n.action-receipt.v0.1" as const,
    issuedAt: new Date(input.issuedAt).toISOString(),
    agent: input.passport.agent,
    passportId: input.passport.passportId,
    authority: input.passport.authority,
    request: {
      action: input.request.action,
      target: input.request.target,
      amountCents: input.request.amountCents,
      currency: input.request.currency.toUpperCase(),
      purpose: input.request.purpose,
      piiRefHashes: input.request.piiRefs.map((ref) => sha256Urn(ref))
    },
    decision: {
      allowed: input.decision.allowed,
      reason: input.decision.reason,
      requestId: input.decision.requestId,
      decidedAt: input.decision.decidedAt
    },
    evidence: {
      t3n: input.t3n,
      executePayloadHash: input.decision.allowed
        ? sha256Urn(input.decision.t3nExecutePayload)
        : undefined,
      delegation: input.decision.allowed && input.decision.delegationGrantId
        ? {
            grantId: input.decision.delegationGrantId,
            grantHash: input.decision.delegationGrantHash ?? "",
            humanRefHash: input.decision.delegationHumanRefHash ?? "",
            evidenceHash: input.decision.delegationEvidenceHash ?? "",
            nonceHash: input.decision.delegationNonceHash ?? "",
            consentChallengeHash: input.decision.delegationConsentChallengeHash,
            consentSignatureHash: input.decision.delegationConsentSignatureHash,
            publicKeyFingerprint: input.decision.delegationPublicKeyFingerprint
          }
        : undefined,
      policy: input.decision.allowed && input.decision.consentPolicyId
        ? {
            policyId: input.decision.consentPolicyId,
            policyHash: input.decision.consentPolicyHash ?? "",
            version: input.decision.consentPolicyVersion ?? "",
            sourceUri: input.decision.consentPolicySourceUri ?? "",
            sourceHash: input.decision.consentPolicySourceHash ?? "",
            requiresSignedConsent: input.decision.consentPolicyRequiresSignedConsent ?? false,
            requiresAudit: input.decision.consentPolicyRequiresAudit ?? false
          }
        : undefined,
      governanceWitness: input.decision.allowed && input.decision.governanceWitnessId
        ? {
            witnessId: input.decision.governanceWitnessId,
            witnessRole: input.decision.governanceWitnessRole ?? "",
            attestationHash: input.decision.governanceWitnessAttestationHash ?? "",
            signatureHash: input.decision.governanceWitnessSignatureHash ?? "",
            publicKeyFingerprint: input.decision.governanceWitnessPublicKeyFingerprint ?? "",
            challengeHash: input.decision.governanceWitnessChallengeHash ?? ""
          }
        : undefined,
      externalRegistry: input.decision.allowed && input.decision.externalRegistryId
        ? {
            registryId: input.decision.externalRegistryId,
            registryKind: input.decision.externalRegistryKind ?? "",
            registryUrl: input.decision.externalRegistryUrl ?? "",
            registryRecordId: input.decision.externalRegistryRecordId ?? "",
            registryRecordHash: input.decision.externalRegistryRecordHash ?? "",
            subjectHash: input.decision.externalRegistrySubjectHash ?? "",
            anchorHash: input.decision.externalRegistryAnchorHash ?? ""
          }
        : undefined
    }
  };

  return {
    ...body,
    receiptHash: `sha256:${sha256Hex(stableStringify(body))}`
  };
}

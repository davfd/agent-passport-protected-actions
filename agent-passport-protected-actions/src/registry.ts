import { isSha256Urn } from "./delegation.js";
import type { DelegationGrant } from "./delegation.js";
import type { GovernanceWitnessAttestation } from "./governance.js";
import { governanceWitnessRequestHash } from "./governance.js";
import { sha256Hex, stableStringify } from "./hash.js";
import type { ConsentPolicyAnchor } from "./policy.js";
import type { ProtectedActionRequest } from "./protected-action.js";
import type { T3nEvidence } from "./receipt.js";

export type ExternalRegistryKind = "terminal3-testnet-audit";
export type ExternalRegistryAnchorStatus = "active" | "revoked";

export interface BuildExternalRegistrySubjectInput {
  policy: ConsentPolicyAnchor;
  grant: DelegationGrant;
  governanceWitness: GovernanceWitnessAttestation;
  request: ProtectedActionRequest;
}

export interface ExternalRegistrySubject {
  schema: "leonardo.external-registry-subject.v0.1";
  policyId: string;
  policyHash: string;
  policySourceHash: string;
  grantId: string;
  grantHash: string;
  consentSignatureHash: string;
  governanceWitnessId: string;
  governanceWitnessAttestationHash: string;
  governanceWitnessSignatureHash: string;
  requestHash: string;
  subjectHash: string;
}

export interface ExternalRegistryEvidence {
  t3nStatus: T3nEvidence["status"];
  auditEventCommitted: boolean;
  auditEventId: string;
  auditEventHash: string;
}

export interface BuildExternalRegistryAnchorInput {
  registryId: string;
  registryKind: ExternalRegistryKind;
  registryUrl: string;
  registryRecordId: string;
  registryRecordHash: string;
  observedAt: string;
  expiresAt: string;
  subject: ExternalRegistrySubject;
  evidence: ExternalRegistryEvidence;
  status?: ExternalRegistryAnchorStatus;
}

export interface ExternalRegistryAnchor {
  schema: "leonardo.external-registry-anchor.v0.1";
  registryId: string;
  registryKind: ExternalRegistryKind;
  registryUrl: string;
  registryRecordId: string;
  registryRecordHash: string;
  observedAt: string;
  expiresAt: string;
  subjectHash: string;
  subject: ExternalRegistrySubject;
  evidence: ExternalRegistryEvidence;
  status: ExternalRegistryAnchorStatus;
  anchorHash: string;
}

function normalizeNonEmpty(value: string, field: string): string {
  const normalized = value.trim();
  if (!normalized) {
    throw new Error(`${field} is required`);
  }
  return normalized;
}

function assertIsoRange(observedAt: string, expiresAt: string): { observedAt: string; expiresAt: string } {
  if (Number.isNaN(Date.parse(observedAt)) || Number.isNaN(Date.parse(expiresAt))) {
    throw new Error("external registry observedAt and expiresAt must be ISO-parseable timestamps");
  }
  const normalizedObservedAt = new Date(observedAt).toISOString();
  const normalizedExpiresAt = new Date(expiresAt).toISOString();
  if (new Date(normalizedExpiresAt).getTime() <= new Date(normalizedObservedAt).getTime()) {
    throw new Error("external registry expiresAt must be after observedAt");
  }
  return { observedAt: normalizedObservedAt, expiresAt: normalizedExpiresAt };
}

export function buildExternalRegistrySubject(input: BuildExternalRegistrySubjectInput): ExternalRegistrySubject {
  if (!input.grant.consentProof) {
    throw new Error("external registry subject requires a signed delegation grant");
  }
  const body = {
    schema: "leonardo.external-registry-subject.v0.1" as const,
    policyId: input.policy.policyId,
    policyHash: input.policy.policyHash,
    policySourceHash: input.policy.source.sourceHash,
    grantId: input.grant.grantId,
    grantHash: input.grant.grantHash,
    consentSignatureHash: input.grant.consentProof.signatureHash,
    governanceWitnessId: input.governanceWitness.witnessId,
    governanceWitnessAttestationHash: input.governanceWitness.attestationHash,
    governanceWitnessSignatureHash: input.governanceWitness.signatureHash,
    requestHash: governanceWitnessRequestHash(input.request)
  };
  return {
    ...body,
    subjectHash: `sha256:${sha256Hex(stableStringify(body))}`
  };
}

export function buildExternalRegistryAnchor(input: BuildExternalRegistryAnchorInput | ExternalRegistryAnchor): ExternalRegistryAnchor {
  const registryId = normalizeNonEmpty(input.registryId, "external registryId");
  const registryUrl = normalizeNonEmpty(input.registryUrl, "external registryUrl");
  const registryRecordId = normalizeNonEmpty(input.registryRecordId, "external registryRecordId");
  if (input.registryKind !== "terminal3-testnet-audit") {
    throw new Error(`unsupported external registry kind ${input.registryKind}`);
  }
  if (!isSha256Urn(input.registryRecordHash)) {
    throw new Error("external registryRecordHash must be sha256:<64 hex>");
  }
  if (input.evidence.t3nStatus !== "live-audited") {
    throw new Error("external registry anchor requires live-audited Terminal 3 evidence");
  }
  if (!input.evidence.auditEventCommitted) {
    throw new Error("external registry anchor requires a committed audit event");
  }
  if (!input.evidence.auditEventId || input.evidence.auditEventId !== registryRecordId) {
    throw new Error("external registry auditEventId must match registryRecordId");
  }
  if (!isSha256Urn(input.evidence.auditEventHash)) {
    throw new Error("external registry auditEventHash must be sha256:<64 hex>");
  }
  if (input.evidence.auditEventHash !== input.registryRecordHash) {
    throw new Error("external registry auditEventHash must match registryRecordHash");
  }
  if (!isSha256Urn(input.subject.subjectHash)) {
    throw new Error("external registry subjectHash must be sha256:<64 hex>");
  }
  if ("subjectHash" in input && input.subjectHash !== input.subject.subjectHash) {
    throw new Error("external registry subjectHash must match subject.subjectHash");
  }
  const { observedAt, expiresAt } = assertIsoRange(input.observedAt, input.expiresAt);

  const body = {
    schema: "leonardo.external-registry-anchor.v0.1" as const,
    registryId,
    registryKind: input.registryKind,
    registryUrl,
    registryRecordId,
    registryRecordHash: input.registryRecordHash,
    observedAt,
    expiresAt,
    subjectHash: input.subject.subjectHash,
    subject: input.subject,
    evidence: input.evidence,
    status: input.status ?? "active" as ExternalRegistryAnchorStatus
  };

  return {
    ...body,
    anchorHash: `sha256:${sha256Hex(stableStringify(body))}`
  };
}

export function verifyExternalRegistryAnchor(
  anchor: ExternalRegistryAnchor,
  input: BuildExternalRegistrySubjectInput
): boolean {
  let normalized: ExternalRegistryAnchor;
  try {
    normalized = buildExternalRegistryAnchor(anchor);
  } catch {
    return false;
  }
  if (anchor.anchorHash !== normalized.anchorHash) {
    return false;
  }
  const expectedSubject = buildExternalRegistrySubject(input);
  return anchor.subjectHash === expectedSubject.subjectHash;
}

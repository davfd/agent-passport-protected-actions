import { delegationNonceHash, type DelegationGrant } from "./delegation.js";
import { buildGovernanceWitnessChallenge, governanceWitnessRequestHash, verifyGovernanceWitnessAttestation, type GovernanceWitnessAttestation } from "./governance.js";
import type { AgentPassport } from "./passport.js";
import type { ConsentPolicyAnchor } from "./policy.js";
import { buildExternalRegistrySubject, verifyExternalRegistryAnchor, type ExternalRegistryAnchor } from "./registry.js";

export interface ProtectedActionRequest {
  action: string;
  target: string;
  amountCents: number;
  currency: string;
  piiRefs: string[];
  purpose: string;
  t3n?: {
    scriptName: string;
    scriptVersion: string;
    functionName: string;
    input: Record<string, unknown>;
  };
}

export interface DecisionContext {
  now: string;
  requestId: string;
  trustedIssuerDids?: string[];
  revokedPassportIds?: string[];
  requireDelegationGrant?: boolean;
  requireSignedDelegationGrant?: boolean;
  delegationGrant?: DelegationGrant;
  revokedDelegationGrantIds?: string[];
  usedDelegationNonces?: string[];
  requireConsentPolicyAnchor?: boolean;
  consentPolicyAnchor?: ConsentPolicyAnchor;
  revokedConsentPolicyIds?: string[];
  requireGovernanceWitness?: boolean;
  governanceWitness?: GovernanceWitnessAttestation;
  revokedGovernanceWitnessIds?: string[];
  requireExternalRegistryAnchor?: boolean;
  externalRegistryAnchor?: ExternalRegistryAnchor;
  revokedExternalRegistryAnchorIds?: string[];
}

export interface T3nExecutePayload {
  script_name: string;
  script_version: string;
  function_name: string;
  input: Record<string, unknown>;
}

export type ProtectedActionDecision =
  | {
      allowed: true;
      requestId: string;
      decidedAt: string;
      reason: "in-scope";
      delegationGrantId?: string;
      delegationGrantHash?: string;
      delegationHumanRefHash?: string;
      delegationEvidenceHash?: string;
      delegationNonceHash?: string;
      delegationConsentChallengeHash?: string;
      delegationConsentSignatureHash?: string;
      delegationPublicKeyFingerprint?: string;
      consentPolicyId?: string;
      consentPolicyHash?: string;
      consentPolicyVersion?: string;
      consentPolicySourceUri?: string;
      consentPolicySourceHash?: string;
      consentPolicyRequiresSignedConsent?: boolean;
      consentPolicyRequiresAudit?: boolean;
      governanceWitnessId?: string;
      governanceWitnessRole?: string;
      governanceWitnessAttestationHash?: string;
      governanceWitnessChallengeHash?: string;
      governanceWitnessSignatureHash?: string;
      governanceWitnessPublicKeyFingerprint?: string;
      externalRegistryId?: string;
      externalRegistryKind?: string;
      externalRegistryUrl?: string;
      externalRegistryRecordId?: string;
      externalRegistryRecordHash?: string;
      externalRegistrySubjectHash?: string;
      externalRegistryAnchorHash?: string;
      t3nExecutePayload: T3nExecutePayload;
    }
  | {
      allowed: false;
      requestId: string;
      decidedAt: string;
      reason: string;
      t3nExecutePayload?: undefined;
    };

const PLACEHOLDER_RE = /^\{\{profile\.[a-zA-Z0-9_.-]+\}\}$/;

export function decideProtectedAction(
  passport: AgentPassport,
  request: ProtectedActionRequest,
  context: DecisionContext
): ProtectedActionDecision {
  const decidedAt = new Date(context.now).toISOString();
  const refusal = (reason: string): ProtectedActionDecision => ({
    allowed: false,
    requestId: context.requestId,
    decidedAt,
    reason
  });

  if (new Date(context.now).getTime() > new Date(passport.expiresAt).getTime()) {
    return refusal(`passport expired at ${passport.expiresAt}`);
  }
  if (context.revokedPassportIds?.includes(passport.passportId)) {
    return refusal(`passport ${passport.passportId} is revoked`);
  }
  if (context.trustedIssuerDids && !context.trustedIssuerDids.map((did) => did.toLowerCase()).includes(passport.issuer.did.toLowerCase())) {
    return refusal(`issuer ${passport.issuer.did} is not trusted for this protected action`);
  }
  if (!passport.authority.allowedActions.includes(request.action)) {
    return refusal(`action ${request.action} is outside passport authority`);
  }
  if (!passport.authority.allowedTargets.includes(request.target)) {
    return refusal(`target ${request.target} is outside passport authority`);
  }
  if (!Number.isSafeInteger(request.amountCents) || request.amountCents < 0) {
    return refusal("amountCents must be a non-negative safe integer");
  }
  if (request.amountCents > passport.authority.maxAmountCents) {
    return refusal(`amount ${request.amountCents} exceeds passport cap ${passport.authority.maxAmountCents}`);
  }
  if (request.currency.toUpperCase() !== passport.authority.currency) {
    return refusal(`currency ${request.currency} does not match passport currency ${passport.authority.currency}`);
  }
  if (passport.authority.piiMode === "placeholder-only") {
    const badRef = request.piiRefs.find((ref) => !PLACEHOLDER_RE.test(ref));
    if (badRef) {
      return refusal(`PII reference must be a {{profile.field}} placeholder, not raw/private data: ${badRef}`);
    }
  }

  const grant = context.delegationGrant;
  if (context.requireDelegationGrant && !grant) {
    return refusal("delegation grant is required for this protected action");
  }

  if (grant) {
    if (grant.status !== "active") {
      return refusal(`delegation grant ${grant.grantId} is not active`);
    }
    if (context.revokedDelegationGrantIds?.includes(grant.grantId)) {
      return refusal(`delegation grant ${grant.grantId} is revoked`);
    }
    if (context.usedDelegationNonces?.includes(grant.nonce)) {
      return refusal(`delegation nonce ${grant.nonce} was already used`);
    }
    if (context.requireSignedDelegationGrant && !grant.consentProof) {
      return refusal("signed consent proof is required for this delegation grant");
    }
    if (new Date(context.now).getTime() < new Date(grant.issuedAt).getTime()) {
      return refusal(`delegation grant ${grant.grantId} is not valid until ${grant.issuedAt}`);
    }
    if (new Date(context.now).getTime() > new Date(grant.expiresAt).getTime()) {
      return refusal(`delegation grant ${grant.grantId} expired at ${grant.expiresAt}`);
    }
    if (grant.issuer.did.toLowerCase() !== passport.issuer.did.toLowerCase()) {
      return refusal(`delegation issuer ${grant.issuer.did} does not match passport issuer ${passport.issuer.did}`);
    }
    if (grant.agent.did.toLowerCase() !== passport.agent.did.toLowerCase()) {
      return refusal(`delegation agent ${grant.agent.did} does not match passport agent ${passport.agent.did}`);
    }
    if (!grant.authority.allowedActions.includes(request.action)) {
      return refusal(`action ${request.action} is outside delegation authority`);
    }
    if (!grant.authority.allowedTargets.includes(request.target)) {
      return refusal(`target ${request.target} is outside delegation authority`);
    }
    if (request.amountCents > grant.authority.maxAmountCents) {
      return refusal(`amount ${request.amountCents} exceeds delegation cap ${grant.authority.maxAmountCents}`);
    }
    if (request.currency.toUpperCase() !== grant.authority.currency) {
      return refusal(`currency ${request.currency} does not match delegation currency ${grant.authority.currency}`);
    }
    if (grant.authority.piiMode !== passport.authority.piiMode) {
      return refusal(`delegation PII mode ${grant.authority.piiMode} does not match passport PII mode ${passport.authority.piiMode}`);
    }
  }

  const policy = context.consentPolicyAnchor;
  if (context.requireConsentPolicyAnchor && !policy) {
    return refusal("consent policy anchor is required for this protected action");
  }
  if (policy) {
    if (policy.status !== "active") {
      return refusal(`consent policy ${policy.policyId} is not active`);
    }
    if (context.revokedConsentPolicyIds?.includes(policy.policyId)) {
      return refusal(`consent policy ${policy.policyId} is revoked`);
    }
    if (new Date(context.now).getTime() < new Date(policy.effectiveAt).getTime()) {
      return refusal(`consent policy ${policy.policyId} is not effective until ${policy.effectiveAt}`);
    }
    if (new Date(context.now).getTime() > new Date(policy.expiresAt).getTime()) {
      return refusal(`consent policy ${policy.policyId} expired at ${policy.expiresAt}`);
    }
    if (!policy.issuerDids.includes(passport.issuer.did.toLowerCase())) {
      return refusal(`issuer ${passport.issuer.did} is outside consent policy ${policy.policyId}`);
    }
    if (!policy.authority.allowedActions.includes(request.action)) {
      return refusal(`action ${request.action} is outside consent policy authority`);
    }
    if (!policy.authority.allowedTargets.includes(request.target)) {
      return refusal(`target ${request.target} is outside consent policy authority`);
    }
    if (request.amountCents > policy.authority.maxAmountCents) {
      return refusal(`amount ${request.amountCents} exceeds consent policy cap ${policy.authority.maxAmountCents}`);
    }
    if (request.currency.toUpperCase() !== policy.authority.currency) {
      return refusal(`currency ${request.currency} does not match consent policy currency ${policy.authority.currency}`);
    }
    if (policy.authority.piiMode !== passport.authority.piiMode) {
      return refusal(`consent policy PII mode ${policy.authority.piiMode} does not match passport PII mode ${passport.authority.piiMode}`);
    }
    if (policy.requiresSignedConsent && !grant?.consentProof) {
      return refusal(`consent policy ${policy.policyId} requires signed consent proof`);
    }
  }

  const policyInput = policy
    ? {
        consent_policy_id: policy.policyId,
        consent_policy_hash: policy.policyHash,
        consent_policy_source_hash: policy.source.sourceHash
      }
    : {};

  const witness = context.governanceWitness;
  if (context.requireGovernanceWitness && !witness) {
    return refusal("governance witness is required for this protected action");
  }
  if (witness) {
    if (!grant) {
      return refusal("governance witness requires a delegation grant");
    }
    if (!policy) {
      return refusal("governance witness requires a consent policy anchor");
    }
    if (witness.status !== "active") {
      return refusal(`governance witness ${witness.witnessId} is not active`);
    }
    if (context.revokedGovernanceWitnessIds?.includes(witness.witnessId)) {
      return refusal(`governance witness ${witness.witnessId} is revoked`);
    }
    if (new Date(context.now).getTime() < new Date(witness.issuedAt).getTime()) {
      return refusal(`governance witness ${witness.witnessId} is not valid until ${witness.issuedAt}`);
    }
    if (new Date(context.now).getTime() > new Date(witness.expiresAt).getTime()) {
      return refusal(`governance witness ${witness.witnessId} expired at ${witness.expiresAt}`);
    }
    if (witness.policyHash !== policy.policyHash) {
      return refusal(`governance witness ${witness.witnessId} does not match consent policy hash`);
    }
    if (witness.policySourceHash !== policy.source.sourceHash) {
      return refusal(`governance witness ${witness.witnessId} does not match consent policy source hash`);
    }
    if (witness.grantHash !== grant.grantHash) {
      return refusal(`governance witness ${witness.witnessId} does not match delegation grant hash`);
    }
    if (witness.requestHash !== governanceWitnessRequestHash(request)) {
      return refusal(`governance witness ${witness.witnessId} does not match request scope`);
    }
    const witnessChallenge = buildGovernanceWitnessChallenge({
      witnessId: witness.witnessId,
      witnessRole: witness.witnessRole,
      issuedAt: witness.issuedAt,
      expiresAt: witness.expiresAt,
      policy,
      grant,
      request
    });
    if (!verifyGovernanceWitnessAttestation(witnessChallenge, witness)) {
      return refusal(`governance witness ${witness.witnessId} signature verification failed`);
    }
  }

  const registryAnchor = context.externalRegistryAnchor;
  if (context.requireExternalRegistryAnchor && !registryAnchor) {
    return refusal("external registry anchor is required for this protected action");
  }
  if (registryAnchor) {
    if (!grant) {
      return refusal("external registry anchor requires a delegation grant");
    }
    if (!policy) {
      return refusal("external registry anchor requires a consent policy anchor");
    }
    if (!witness) {
      return refusal("external registry anchor requires a governance witness");
    }
    if (registryAnchor.status !== "active") {
      return refusal(`external registry anchor ${registryAnchor.registryId} is not active`);
    }
    if (context.revokedExternalRegistryAnchorIds?.includes(registryAnchor.registryId)) {
      return refusal(`external registry anchor ${registryAnchor.registryId} is revoked`);
    }
    if (new Date(context.now).getTime() < new Date(registryAnchor.observedAt).getTime()) {
      return refusal(`external registry anchor ${registryAnchor.registryId} is not valid until ${registryAnchor.observedAt}`);
    }
    if (new Date(context.now).getTime() > new Date(registryAnchor.expiresAt).getTime()) {
      return refusal(`external registry anchor ${registryAnchor.registryId} expired at ${registryAnchor.expiresAt}`);
    }
    const expectedSubject = buildExternalRegistrySubject({ policy, grant, governanceWitness: witness, request });
    if (registryAnchor.subjectHash !== expectedSubject.subjectHash) {
      return refusal(`external registry anchor ${registryAnchor.registryId} does not match external registry subject`);
    }
    if (!verifyExternalRegistryAnchor(registryAnchor, { policy, grant, governanceWitness: witness, request })) {
      return refusal(`external registry anchor ${registryAnchor.registryId} verification failed`);
    }
  }

  const registryInput = registryAnchor
    ? {
        external_registry_id: registryAnchor.registryId,
        external_registry_kind: registryAnchor.registryKind,
        external_registry_anchor_hash: registryAnchor.anchorHash,
        external_registry_record_id: registryAnchor.registryRecordId,
        external_registry_record_hash: registryAnchor.registryRecordHash,
        external_registry_subject_hash: registryAnchor.subjectHash
      }
    : {};

  const witnessInput = witness
    ? {
        governance_witness_id: witness.witnessId,
        governance_witness_attestation_hash: witness.attestationHash,
        governance_witness_signature_hash: witness.signatureHash
      }
    : {};

  const delegationInput = grant
    ? {
        delegation_grant_id: grant.grantId,
        delegation_grant_hash: grant.grantHash,
        ...(grant.consentProof
          ? {
              delegation_consent_signature_hash: grant.consentProof.signatureHash,
              delegation_consent_challenge_hash: grant.consentProof.challengeHash
            }
          : {})
      }
    : {};

  const t3nExecutePayload = request.t3n
    ? {
        script_name: request.t3n.scriptName,
        script_version: request.t3n.scriptVersion,
        function_name: request.t3n.functionName,
        input: { ...request.t3n.input, ...delegationInput, ...policyInput, ...witnessInput, ...registryInput }
      }
    : {
        script_name: "agent-passport-protected-actions",
        script_version: "0.1.0",
        function_name: request.action,
        input: {
          target: request.target,
          amount_cents: request.amountCents,
          currency: request.currency.toUpperCase(),
          pii_refs: request.piiRefs,
          purpose: request.purpose,
          passport_id: passport.passportId,
          ...delegationInput,
          ...policyInput,
          ...witnessInput,
          ...registryInput
        }
      };

  return {
    allowed: true,
    requestId: context.requestId,
    decidedAt,
    reason: "in-scope",
    delegationGrantId: grant?.grantId,
    delegationGrantHash: grant?.grantHash,
    delegationHumanRefHash: grant?.humanRefHash,
    delegationEvidenceHash: grant?.evidenceHash,
    delegationNonceHash: grant ? delegationNonceHash(grant) : undefined,
    delegationConsentChallengeHash: grant?.consentProof?.challengeHash,
    delegationConsentSignatureHash: grant?.consentProof?.signatureHash,
    delegationPublicKeyFingerprint: grant?.consentProof?.publicKeyFingerprint,
    consentPolicyId: policy?.policyId,
    consentPolicyHash: policy?.policyHash,
    consentPolicyVersion: policy?.version,
    consentPolicySourceUri: policy?.source.sourceUri,
    consentPolicySourceHash: policy?.source.sourceHash,
    consentPolicyRequiresSignedConsent: policy?.requiresSignedConsent,
    consentPolicyRequiresAudit: policy?.requiresAudit,
    governanceWitnessId: witness?.witnessId,
    governanceWitnessRole: witness?.witnessRole,
    governanceWitnessAttestationHash: witness?.attestationHash,
    governanceWitnessChallengeHash: witness?.challengeHash,
    governanceWitnessSignatureHash: witness?.signatureHash,
    governanceWitnessPublicKeyFingerprint: witness?.publicKeyFingerprint,
    externalRegistryId: registryAnchor?.registryId,
    externalRegistryKind: registryAnchor?.registryKind,
    externalRegistryUrl: registryAnchor?.registryUrl,
    externalRegistryRecordId: registryAnchor?.registryRecordId,
    externalRegistryRecordHash: registryAnchor?.registryRecordHash,
    externalRegistrySubjectHash: registryAnchor?.subjectHash,
    externalRegistryAnchorHash: registryAnchor?.anchorHash,
    t3nExecutePayload
  };
}

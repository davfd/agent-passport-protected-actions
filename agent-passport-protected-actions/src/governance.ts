import { createPublicKey, generateKeyPairSync, sign, verify } from "node:crypto";
import type { DelegationGrant } from "./delegation.js";
import { sha256Hex, sha256Urn, stableStringify } from "./hash.js";
import type { ConsentPolicyAnchor } from "./policy.js";
import type { ProtectedActionRequest } from "./protected-action.js";

export type GovernanceWitnessStatus = "active" | "revoked";

export interface GovernanceWitnessKeyPair {
  algorithm: "ed25519";
  publicKeyPem: string;
  privateKeyPem: string;
  publicKeyFingerprint: string;
}

export interface BuildGovernanceWitnessChallengeInput {
  witnessId: string;
  witnessRole: string;
  issuedAt: string;
  expiresAt: string;
  policy: ConsentPolicyAnchor;
  grant: DelegationGrant;
  request: ProtectedActionRequest;
}

export interface GovernanceWitnessChallenge {
  schema: "leonardo.governance-witness-challenge.v0.1";
  witnessId: string;
  witnessRole: string;
  issuedAt: string;
  expiresAt: string;
  policy: {
    policyId: string;
    policyHash: string;
    sourceHash: string;
  };
  delegation: {
    grantId: string;
    grantHash: string;
    consentChallengeHash: string;
    consentSignatureHash: string;
  };
  request: {
    action: string;
    target: string;
    amountCents: number;
    currency: string;
    piiRefHashes: string[];
    purposeHash: string;
    requestHash: string;
  };
  challengeHash: string;
}

export interface BuildGovernanceWitnessAttestationInput extends BuildGovernanceWitnessChallengeInput {
  privateKeyPem: string;
  publicKeyPem: string;
  status?: GovernanceWitnessStatus;
}

export interface GovernanceWitnessAttestation {
  schema: "leonardo.governance-witness-attestation.v0.1";
  witnessId: string;
  witnessRole: string;
  issuedAt: string;
  expiresAt: string;
  status: GovernanceWitnessStatus;
  challengeHash: string;
  policyId: string;
  policyHash: string;
  policySourceHash: string;
  grantId: string;
  grantHash: string;
  requestHash: string;
  algorithm: "ed25519";
  publicKeyPem: string;
  publicKeyFingerprint: string;
  signatureBase64: string;
  signatureHash: string;
  attestationHash: string;
}

function publicKeyFingerprint(publicKeyPem: string): string {
  const keyObject = createPublicKey(publicKeyPem);
  const der = keyObject.export({ type: "spki", format: "der" });
  return sha256Urn(der);
}

function canonicalChallengeBytes(challenge: GovernanceWitnessChallenge): Buffer {
  return Buffer.from(stableStringify(challenge));
}

function normalizeWitnessId(value: string): string {
  const id = value.trim();
  if (!id) {
    throw new Error("governance witnessId is required");
  }
  return id;
}

function normalizeWitnessRole(value: string): string {
  const role = value.trim();
  if (!role) {
    throw new Error("governance witnessRole is required");
  }
  return role;
}

function requestSnapshot(request: ProtectedActionRequest): GovernanceWitnessChallenge["request"] {
  const body = {
    action: request.action,
    target: request.target,
    amountCents: request.amountCents,
    currency: request.currency.toUpperCase(),
    piiRefHashes: request.piiRefs.map((ref) => sha256Urn(ref)).sort(),
    purposeHash: sha256Urn(request.purpose)
  };
  return {
    ...body,
    requestHash: sha256Urn(body)
  };
}

export function governanceWitnessRequestHash(request: ProtectedActionRequest): string {
  return requestSnapshot(request).requestHash;
}

export function buildGovernanceWitnessChallenge(input: BuildGovernanceWitnessChallengeInput): GovernanceWitnessChallenge {
  if (!input.grant.consentProof) {
    throw new Error("governance witness challenge requires a signed delegation grant");
  }
  if (Number.isNaN(Date.parse(input.issuedAt)) || Number.isNaN(Date.parse(input.expiresAt))) {
    throw new Error("governance witness issuedAt and expiresAt must be ISO-parseable timestamps");
  }
  if (new Date(input.expiresAt).getTime() <= new Date(input.issuedAt).getTime()) {
    throw new Error("governance witness expiresAt must be after issuedAt");
  }

  const body = {
    schema: "leonardo.governance-witness-challenge.v0.1" as const,
    witnessId: normalizeWitnessId(input.witnessId),
    witnessRole: normalizeWitnessRole(input.witnessRole),
    issuedAt: new Date(input.issuedAt).toISOString(),
    expiresAt: new Date(input.expiresAt).toISOString(),
    policy: {
      policyId: input.policy.policyId,
      policyHash: input.policy.policyHash,
      sourceHash: input.policy.source.sourceHash
    },
    delegation: {
      grantId: input.grant.grantId,
      grantHash: input.grant.grantHash,
      consentChallengeHash: input.grant.consentProof.challengeHash,
      consentSignatureHash: input.grant.consentProof.signatureHash
    },
    request: requestSnapshot(input.request)
  };

  return {
    ...body,
    challengeHash: sha256Urn(body)
  };
}

export function generateGovernanceWitnessKeyPair(): GovernanceWitnessKeyPair {
  const { publicKey, privateKey } = generateKeyPairSync("ed25519");
  const publicKeyPem = publicKey.export({ type: "spki", format: "pem" }).toString();
  const privateKeyPem = privateKey.export({ type: "pkcs8", format: "pem" }).toString();
  return {
    algorithm: "ed25519",
    publicKeyPem,
    privateKeyPem,
    publicKeyFingerprint: publicKeyFingerprint(publicKeyPem)
  };
}

export function buildGovernanceWitnessAttestation(input: BuildGovernanceWitnessAttestationInput): GovernanceWitnessAttestation {
  const challenge = buildGovernanceWitnessChallenge(input);
  const signature = sign(null, canonicalChallengeBytes(challenge), input.privateKeyPem);
  const body = {
    schema: "leonardo.governance-witness-attestation.v0.1" as const,
    witnessId: challenge.witnessId,
    witnessRole: challenge.witnessRole,
    issuedAt: challenge.issuedAt,
    expiresAt: challenge.expiresAt,
    status: input.status ?? "active" as GovernanceWitnessStatus,
    challengeHash: challenge.challengeHash,
    policyId: challenge.policy.policyId,
    policyHash: challenge.policy.policyHash,
    policySourceHash: challenge.policy.sourceHash,
    grantId: challenge.delegation.grantId,
    grantHash: challenge.delegation.grantHash,
    requestHash: challenge.request.requestHash,
    algorithm: "ed25519" as const,
    publicKeyPem: input.publicKeyPem,
    publicKeyFingerprint: publicKeyFingerprint(input.publicKeyPem),
    signatureBase64: signature.toString("base64"),
    signatureHash: `sha256:${sha256Hex(signature)}`
  };
  return {
    ...body,
    attestationHash: `sha256:${sha256Hex(stableStringify(body))}`
  };
}

export function verifyGovernanceWitnessAttestation(
  challenge: GovernanceWitnessChallenge,
  attestation: GovernanceWitnessAttestation
): boolean {
  if (attestation.algorithm !== "ed25519") {
    return false;
  }
  if (attestation.challengeHash !== challenge.challengeHash) {
    return false;
  }
  if (attestation.policyHash !== challenge.policy.policyHash) {
    return false;
  }
  if (attestation.policySourceHash !== challenge.policy.sourceHash) {
    return false;
  }
  if (attestation.grantHash !== challenge.delegation.grantHash) {
    return false;
  }
  if (attestation.requestHash !== challenge.request.requestHash) {
    return false;
  }
  if (publicKeyFingerprint(attestation.publicKeyPem) !== attestation.publicKeyFingerprint) {
    return false;
  }
  return verify(
    null,
    canonicalChallengeBytes(challenge),
    attestation.publicKeyPem,
    Buffer.from(attestation.signatureBase64, "base64")
  );
}

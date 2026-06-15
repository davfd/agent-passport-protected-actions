import { createPublicKey, generateKeyPairSync, sign, verify } from "node:crypto";
import { buildDelegationGrant, type BuildDelegationGrantInput, type DelegationGrant } from "./delegation.js";
import { sha256Hex, sha256Urn, stableStringify } from "./hash.js";

export interface ConsentChallenge {
  schema: "leonardo.delegation-consent-challenge.v0.1";
  issuedAt: string;
  statement: string;
  grant: {
    humanRefHash: string;
    issuerDid: string;
    agentDid: string;
    expiresAt: string;
    nonce: string;
    evidenceHash: string;
    authority: BuildDelegationGrantInput["authority"];
  };
  challengeHash: string;
}

export interface ConsentKeyPair {
  algorithm: "ed25519";
  publicKeyPem: string;
  privateKeyPem: string;
  publicKeyFingerprint: string;
}

export interface SignedConsentProof {
  schema: "leonardo.delegation-consent-signature.v0.1";
  algorithm: "ed25519";
  signedAt: string;
  challengeHash: string;
  publicKeyPem: string;
  publicKeyFingerprint: string;
  signatureBase64: string;
  signatureHash: string;
}

function canonicalChallengeBytes(challenge: ConsentChallenge): Buffer {
  return Buffer.from(stableStringify(challenge));
}

function publicKeyFingerprint(publicKeyPem: string): string {
  const keyObject = createPublicKey(publicKeyPem);
  const der = keyObject.export({ type: "spki", format: "der" });
  return sha256Urn(der);
}

export function buildConsentChallenge(
  input: BuildDelegationGrantInput,
  options: { issuedAt: string }
): ConsentChallenge {
  const body = {
    schema: "leonardo.delegation-consent-challenge.v0.1" as const,
    issuedAt: new Date(options.issuedAt).toISOString(),
    statement: "I authorize this agent, issuer, scope, cap, nonce, and expiry; no raw PII is included in this challenge.",
    grant: {
      humanRefHash: input.humanRefHash,
      issuerDid: input.issuerDid.toLowerCase(),
      agentDid: input.agentDid.toLowerCase(),
      expiresAt: new Date(input.expiresAt).toISOString(),
      nonce: input.nonce,
      evidenceHash: input.evidenceHash,
      authority: {
        allowedActions: Array.from(new Set(input.authority.allowedActions)).sort(),
        allowedTargets: Array.from(new Set(input.authority.allowedTargets)).sort(),
        maxAmountCents: input.authority.maxAmountCents,
        currency: input.authority.currency.toUpperCase(),
        piiMode: input.authority.piiMode
      }
    }
  };

  return {
    ...body,
    challengeHash: sha256Urn(body)
  };
}

export function generateConsentKeyPair(): ConsentKeyPair {
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

export function signConsentChallenge(
  challenge: ConsentChallenge,
  privateKeyPem: string,
  publicKeyPem: string,
  signedAt: string = new Date().toISOString()
): SignedConsentProof {
  const signature = sign(null, canonicalChallengeBytes(challenge), privateKeyPem);
  return {
    schema: "leonardo.delegation-consent-signature.v0.1",
    algorithm: "ed25519",
    signedAt: new Date(signedAt).toISOString(),
    challengeHash: challenge.challengeHash,
    publicKeyPem,
    publicKeyFingerprint: publicKeyFingerprint(publicKeyPem),
    signatureBase64: signature.toString("base64"),
    signatureHash: `sha256:${sha256Hex(signature)}`
  };
}

export function verifyConsentSignature(challenge: ConsentChallenge, signed: SignedConsentProof): boolean {
  if (signed.algorithm !== "ed25519") {
    return false;
  }
  if (signed.challengeHash !== challenge.challengeHash) {
    return false;
  }
  if (publicKeyFingerprint(signed.publicKeyPem) !== signed.publicKeyFingerprint) {
    return false;
  }
  return verify(
    null,
    canonicalChallengeBytes(challenge),
    signed.publicKeyPem,
    Buffer.from(signed.signatureBase64, "base64")
  );
}

export function buildSignedDelegationGrant(
  input: BuildDelegationGrantInput,
  signed: SignedConsentProof
): DelegationGrant {
  const challenge = buildConsentChallenge(input, { issuedAt: input.issuedAt });
  if (!verifyConsentSignature(challenge, signed)) {
    throw new Error("signed consent proof does not verify against the delegation grant challenge");
  }
  const grant = buildDelegationGrant(input);
  return {
    ...grant,
    consentProof: {
      algorithm: signed.algorithm,
      challengeHash: signed.challengeHash,
      signatureHash: signed.signatureHash,
      publicKeyFingerprint: signed.publicKeyFingerprint,
      signedAt: signed.signedAt
    }
  };
}

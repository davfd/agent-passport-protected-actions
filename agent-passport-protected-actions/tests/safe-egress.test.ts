import { describe, expect, it } from "vitest";
import { buildAgentPassport } from "../src/passport.js";
import { decideProtectedAction } from "../src/protected-action.js";
import {
  SAFE_EGRESS_ACTION,
  SAFE_EGRESS_ALLOWED_URL,
  SAFE_EGRESS_TARGET,
  buildSafeEgressContractInput,
  edgeReceiptName,
  executePayloadFromAllowedDecision,
  forbiddenEvidenceHits,
  sanitizeLiveError,
} from "../src/safe-egress.js";

describe("safe egress extension helpers", () => {
  it("builds the canonical no-money/no-raw-PII contract input", () => {
    const input = buildSafeEgressContractInput({ requestId: "req_safe" });
    expect(input).toEqual({
      requestId: "req_safe",
      url: SAFE_EGRESS_ALLOWED_URL,
      action: SAFE_EGRESS_ACTION,
      target: SAFE_EGRESS_TARGET,
    });
  });

  it("redacts explicit secrets from live errors", () => {
    const error = new Error("bad token secret_abc_123 while calling node");
    expect(sanitizeLiveError(error, ["secret_abc_123"])).toContain("[REDACTED]");
    expect(sanitizeLiveError(error, ["secret_abc_123"])).not.toContain("secret_abc_123");
  });

  it("flags evidence strings that would break the claim boundary", () => {
    expect(forbiddenEvidenceHits({ ok: true, moneyMovement: false, rawPiiReturned: false })).toEqual([]);
    expect(forbiddenEvidenceHits("production governance and real payment complete")).toEqual([
      "real payment",
      "legal governance overclaim",
    ]);
  });

  it("names edge receipts deterministically", () => {
    expect(edgeReceiptName("denied-egress", "req1", "live-failed")).toBe("safe_egress_denied-egress-req1-live-failed.json");
  });

  it("extracts the canonical snake_case T3N execute payload from an allowed decision", () => {
    const passport = buildAgentPassport({
      agentName: "leonardo-safe-egress-agent",
      agentDid: "did:t3n:1234567890abcdef1234567890abcdef12345678",
      issuer: "did:t3n:1234567890abcdef1234567890abcdef12345678",
      issuedAt: "2026-06-15T00:00:00.000Z",
      expiresAt: "2026-06-22T00:00:00.000Z",
      authority: {
        allowedActions: [SAFE_EGRESS_ACTION],
        allowedTargets: [SAFE_EGRESS_TARGET],
        maxAmountCents: 0,
        currency: "USD",
        piiMode: "placeholder-only",
      },
    });
    const decision = decideProtectedAction(passport, {
      action: SAFE_EGRESS_ACTION,
      target: SAFE_EGRESS_TARGET,
      amountCents: 0,
      currency: "USD",
      piiRefs: [],
      purpose: "safe egress canonical payload test",
      t3n: {
        scriptName: "z:1234567890abcdef1234567890abcdef12345678:ap-egress-test",
        scriptVersion: "0.1.0",
        functionName: "ping-allowed",
        input: buildSafeEgressContractInput({ requestId: "req_safe" }),
      },
    }, {
      now: "2026-06-15T00:01:00.000Z",
      requestId: "req_safe",
      trustedIssuerDids: [passport.issuer.did],
    });

    const payload = executePayloadFromAllowedDecision(decision);
    expect(payload).toEqual({
      script_name: "z:1234567890abcdef1234567890abcdef12345678:ap-egress-test",
      script_version: "0.1.0",
      function_name: "ping-allowed",
      input: buildSafeEgressContractInput({ requestId: "req_safe" }),
    });
    expect(JSON.stringify(payload)).not.toContain("functionName");
    expect(JSON.stringify(payload)).not.toContain("scriptName");
  });
});

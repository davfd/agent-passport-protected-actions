import { describe, expect, it } from "vitest";
import { buildAgentPassport } from "../src/passport.js";
import { decideProtectedAction } from "../src/protected-action.js";

const passport = buildAgentPassport({
  agentName: "leonardo-protected-action-agent",
  agentDid: "did:t3n:1234567890abcdef1234567890abcdef12345678",
  issuer: "did:t3n:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  issuedAt: "2026-06-15T00:00:00.000Z",
  expiresAt: "2026-06-22T15:59:00.000Z",
  authority: {
    allowedActions: ["payment.intent.create", "travel.flight.search"],
    allowedTargets: ["stripe-test-merchant", "duffel-test"],
    maxAmountCents: 50000,
    currency: "USD",
    piiMode: "placeholder-only"
  }
});

describe("protected-action decision gate", () => {
  it("allows an in-scope protected action and builds the T3 execute payload", () => {
    const decision = decideProtectedAction(passport, {
      action: "payment.intent.create",
      target: "stripe-test-merchant",
      amountCents: 42500,
      currency: "USD",
      piiRefs: ["{{profile.email}}", "{{profile.payment_method}}"],
      purpose: "demo checkout under user-approved cap"
    }, { now: "2026-06-15T00:01:00.000Z", requestId: "req_ok" });

    expect(decision.allowed).toBe(true);
    expect(decision.t3nExecutePayload).toEqual({
      script_name: "agent-passport-protected-actions",
      script_version: "0.1.0",
      function_name: "payment.intent.create",
      input: {
        target: "stripe-test-merchant",
        amount_cents: 42500,
        currency: "USD",
        pii_refs: ["{{profile.email}}", "{{profile.payment_method}}"],
        purpose: "demo checkout under user-approved cap",
        passport_id: passport.passportId
      }
    });
  });

  it("allows a request to bind the execute hash to a concrete Terminal 3 tenant script", () => {
    const decision = decideProtectedAction(passport, {
      action: "travel.flight.search",
      target: "duffel-test",
      amountCents: 0,
      currency: "USD",
      piiRefs: [],
      purpose: "audit probe",
      t3n: {
        scriptName: "z:5c946503c2d9924f58ee273dbd2efba8d03a12df:agent-passport-audit-probe",
        scriptVersion: "0.1.0",
        functionName: "audit-ping",
        input: { requestId: "req_live_audit", amountCents: 0, pii: false }
      }
    }, { now: "2026-06-15T00:01:00.000Z", requestId: "req_live_audit" });

    expect(decision.allowed).toBe(true);
    expect(decision.t3nExecutePayload).toEqual({
      script_name: "z:5c946503c2d9924f58ee273dbd2efba8d03a12df:agent-passport-audit-probe",
      script_version: "0.1.0",
      function_name: "audit-ping",
      input: { requestId: "req_live_audit", amountCents: 0, pii: false }
    });
  });

  it("refuses out-of-scope amount before any T3 execute payload is produced", () => {
    const decision = decideProtectedAction(passport, {
      action: "payment.intent.create",
      target: "stripe-test-merchant",
      amountCents: 65000,
      currency: "USD",
      piiRefs: ["{{profile.email}}"],
      purpose: "too much money"
    }, { now: "2026-06-15T00:01:00.000Z", requestId: "req_over_cap" });

    expect(decision.allowed).toBe(false);
    expect(decision.reason).toMatch(/exceeds.*50000/i);
    expect(decision.t3nExecutePayload).toBeUndefined();
  });

  it("refuses raw private data and requires placeholder references for TEE substitution", () => {
    const decision = decideProtectedAction(passport, {
      action: "payment.intent.create",
      target: "stripe-test-merchant",
      amountCents: 1000,
      currency: "USD",
      piiRefs: ["jane@example.com"],
      purpose: "raw PII should not enter prompt/tool context"
    }, { now: "2026-06-15T00:01:00.000Z", requestId: "req_raw_pii" });

    expect(decision.allowed).toBe(false);
    expect(decision.reason).toMatch(/placeholder/);
  });

  it("refuses a passport from an untrusted issuer before any T3 execute payload is produced", () => {
    const decision = decideProtectedAction(passport, {
      action: "payment.intent.create",
      target: "stripe-test-merchant",
      amountCents: 1000,
      currency: "USD",
      piiRefs: ["{{profile.email}}"],
      purpose: "issuer must be explicitly trusted"
    }, {
      now: "2026-06-15T00:01:00.000Z",
      requestId: "req_wrong_issuer",
      trustedIssuerDids: ["did:t3n:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"]
    });

    expect(decision.allowed).toBe(false);
    expect(decision.reason).toMatch(/issuer.*not trusted/i);
    expect(decision.t3nExecutePayload).toBeUndefined();
  });

  it("refuses a revoked passport before any T3 execute payload is produced", () => {
    const decision = decideProtectedAction(passport, {
      action: "payment.intent.create",
      target: "stripe-test-merchant",
      amountCents: 1000,
      currency: "USD",
      piiRefs: ["{{profile.email}}"],
      purpose: "revoked passport should not act"
    }, {
      now: "2026-06-15T00:01:00.000Z",
      requestId: "req_revoked",
      revokedPassportIds: [passport.passportId]
    });

    expect(decision.allowed).toBe(false);
    expect(decision.reason).toMatch(/revoked/i);
    expect(decision.t3nExecutePayload).toBeUndefined();
  });
});

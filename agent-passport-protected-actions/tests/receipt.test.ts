import { describe, expect, it } from "vitest";
import { buildAgentPassport } from "../src/passport.js";
import { decideProtectedAction } from "../src/protected-action.js";
import { buildActionReceipt } from "../src/receipt.js";

const passport = buildAgentPassport({
  agentName: "leonardo-protected-action-agent",
  agentDid: "did:t3n:1234567890abcdef1234567890abcdef12345678",
  issuer: "did:t3n:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  issuedAt: "2026-06-15T00:00:00.000Z",
  expiresAt: "2026-06-22T15:59:00.000Z",
  authority: {
    allowedActions: ["payment.intent.create"],
    allowedTargets: ["stripe-test-merchant"],
    maxAmountCents: 50000,
    currency: "USD",
    piiMode: "placeholder-only"
  }
});

describe("action receipt", () => {
  it("records identity, scope, decision, evidence handles, and tamper hash without raw PII", () => {
    const request = {
      action: "payment.intent.create",
      target: "stripe-test-merchant",
      amountCents: 42500,
      currency: "USD",
      piiRefs: ["{{profile.email}}", "{{profile.payment_method}}"],
      purpose: "demo checkout"
    };
    const decision = decideProtectedAction(passport, request, { now: "2026-06-15T00:01:00.000Z", requestId: "req_receipt" });
    const receipt = buildActionReceipt({
      passport,
      request,
      decision,
      t3n: {
        environment: "testnet",
        nodeUrl: "https://node.testnet.example",
        status: "dry-run-no-api-key"
      },
      issuedAt: "2026-06-15T00:01:02.000Z"
    });

    expect(receipt.agent.did).toBe(passport.agent.did);
    expect(receipt.authority.allowedActions).toContain("payment.intent.create");
    expect(receipt.decision.allowed).toBe(true);
    expect(receipt.evidence.t3n.status).toBe("dry-run-no-api-key");
    expect(receipt.receiptHash).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(JSON.stringify(receipt)).not.toContain("jane@example.com");
    expect(receipt.request.piiRefHashes).toHaveLength(2);
  });

  it("labels live authentication separately from live protected execution", () => {
    const request = {
      action: "payment.intent.create",
      target: "stripe-test-merchant",
      amountCents: 1000,
      currency: "USD",
      piiRefs: ["{{profile.email}}"],
      purpose: "live auth smoke only"
    };
    const decision = decideProtectedAction(passport, request, { now: "2026-06-15T00:01:00.000Z", requestId: "req_auth_only" });
    const receipt = buildActionReceipt({
      passport,
      request,
      decision,
      t3n: {
        environment: "testnet",
        nodeUrl: "https://node.testnet.example",
        status: "live-authenticated-only",
        did: passport.agent.did
      },
      issuedAt: "2026-06-15T00:01:02.000Z"
    });

    expect(receipt.evidence.t3n.status).toBe("live-authenticated-only");
    expect(receipt.evidence.t3n.auditEventId).toBeUndefined();
  });

  it("preserves a sanitized response hash on live-submitted receipts", () => {
    const request = {
      action: "payment.intent.create",
      target: "stripe-test-merchant",
      amountCents: 1000,
      currency: "USD",
      piiRefs: ["{{profile.email}}"],
      purpose: "live submit smoke"
    };
    const decision = decideProtectedAction(passport, request, { now: "2026-06-15T00:01:00.000Z", requestId: "req_live_submit" });
    const receipt = buildActionReceipt({
      passport,
      request,
      decision,
      t3n: {
        environment: "testnet",
        nodeUrl: "https://node.testnet.example",
        status: "live-submitted",
        did: passport.agent.did,
        responseHash: "sha256:f175836fc46f4da7aedf17529a0bb2360eb2e90b6f449417f7865e13f7ac0287"
      },
      issuedAt: "2026-06-15T00:01:02.000Z"
    });

    expect(receipt.evidence.t3n.status).toBe("live-submitted");
    expect(receipt.evidence.t3n.responseHash).toBe("sha256:f175836fc46f4da7aedf17529a0bb2360eb2e90b6f449417f7865e13f7ac0287");
  });

  it("records audit binding fields on a live-audited receipt", () => {
    const request = {
      action: "payment.intent.create",
      target: "stripe-test-merchant",
      amountCents: 0,
      currency: "USD",
      piiRefs: [],
      purpose: "audit probe receipt"
    };
    const decision = decideProtectedAction(passport, request, { now: "2026-06-15T00:01:00.000Z", requestId: "req_live_audit" });
    const receipt = buildActionReceipt({
      passport,
      request,
      decision,
      t3n: {
        environment: "testnet",
        nodeUrl: "https://node.testnet.example",
        status: "live-audited",
        did: passport.agent.did,
        auditEventId: "0xabc123:sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        auditBatchKey: "0xabc123",
        auditEventHash: "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        auditEventCommitted: true,
        responseHash: "sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
      },
      issuedAt: "2026-06-15T00:01:02.000Z"
    });

    expect(receipt.evidence.t3n.status).toBe("live-audited");
    expect(receipt.evidence.t3n.auditBatchKey).toBe("0xabc123");
    expect(receipt.evidence.t3n.auditEventCommitted).toBe(true);
  });

  it("rejects a live-audited receipt that lacks an audit event id", () => {
    const request = {
      action: "payment.intent.create",
      target: "stripe-test-merchant",
      amountCents: 1000,
      currency: "USD",
      piiRefs: ["{{profile.email}}"],
      purpose: "audit claims require event handles"
    };
    const decision = decideProtectedAction(passport, request, { now: "2026-06-15T00:01:00.000Z", requestId: "req_missing_audit" });

    expect(() => buildActionReceipt({
      passport,
      request,
      decision,
      t3n: {
        environment: "testnet",
        nodeUrl: "https://node.testnet.example",
        status: "live-audited",
        did: passport.agent.did
      },
      issuedAt: "2026-06-15T00:01:02.000Z"
    })).toThrow(/auditEventId/);
  });
});

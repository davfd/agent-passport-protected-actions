import { describe, expect, it } from "vitest";
import { buildAgentPassport, isT3Did } from "../src/passport.js";

describe("Agent Passport", () => {
  it("accepts Terminal 3 DID identities and derives a stable passport id", () => {
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

    expect(isT3Did(passport.agent.did)).toBe(true);
    expect(passport.passportId).toMatch(/^awe_[a-f0-9]{64}$/);
    expect(passport.authority.piiMode).toBe("placeholder-only");
  });

  it("rejects non-Terminal-3 identities before protected actions are attempted", () => {
    expect(() => buildAgentPassport({
      agentName: "spoof",
      agentDid: "did:example:not-terminal-3",
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
    })).toThrow(/did:t3n/);
  });
});

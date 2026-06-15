import { buildDelegationGrant } from "./delegation.js";
import { sha256Urn } from "./hash.js";
import { buildAgentPassport } from "./passport.js";
import { decideProtectedAction } from "./protected-action.js";
import { buildActionReceipt, type ActionReceipt } from "./receipt.js";

export interface LocalDemoOptions {
  now: string;
  issuedAt: string;
}

export function makeLocalDemoReceipts(options: LocalDemoOptions): ActionReceipt[] {
  const passport = buildAgentPassport({
    agentName: "leonardo-protected-action-agent",
    agentDid: process.env.T3N_AGENT_DID ?? "did:t3n:5c946503c2d9924f58ee273dbd2efba8d03a12df",
    issuer: process.env.T3N_ISSUER_DID ?? "did:t3n:5c946503c2d9924f58ee273dbd2efba8d03a12df",
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

  const allowedRequest = {
    action: "payment.intent.create",
    target: "stripe-test-merchant",
    amountCents: 42500,
    currency: "USD",
    piiRefs: ["{{profile.email}}", "{{profile.payment_method}}"],
    purpose: "Terminal 3 bounty demo: user-approved checkout under scoped cap"
  };
  const refusedRequest = {
    action: "payment.intent.create",
    target: "stripe-test-merchant",
    amountCents: 65000,
    currency: "USD",
    piiRefs: ["{{profile.email}}", "{{profile.payment_method}}"],
    purpose: "Terminal 3 bounty demo: attempted checkout above scoped cap"
  };
  const delegatedRequest = {
    action: "payment.intent.create",
    target: "stripe-test-merchant",
    amountCents: 42500,
    currency: "USD",
    piiRefs: ["{{profile.email}}", "{{profile.payment_method}}"],
    purpose: "Terminal 3 build-track demo: delegated consent grant required"
  };
  const delegationGrant = buildDelegationGrant({
    humanRefHash: sha256Urn("demo-human-opaque-ref"),
    issuerDid: passport.issuer.did,
    agentDid: passport.agent.did,
    issuedAt: "2026-06-15T00:00:30.000Z",
    expiresAt: "2026-06-15T00:10:00.000Z",
    nonce: "demo-human-consent-nonce-001",
    evidenceHash: sha256Urn("demo-consent-screen: payment.intent.create stripe-test-merchant cap=50000 pii=placeholder-only"),
    authority: {
      allowedActions: ["payment.intent.create"],
      allowedTargets: ["stripe-test-merchant"],
      maxAmountCents: 50000,
      currency: "USD",
      piiMode: "placeholder-only"
    }
  });

  const scenarios = [
    {
      request: allowedRequest,
      requestId: "demo_allowed",
      context: {}
    },
    {
      request: refusedRequest,
      requestId: "demo_refused_over_cap",
      context: {}
    },
    {
      request: delegatedRequest,
      requestId: "demo_delegated_missing_grant",
      context: { requireDelegationGrant: true }
    },
    {
      request: delegatedRequest,
      requestId: "demo_delegated_allowed",
      context: { requireDelegationGrant: true, delegationGrant }
    }
  ];

  return scenarios.map(({ request, requestId, context }) => {
    const decision = decideProtectedAction(passport, request, {
      now: options.now,
      requestId,
      ...context
    });
    return buildActionReceipt({
      passport,
      request,
      decision,
      issuedAt: options.issuedAt,
      t3n: {
        environment: "testnet",
        nodeUrl: "resolved-by-@terminal3/t3n-sdk-when-T3N_API_KEY-is-present",
        status: "dry-run-no-api-key"
      }
    });
  });
}

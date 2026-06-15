import { describe, expect, it } from "vitest";
import { bindAuditEvent, canonicalJson, sha256Json } from "../src/audit.js";

describe("audit event binding", () => {
  it("canonicalizes JSON deterministically before hashing", () => {
    const left = { b: 2, a: { z: true, y: [3, 1] } };
    const right = { a: { y: [3, 1], z: true }, b: 2 };

    expect(canonicalJson(left)).toBe(canonicalJson(right));
    expect(sha256Json(left)).toBe(sha256Json(right));
  });

  it("binds a matching host-stamped audit event to a stable receipt id", () => {
    const page = {
      batches: [
        {
          key: "0xabc123",
          committed: true,
          events: [
            {
              ts_ms: 1781491200000,
              subject: "did:t3n:5c946503c2d9924f58ee273dbd2efba8d03a12df",
              actor: "did:t3n:5c946503c2d9924f58ee273dbd2efba8d03a12df",
              vc_id: null,
              action: "agent-passport.audit-probe",
              target: "terminal3.testnet.audit-probe",
              outcome: "success",
              details: JSON.stringify({ requestId: "req-live-audit-1", amountCents: 0, pii: false }),
            },
          ],
        },
      ],
    };

    const binding = bindAuditEvent(page, {
      action: "agent-passport.audit-probe",
      target: "terminal3.testnet.audit-probe",
      requestId: "req-live-audit-1",
    });

    expect(binding).not.toBeNull();
    expect(binding?.auditEventId).toMatch(/^0xabc123:sha256:/);
    expect(binding?.auditBatchKey).toBe("0xabc123");
    expect(binding?.auditEventHash).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(binding?.committed).toBe(true);
    expect(binding?.subject).toBe("did:t3n:5c946503c2d9924f58ee273dbd2efba8d03a12df");
  });

  it("refuses to bind a non-matching request id", () => {
    const page = {
      batches: [
        {
          key: "0xabc123",
          committed: true,
          events: [
            {
              ts_ms: 1781491200000,
              subject: "did:t3n:user",
              actor: "did:t3n:agent",
              action: "agent-passport.audit-probe",
              target: "terminal3.testnet.audit-probe",
              outcome: "success",
              details: JSON.stringify({ requestId: "other" }),
            },
          ],
        },
      ],
    };

    expect(
      bindAuditEvent(page, {
        action: "agent-passport.audit-probe",
        target: "terminal3.testnet.audit-probe",
        requestId: "req-live-audit-1",
      }),
    ).toBeNull();
  });
});

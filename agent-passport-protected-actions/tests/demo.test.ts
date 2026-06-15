import { describe, expect, it } from "vitest";
import { makeLocalDemoReceipts } from "../src/demo.js";

describe("local demo receipts", () => {
  it("produces legacy scope receipts plus delegated-consent gate receipts", () => {
    const receipts = makeLocalDemoReceipts({
      issuedAt: "2026-06-15T00:02:00.000Z",
      now: "2026-06-15T00:01:00.000Z"
    });

    expect(receipts).toHaveLength(4);
    expect(receipts[0].decision.allowed).toBe(true);
    expect(receipts[0].evidence.t3n.status).toBe("dry-run-no-api-key");
    expect(receipts[1].decision.allowed).toBe(false);
    expect(receipts[1].decision.reason).toMatch(/exceeds.*50000/i);

    expect(receipts[2].decision.allowed).toBe(false);
    expect(receipts[2].decision.reason).toMatch(/delegation grant.*required/i);
    expect(receipts[2].evidence.delegation).toBeUndefined();

    expect(receipts[3].decision.allowed).toBe(true);
    expect(receipts[3].evidence.delegation?.grantId).toMatch(/^deleg_[a-f0-9]{32}$/);
    expect(receipts[3].evidence.delegation?.humanRefHash).toMatch(/^sha256:[a-f0-9]{64}$/);
  });
});

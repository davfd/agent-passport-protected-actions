import { describe, expect, it } from "vitest";
import {
  buildSdkBreadthReceipt,
  forbiddenSdkBreadthEvidenceHits,
  sanitizeProbeError,
  summarizeIdentityStatus,
} from "../src/sdk-breadth.js";

const PRIMARY = `0x${"d".repeat(40)}`;
const SECONDARY = `0x${"1".repeat(40)}`;

describe("Terminal 3 SDK breadth receipt", () => {
  it("hashes wallet addresses and keeps human-identity proof explicitly unclaimed", () => {
    const receipt = buildSdkBreadthReceipt({
      issuedAt: "2026-06-15T19:13:49.000Z",
      sdkVersion: "3.5.2",
      environment: "testnet",
      nodeUrl: "https://cn-api.sg.testnet.t3n.terminal3.io",
      did: "did:t3n:5c946503c2d9924f58ee273dbd2efba8d03a12df",
      auth: { ok: true, address: PRIMARY },
      usage: { ok: true, responseHash: "sha256:usage", balanceAvailable: 20000 },
      wallet: {
        ok: true,
        primary: PRIMARY,
        secondary: [SECONDARY],
        historyHash: "sha256:wallet-history",
      },
      humanIdentity: summarizeIdentityStatus({ ok: false, error: "precondition_failed: no provider session" }),
      auditRead: { ok: true, batchCount: 0, eventCount: 0, responseHash: "sha256:audit" },
    });

    const text = JSON.stringify(receipt);
    expect(receipt.schema).toBe("leonardo.t3n.sdk-breadth-receipt.v0.1");
    expect(receipt.surfaces.auth.addressHash).toMatch(/^sha256:/);
    expect(receipt.surfaces.wallet.primaryAddressHash).toMatch(/^sha256:/);
    expect(receipt.surfaces.wallet.secondaryAddressHashes).toHaveLength(1);
    expect(text).not.toContain(PRIMARY);
    expect(text).not.toContain(SECONDARY);
    expect(receipt.surfaces.humanIdentity.safeClaim).toBe("not-proved-by-this-probe");
    expect(receipt.boundaries).toMatchObject({
      testnetOnly: true,
      noRawPiiReturned: true,
      noMoneyMovement: true,
      productionTrustClaim: false,
      humanIdentityProofClaim: false,
      realPaymentClaim: false,
    });
    expect(receipt.receiptHash).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(forbiddenSdkBreadthEvidenceHits(receipt)).toEqual([]);
  });

  it("redacts API keys, private key wording, and raw Ethereum addresses from errors", () => {
    const sanitized = sanitizeProbeError(
      new Error(`private key 0x${"a".repeat(64)} failed for ${PRIMARY} with secret-live-key`),
      ["secret-live-key"],
    );

    expect(sanitized).not.toContain("secret-live-key");
    expect(sanitized).not.toContain(PRIMARY);
    expect(sanitized).not.toContain("private key");
    expect(sanitized).toContain("[REDACTED_SECRET_TERM]");
  });
});

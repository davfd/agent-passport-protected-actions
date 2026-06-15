import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import {
  T3nClient,
  createEthAuthInput,
  eth_get_address,
  getEnvironmentName,
  getNodeUrl,
  loadWasmComponent,
  metamask_sign,
  setEnvironment,
} from "@terminal3/t3n-sdk";
import { sha256Json } from "../audit.js";
import { sha256HexBytes } from "../safe-egress.js";
import {
  buildSdkBreadthReceipt,
  forbiddenSdkBreadthEvidenceHits,
  sanitizeProbeError,
  sdkBreadthReceiptName,
  summarizeIdentityStatus,
} from "../sdk-breadth.js";
import { requireT3nApiKey } from "../t3n.js";

const startedAt = new Date();
const stamp = startedAt.toISOString().replace(/[-:.]/g, "").replace("T", "t").replace("Z", "z");
const outDir = "receipts";
const logDir = "logs";
const logPath = join(logDir, `t3n-sdk-breadth-${stamp}.json`);

function writeJson(path: string, payload: unknown) {
  writeFileSync(path, `${JSON.stringify(payload, null, 2)}\n`);
}

function writeReceipt(status: "live-submitted" | "live-failed", payload: unknown) {
  mkdirSync(outDir, { recursive: true });
  const path = join(outDir, sdkBreadthReceiptName(stamp, status));
  writeJson(path, payload);
  return {
    path,
    basename: basename(path),
    wholeFileSha256: sha256HexBytes(readFileSync(path)),
  };
}

function countAuditEvents(page: unknown) {
  const batches = Array.isArray((page as { batches?: unknown[] })?.batches)
    ? ((page as { batches: unknown[] }).batches)
    : [];
  const eventCount = batches.reduce<number>((sum, batch) => {
    const events = Array.isArray((batch as { events?: unknown[] })?.events)
      ? (batch as { events: unknown[] }).events
      : [];
    return sum + events.length;
  }, 0);
  return { batchCount: batches.length, eventCount };
}

function balanceAvailable(usage: unknown): number | undefined {
  const balance = (usage as { balance?: { available?: unknown } })?.balance;
  return typeof balance?.available === "number" ? balance.available : undefined;
}

async function main() {
  const apiKey = requireT3nApiKey();
  setEnvironment("testnet");
  mkdirSync(logDir, { recursive: true });

  const log: Record<string, unknown> = {
    startedAt: startedAt.toISOString(),
    environment: getEnvironmentName(),
    nodeUrl: getNodeUrl(),
    scope: "SDK breadth probe: auth, usage, wallet, human-identity-status boundary, audit-read",
    safeBoundary: {
      testnetOnly: true,
      noRawPiiReturned: true,
      noMoneyMovement: true,
      productionTrustClaim: false,
      humanIdentityProofClaim: false,
      realPaymentClaim: false,
      rawPiiDisclosureClaim: false,
    },
    phases: [],
  };

  try {
    const wasmComponent = await loadWasmComponent();
    const address = eth_get_address(apiKey);
    const client = new T3nClient({
      wasmComponent,
      handlers: { EthSign: metamask_sign(address, undefined, apiKey) },
    });

    await client.handshake();
    const did = await client.authenticate(createEthAuthInput(address));
    log.did = did.value;
    (log.phases as unknown[]).push({ phase: "authenticate", ok: true });

    const usage = await client.getUsage({ limit: 5 });
    (log.phases as unknown[]).push({ phase: "getUsage", ok: true, responseHash: sha256Json(usage) });

    let selfAddress: string | null | undefined;
    let selfAddressError: string | undefined;
    try {
      selfAddress = await client.getSelfEthAddress();
      (log.phases as unknown[]).push({ phase: "getSelfEthAddress", ok: true, addressHash: selfAddress ? sha256Json(selfAddress) : null });
    } catch (error) {
      selfAddressError = sanitizeProbeError(error, [apiKey, address]);
      (log.phases as unknown[]).push({ phase: "getSelfEthAddress", ok: false, error: selfAddressError });
    }

    let walletPrimary: string | null | undefined;
    let walletSecondary: string[] = [];
    let walletError: string | undefined;
    let walletHistoryHash: string | undefined;
    try {
      const wallets = await client.listUserWallets();
      walletPrimary = wallets.primary;
      walletSecondary = wallets.secondary ?? [];
      (log.phases as unknown[]).push({
        phase: "listUserWallets",
        ok: true,
        primaryAddressHash: walletPrimary ? sha256Json(walletPrimary) : null,
        secondaryCount: walletSecondary.length,
      });
      const historyAddress = walletPrimary ?? selfAddress ?? address;
      const history = await client.getWalletHistory(historyAddress);
      walletHistoryHash = sha256Json(history);
      (log.phases as unknown[]).push({ phase: "getWalletHistory", ok: true, historyHash: walletHistoryHash });
    } catch (error) {
      walletError = sanitizeProbeError(error, [apiKey, address, selfAddress ?? undefined]);
      (log.phases as unknown[]).push({ phase: "wallet", ok: false, error: walletError });
    }

    let humanIdentity = summarizeIdentityStatus({ ok: false, error: "not run" });
    try {
      const status = await client.kycStatus();
      humanIdentity = summarizeIdentityStatus({
        ok: true,
        status: status.status,
        provider: status.provider,
        vcIds: status.vcIds,
        updatedAt: status.updatedAt,
      });
      (log.phases as unknown[]).push({ phase: "human-identity-status", ok: true, summary: humanIdentity });
    } catch (error) {
      humanIdentity = summarizeIdentityStatus({ ok: false, error: sanitizeProbeError(error, [apiKey, address, selfAddress ?? undefined]) });
      (log.phases as unknown[]).push({ phase: "human-identity-status", ok: false, summary: humanIdentity });
    }

    let auditRead: { ok: boolean; batchCount?: number; eventCount?: number; responseHash?: string; error?: string };
    try {
      const auditPage = await client.getAuditEvents({ limit: 5 });
      auditRead = { ok: true, ...countAuditEvents(auditPage), responseHash: sha256Json(auditPage) };
      (log.phases as unknown[]).push({ phase: "getAuditEvents", ...auditRead });
    } catch (error) {
      auditRead = { ok: false, error: sanitizeProbeError(error, [apiKey, address, selfAddress ?? undefined]) };
      (log.phases as unknown[]).push({ phase: "getAuditEvents", ...auditRead });
    }

    const receipt = buildSdkBreadthReceipt({
      issuedAt: new Date().toISOString(),
      sdkVersion: "3.5.2",
      environment: getEnvironmentName(),
      nodeUrl: getNodeUrl(),
      did: did.value,
      auth: { ok: true, address },
      usage: { ok: true, responseHash: sha256Json(usage), balanceAvailable: balanceAvailable(usage) },
      wallet: {
        ok: !walletError,
        primary: walletPrimary ?? selfAddress,
        secondary: walletSecondary,
        historyHash: walletHistoryHash,
        error: walletError,
      },
      humanIdentity,
      auditRead,
    });

    const evidenceHits = forbiddenSdkBreadthEvidenceHits(receipt);
    log.receipt = receipt;
    log.evidenceBoundary = { ok: evidenceHits.length === 0, hits: evidenceHits };
    log.completedAt = new Date().toISOString();
    writeJson(logPath, log);

    if (evidenceHits.length > 0) {
      throw new Error(`SDK breadth receipt failed boundary scan: ${evidenceHits.join(", ")}`);
    }

    const handle = writeReceipt("live-submitted", receipt);
    console.log(JSON.stringify({ ok: true, logPath, receipt: handle, surfaces: receipt.surfaces, boundaries: receipt.boundaries }, null, 2));
  } catch (error) {
    const failure = {
      schema: "leonardo.t3n.sdk-breadth-receipt.v0.1",
      issuedAt: new Date().toISOString(),
      status: "live-failed",
      environment: getEnvironmentName(),
      nodeUrl: getNodeUrl(),
      error: sanitizeProbeError(error, [process.env.T3N_API_KEY]),
    };
    log.fatal = failure.error;
    log.completedAt = new Date().toISOString();
    writeJson(logPath, log);
    const handle = writeReceipt("live-failed", failure);
    console.log(JSON.stringify({ ok: false, logPath, receipt: handle, fatal: failure.error }, null, 2));
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import {
  T3nClient,
  TenantClient,
  createEthAuthInput,
  eth_get_address,
  getEnvironmentName,
  getNodeUrl,
  getScriptVersion,
  loadWasmComponent,
  metamask_sign,
  setEnvironment,
} from "@terminal3/t3n-sdk";
import { bindAuditEvent, sha256Json } from "../audit.js";
import { buildAgentPassport } from "../passport.js";
import { decideProtectedAction } from "../protected-action.js";
import { buildActionReceipt } from "../receipt.js";
import { requireT3nApiKey } from "../t3n.js";

const ACTION = process.env.T3N_AUDIT_PROBE_ACTION ?? "agent-passport.audit-probe";
const TARGET = process.env.T3N_AUDIT_PROBE_TARGET ?? "terminal3.testnet.audit-probe";
const FUNCTION_NAME = "audit-ping";
const NODE_URL = "https://cn-api.sg.testnet.t3n.terminal3.io";

const startedAt = new Date();
const stamp = startedAt.toISOString().replace(/[-:.]/g, "").replace("T", "t").replace("Z", "z");
const defaultProbeVersion = "0.1.0";
const VERSION = process.env.T3N_AUDIT_PROBE_VERSION ?? defaultProbeVersion;
const requestId = `req-audit-${stamp}`;
const defaultTail = `ap-audit-${startedAt.getTime().toString(36)}`;
const tail = process.env.T3N_AUDIT_PROBE_TAIL ?? defaultTail;
const logPath = join("logs", `t3n-live-audit-probe-${stamp}.json`);
const wasmInputPath = process.env.T3N_AUDIT_PROBE_WASM ?? "../repos/z-audit-probe/target/wasm32-wasip2/release/z_audit_probe.wasm";

function sha256Hex(bytes: string | Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function sanitizeError(error: unknown, apiKey?: string): string {
  const raw = error instanceof Error ? `${error.name}: ${error.message}` : JSON.stringify(error);
  return (apiKey ? raw.split(apiKey).join("[REDACTED_T3N_API_KEY]") : raw).slice(0, 2000);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}

function writeLog(payload: unknown) {
  mkdirSync("logs", { recursive: true });
  writeFileSync(logPath, `${JSON.stringify(payload, null, 2)}\n`);
}

async function main() {
  const apiKey = requireT3nApiKey();
  setEnvironment("testnet");
  const wasmComponent = await loadWasmComponent();
  const address = eth_get_address(apiKey);
  const client = new T3nClient({
    wasmComponent,
    handlers: {
      EthSign: metamask_sign(address, undefined, apiKey),
    },
  });

  const publicLog: Record<string, unknown> = {
    startedAt: startedAt.toISOString(),
    environment: getEnvironmentName(),
    nodeUrl: getNodeUrl(),
    intendedNodeUrl: NODE_URL,
    requestId,
    action: ACTION,
    target: TARGET,
    amountCents: 0,
    pii: false,
    contract: {
      sourceDir: "../repos/z-audit-probe",
      wasm: wasmInputPath,
      wasmSha256: null,
      tail,
      version: VERSION,
      functionName: FUNCTION_NAME,
    },
    phases: [],
  };

  try {
    const wasmPath = resolve(wasmInputPath);
    const wasm = readFileSync(wasmPath);
    (publicLog.contract as Record<string, unknown>).wasmSha256 = sha256Hex(wasm);

    await client.handshake();
    const did = await client.authenticate(createEthAuthInput(address));
    const didValue = did.value;
    publicLog.did = didValue;
    publicLog.address = address;
    (publicLog.phases as unknown[]).push({ phase: "authenticate", ok: true });

    const tenant = new TenantClient({
      t3n: client,
      baseUrl: getNodeUrl(),
      endpoint: getNodeUrl(),
      tenantDid: didValue,
      environment: "testnet",
    });

    let tenantMe: unknown = null;
    try {
      tenantMe = await tenant.tenant.me();
    } catch (error) {
      tenantMe = { error: sanitizeError(error, apiKey) };
    }
    publicLog.tenantMe = tenantMe;

    const registerResult = await tenant.contracts.register({ tail, version: VERSION, wasm });
    publicLog.register = {
      ok: true,
      resultHash: sha256Json(registerResult),
      result: registerResult,
    };
    (publicLog.phases as unknown[]).push({ phase: "register", ok: true });

    const tenantId = didValue.slice("did:t3n:".length);
    const scriptName = `z:${tenantId}:${tail}`;
    publicLog.scriptName = scriptName;

    let scriptVersion = VERSION;
    try {
      scriptVersion = await getScriptVersion(getNodeUrl(), scriptName);
    } catch (error) {
      publicLog.scriptVersionLookup = { ok: false, error: sanitizeError(error, apiKey), fallback: VERSION };
    }
    publicLog.scriptVersion = scriptVersion;

    const executeInput = {
      requestId,
      action: ACTION,
      target: TARGET,
      ...(process.env.T3N_AUDIT_PROBE_SUBJECT_HASH ? { subjectHash: process.env.T3N_AUDIT_PROBE_SUBJECT_HASH } : {}),
      ...(process.env.T3N_AUDIT_PROBE_ANCHOR_KIND ? { anchorKind: process.env.T3N_AUDIT_PROBE_ANCHOR_KIND } : {})
    };
    const passport = buildAgentPassport({
      agentName: "leonardo-protected-action-agent",
      agentDid: didValue,
      issuer: didValue,
      issuedAt: startedAt.toISOString(),
      expiresAt: new Date(startedAt.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      authority: {
        allowedActions: [ACTION],
        allowedTargets: [TARGET],
        maxAmountCents: 0,
        currency: "USD",
        piiMode: "placeholder-only",
      },
    });
    const request = {
      action: ACTION,
      target: TARGET,
      amountCents: 0,
      currency: "USD",
      piiRefs: [] as string[],
      purpose: "Terminal 3 no-money/no-PII audit-probe invocation",
      t3n: {
        scriptName,
        scriptVersion,
        functionName: FUNCTION_NAME,
        input: executeInput,
      },
    };
    const decision = decideProtectedAction(passport, request, {
      now: new Date().toISOString(),
      requestId,
      trustedIssuerDids: [didValue],
    });
    if (!decision.allowed) {
      throw new Error(`local protected-action gate refused audit probe: ${decision.reason}`);
    }

    let executeResult: unknown;
    try {
      executeResult = await client.executeAndDecode({
        script_name: scriptName,
        script_version: scriptVersion,
        function_name: FUNCTION_NAME,
        input: executeInput,
      });
      publicLog.execute = {
        ok: true,
        responseHash: sha256Json(executeResult),
        response: executeResult,
      };
      (publicLog.phases as unknown[]).push({ phase: "execute", ok: true });
    } catch (error) {
      const receipt = buildActionReceipt({
        passport,
        request,
        decision,
        issuedAt: new Date().toISOString(),
        t3n: {
          environment: getEnvironmentName(),
          nodeUrl: getNodeUrl(),
          status: "live-failed",
          did: didValue,
          error: sanitizeError(error, apiKey),
        },
      });
      mkdirSync("receipts", { recursive: true });
      const receiptPath = join("receipts", `live_audit_probe-${requestId}-failed.json`);
      writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);
      publicLog.execute = { ok: false, error: sanitizeError(error, apiKey) };
      publicLog.receipt = {
        path: receiptPath,
        basename: basename(receiptPath),
        status: receipt.evidence.t3n.status,
        receiptHash: receipt.receiptHash,
        wholeFileSha256: sha256Hex(readFileSync(receiptPath)),
      };
      publicLog.completedAt = new Date().toISOString();
      writeLog(publicLog);
      console.log(JSON.stringify({ ok: false, logPath, receipt: publicLog.receipt, error: publicLog.execute }, null, 2));
      return;
    }

    let auditPage: unknown = null;
    let binding = null;
    for (let attempt = 1; attempt <= 6; attempt += 1) {
      await sleep(attempt === 1 ? 1000 : 2500);
      auditPage = await client.getAuditEvents({ limit: 10 });
      binding = bindAuditEvent(auditPage as Parameters<typeof bindAuditEvent>[0], {
        action: ACTION,
        target: TARGET,
        requestId,
        requireCommitted: true,
      });
      publicLog.auditPoll = {
        attempt,
        pageHash: sha256Json(auditPage),
        batchCount: Array.isArray((auditPage as { batches?: unknown[] }).batches) ? (auditPage as { batches: unknown[] }).batches.length : null,
        binding,
      };
      if (binding) {
        break;
      }
    }

    const status = binding ? "live-audited" : "live-failed";
    const receipt = buildActionReceipt({
      passport,
      request,
      decision,
      issuedAt: new Date().toISOString(),
      t3n: binding
        ? {
            environment: getEnvironmentName(),
            nodeUrl: getNodeUrl(),
            status,
            did: didValue,
            auditEventId: binding.auditEventId,
            auditBatchKey: binding.auditBatchKey,
            auditEventHash: binding.auditEventHash,
            auditEventCommitted: binding.committed,
            responseHash: sha256Json(executeResult),
          }
        : {
            environment: getEnvironmentName(),
            nodeUrl: getNodeUrl(),
            status,
            did: didValue,
            responseHash: sha256Json(executeResult),
            error: "audit probe executed but getAuditEvents did not return a committed matching event within 6 polls",
          },
    });

    mkdirSync("receipts", { recursive: true });
    const receiptPath = join("receipts", `live_audit_probe-${requestId}-${status}.json`);
    writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);
    publicLog.auditPageHash = auditPage ? sha256Json(auditPage) : null;
    publicLog.receipt = {
      path: receiptPath,
      basename: basename(receiptPath),
      status: receipt.evidence.t3n.status,
      receiptHash: receipt.receiptHash,
      auditEventId: receipt.evidence.t3n.auditEventId,
      auditBatchKey: receipt.evidence.t3n.auditBatchKey,
      auditEventHash: receipt.evidence.t3n.auditEventHash,
      wholeFileSha256: sha256Hex(readFileSync(receiptPath)),
    };
    publicLog.completedAt = new Date().toISOString();
    writeLog(publicLog);
    console.log(JSON.stringify({ ok: Boolean(binding), logPath, receipt: publicLog.receipt, auditPoll: publicLog.auditPoll }, null, 2));
  } catch (error) {
    publicLog.fatal = sanitizeError(error, process.env.T3N_API_KEY);
    publicLog.completedAt = new Date().toISOString();
    writeLog(publicLog);
    console.log(JSON.stringify({ ok: false, logPath, fatal: publicLog.fatal }, null, 2));
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});

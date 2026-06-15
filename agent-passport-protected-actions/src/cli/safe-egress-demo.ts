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
import { decideProtectedAction, type ProtectedActionRequest } from "../protected-action.js";
import { buildActionReceipt, type ActionReceipt, type T3nEvidence } from "../receipt.js";
import {
  SAFE_EGRESS_ACTION,
  SAFE_EGRESS_ALLOWED_HOST,
  SAFE_EGRESS_ALLOWED_URL,
  SAFE_EGRESS_CONTRACT_VERSION,
  SAFE_EGRESS_TARGET,
  SAFE_EGRESS_WASM_PATH,
  buildSafeEgressContractInput,
  edgeReceiptName,
  executePayloadFromAllowedDecision,
  forbiddenEvidenceHits,
  sanitizeLiveError,
  sha256HexBytes,
  type SafeEgressEdge,
} from "../safe-egress.js";
import { requireT3nApiKey } from "../t3n.js";

const startedAt = new Date();
const stamp = startedAt.toISOString().replace(/[-:.]/g, "").replace("T", "t").replace("Z", "z");
const outDir = "receipts";
const logDir = "logs";
const logPath = join(logDir, `t3n-safe-egress-${stamp}.json`);
const defaultTail = `ap-egress-${startedAt.getTime().toString(36)}`;
const tail = process.env.T3N_SAFE_EGRESS_TAIL ?? defaultTail;
const allowedUrl = process.env.T3N_SAFE_EGRESS_ALLOWED_URL ?? SAFE_EGRESS_ALLOWED_URL;
const allowedHost = process.env.T3N_SAFE_EGRESS_ALLOWED_HOST ?? SAFE_EGRESS_ALLOWED_HOST;
const wasmInputPath = process.env.T3N_SAFE_EGRESS_WASM ?? SAFE_EGRESS_WASM_PATH;

type PublicLog = Record<string, unknown> & { phases: unknown[] };

function sleep(ms: number): Promise<void> {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}

function writeJson(path: string, payload: unknown) {
  writeFileSync(path, `${JSON.stringify(payload, null, 2)}\n`);
}

function writeLog(payload: unknown) {
  mkdirSync(logDir, { recursive: true });
  writeJson(logPath, payload);
}

function makePassport(didValue: string) {
  return buildAgentPassport({
    agentName: "leonardo-safe-egress-agent",
    agentDid: didValue,
    issuer: didValue,
    issuedAt: startedAt.toISOString(),
    expiresAt: new Date(startedAt.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    authority: {
      allowedActions: [SAFE_EGRESS_ACTION],
      allowedTargets: [SAFE_EGRESS_TARGET],
      maxAmountCents: 0,
      currency: "USD",
      piiMode: "placeholder-only",
    },
  });
}

function makeRequest(args: {
  requestId: string;
  scriptName: string;
  scriptVersion: string;
  functionName: "ping-allowed" | "ping-placeholder-denial";
  url: string;
  piiRefs?: string[];
}): ProtectedActionRequest {
  return {
    action: SAFE_EGRESS_ACTION,
    target: SAFE_EGRESS_TARGET,
    amountCents: 0,
    currency: "USD",
    piiRefs: args.piiRefs ?? [],
    purpose: "Terminal 3 no-money/no-raw-PII safe egress extension",
    t3n: {
      scriptName: args.scriptName,
      scriptVersion: args.scriptVersion,
      functionName: args.functionName,
      input: buildSafeEgressContractInput({
        requestId: args.requestId,
        url: args.url,
        action: SAFE_EGRESS_ACTION,
        target: SAFE_EGRESS_TARGET,
      }),
    },
  };
}

function writeReceipt(edge: SafeEgressEdge, requestId: string, receipt: ActionReceipt) {
  mkdirSync(outDir, { recursive: true });
  const path = join(outDir, edgeReceiptName(edge, requestId, receipt.evidence.t3n.status));
  writeJson(path, receipt);
  return {
    path,
    basename: basename(path),
    status: receipt.evidence.t3n.status,
    receiptHash: receipt.receiptHash,
    auditEventId: receipt.evidence.t3n.auditEventId,
    auditEventHash: receipt.evidence.t3n.auditEventHash,
    wholeFileSha256: sha256HexBytes(readFileSync(path)),
  };
}

async function pollAudit(client: T3nClient, requestId: string) {
  let auditPage: unknown = null;
  let binding = null;
  for (let attempt = 1; attempt <= 6; attempt += 1) {
    await sleep(attempt === 1 ? 1000 : 2500);
    auditPage = await client.getAuditEvents({ limit: 20 });
    binding = bindAuditEvent(auditPage as Parameters<typeof bindAuditEvent>[0], {
      action: SAFE_EGRESS_ACTION,
      target: SAFE_EGRESS_TARGET,
      requestId,
      requireCommitted: true,
    });
    if (binding) {
      return { binding, auditPageHash: sha256Json(auditPage), attempt };
    }
  }
  return { binding, auditPageHash: auditPage ? sha256Json(auditPage) : null, attempt: 6 };
}

async function main() {
  const apiKey = requireT3nApiKey();
  setEnvironment("testnet");
  mkdirSync(outDir, { recursive: true });

  const wasmPath = resolve(wasmInputPath);
  const wasm = readFileSync(wasmPath);
  const wasmSha256 = sha256HexBytes(wasm);
  const wasmComponent = await loadWasmComponent();
  const address = eth_get_address(apiKey);
  const client = new T3nClient({
    wasmComponent,
    handlers: {
      EthSign: metamask_sign(address, undefined, apiKey),
    },
  });

  const publicLog: PublicLog = {
    startedAt: startedAt.toISOString(),
    environment: getEnvironmentName(),
    nodeUrl: getNodeUrl(),
    action: SAFE_EGRESS_ACTION,
    target: SAFE_EGRESS_TARGET,
    amountCents: 0,
    pii: false,
    rawPiiReturned: false,
    moneyMovement: false,
    contract: {
      sourceDir: "../repos/z-safe-egress-demo",
      wasm: wasmInputPath,
      wasmSha256,
      tail,
      version: SAFE_EGRESS_CONTRACT_VERSION,
      allowedHost,
      allowedUrl,
      functions: ["ping-allowed", "ping-placeholder-denial"],
    },
    phases: [],
  };

  try {
    await client.handshake();
    const did = await client.authenticate(createEthAuthInput(address));
    const didValue = did.value;
    publicLog.did = didValue;
    publicLog.address = address;
    publicLog.phases.push({ phase: "authenticate", ok: true });

    const tenant = new TenantClient({
      t3n: client,
      baseUrl: getNodeUrl(),
      endpoint: getNodeUrl(),
      tenantDid: didValue,
      environment: "testnet",
    });

    const registerResult = await tenant.contracts.register({ tail, version: SAFE_EGRESS_CONTRACT_VERSION, wasm });
    publicLog.register = { ok: true, resultHash: sha256Json(registerResult) };
    publicLog.phases.push({ phase: "register", ok: true });

    const tenantId = didValue.slice("did:t3n:".length);
    const scriptName = `z:${tenantId}:${tail}`;
    let scriptVersion = SAFE_EGRESS_CONTRACT_VERSION;
    try {
      scriptVersion = await getScriptVersion(getNodeUrl(), scriptName);
    } catch (error) {
      publicLog.scriptVersionLookup = {
        ok: false,
        error: sanitizeLiveError(error, [apiKey]),
        fallback: SAFE_EGRESS_CONTRACT_VERSION,
      };
    }
    publicLog.scriptName = scriptName;
    publicLog.scriptVersion = scriptVersion;

    const passport = makePassport(didValue);
    const trustedIssuerDids = [didValue];

    const executeEdge = async (edge: SafeEgressEdge, functionName: "ping-allowed" | "ping-placeholder-denial", requestId: string, piiRefs: string[] = []) => {
      const request = makeRequest({ requestId, scriptName, scriptVersion, functionName, url: allowedUrl, piiRefs });
      const decision = decideProtectedAction(passport, request, {
        now: new Date().toISOString(),
        requestId,
        trustedIssuerDids,
      });
      if (!decision.allowed) {
        throw new Error(`local protected-action gate refused ${edge}: ${decision.reason}`);
      }
      try {
        const response = await client.executeAndDecode(executePayloadFromAllowedDecision(decision));
        return { request, decision, response, responseHash: sha256Json(response) };
      } catch (error) {
        const evidence: T3nEvidence = {
          environment: getEnvironmentName(),
          nodeUrl: getNodeUrl(),
          status: "live-failed",
          did: didValue,
          error: sanitizeLiveError(error, [apiKey]),
        };
        const receipt = buildActionReceipt({ passport, request, decision, t3n: evidence, issuedAt: new Date().toISOString() });
        const handle = writeReceipt(edge, requestId, receipt);
        return { request, decision, error: evidence.error, receipt, handle };
      }
    }

    const deniedRequestId = `req-egress-denied-${stamp}`;
    const denied = await executeEdge("denied-egress", "ping-allowed", deniedRequestId);
    if ("response" in denied) {
      throw new Error("expected egress denial before self-grant, but ping-allowed succeeded");
    }
    publicLog.deniedEgress = denied.handle;
    publicLog.phases.push({ phase: "denied-egress", ok: true, receipt: denied.handle });

    const userContractVersion = await getScriptVersion(getNodeUrl(), "tee:user/contracts");
    const grantInput = {
      agents: [{
        agentDid: didValue,
        scripts: [{
          scriptName,
          versionReq: scriptVersion,
          functions: ["ping-allowed", "ping-placeholder-denial"],
          allowedHosts: [allowedHost],
        }],
      }],
    };
    const grantResult = await client.executeAndDecode({
      script_name: "tee:user/contracts",
      script_version: userContractVersion,
      function_name: "agent-auth-update",
      input: grantInput,
    });
    publicLog.selfGrant = { ok: true, inputHash: sha256Json(grantInput), resultHash: sha256Json(grantResult) };
    publicLog.phases.push({ phase: "self-grant", ok: true });

    const placeholderRequestId = `req-placeholder-denied-${stamp}`;
    const placeholderDenied = await executeEdge(
      "placeholder-denial",
      "ping-placeholder-denial",
      placeholderRequestId,
      ["{{profile.__leonardo_forbidden_demo_field}}"],
    );
    if ("response" in placeholderDenied) {
      throw new Error("expected placeholder denial, but ping-placeholder-denial succeeded");
    }
    publicLog.placeholderDenial = placeholderDenied.handle;
    publicLog.phases.push({ phase: "placeholder-denial", ok: true, receipt: placeholderDenied.handle });

    const allowedRequestId = `req-egress-allowed-${stamp}`;
    const allowed = await executeEdge("allowed-egress", "ping-allowed", allowedRequestId);
    if (!("response" in allowed)) {
      throw new Error(`expected allowed egress after self-grant, got ${allowed.error}`);
    }
    const audit = await pollAudit(client, allowedRequestId);
    const allowedEvidence: T3nEvidence = audit.binding
      ? {
          environment: getEnvironmentName(),
          nodeUrl: getNodeUrl(),
          status: "live-audited",
          did: didValue,
          auditEventId: audit.binding.auditEventId,
          auditBatchKey: audit.binding.auditBatchKey,
          auditEventHash: audit.binding.auditEventHash,
          auditEventCommitted: audit.binding.committed,
          responseHash: allowed.responseHash,
        }
      : {
          environment: getEnvironmentName(),
          nodeUrl: getNodeUrl(),
          status: "live-submitted",
          did: didValue,
          responseHash: allowed.responseHash,
          error: "safe egress executed but getAuditEvents did not return a committed matching event within 6 polls",
        };
    const allowedReceipt = buildActionReceipt({
      passport,
      request: allowed.request,
      decision: allowed.decision,
      t3n: allowedEvidence,
      issuedAt: new Date().toISOString(),
    });
    const allowedHandle = writeReceipt("allowed-egress", allowedRequestId, allowedReceipt);
    publicLog.allowedEgress = {
      receipt: allowedHandle,
      responseHash: allowed.responseHash,
      response: allowed.response,
      audit,
    };
    publicLog.phases.push({ phase: "allowed-egress", ok: true, receipt: allowedHandle });

    const evidenceHits = forbiddenEvidenceHits(publicLog);
    publicLog.evidenceBoundary = { ok: evidenceHits.length === 0, hits: evidenceHits };
    publicLog.completedAt = new Date().toISOString();
    writeLog(publicLog);

    if (evidenceHits.length > 0) {
      throw new Error(`safe-egress log failed boundary scan: ${evidenceHits.join(", ")}`);
    }

    console.log(JSON.stringify({
      ok: true,
      logPath,
      contract: publicLog.contract,
      deniedEgress: publicLog.deniedEgress,
      placeholderDenial: publicLog.placeholderDenial,
      allowedEgress: publicLog.allowedEgress,
      evidenceBoundary: publicLog.evidenceBoundary,
    }, null, 2));
  } catch (error) {
    publicLog.fatal = sanitizeLiveError(error, [process.env.T3N_API_KEY]);
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

import { createHash } from "node:crypto";

export interface T3nAuditEvent {
  ts_ms: number;
  subject: string;
  actor: string;
  vc_id?: string | null;
  action: string;
  target: string;
  outcome: string;
  details?: string | null;
}

export interface T3nAuditBatch {
  key: string;
  committed: boolean;
  events: T3nAuditEvent[];
}

export interface T3nAuditPage {
  batches: T3nAuditBatch[];
  next_cursor?: string | null;
}

export interface AuditBindingQuery {
  action: string;
  target: string;
  requestId?: string;
  requireCommitted?: boolean;
}

export interface AuditEventBinding {
  auditEventId: string;
  auditBatchKey: string;
  auditEventHash: string;
  committed: boolean;
  subject: string;
  actor: string;
  vcId?: string | null;
  action: string;
  target: string;
  outcome: string;
  detailsHash?: string;
}

export function canonicalJson(value: unknown): string {
  return JSON.stringify(canonicalize(value));
}

export function sha256Json(value: unknown): string {
  return `sha256:${createHash("sha256").update(canonicalJson(value)).digest("hex")}`;
}

export function bindAuditEvent(page: T3nAuditPage, query: AuditBindingQuery): AuditEventBinding | null {
  for (const batch of page.batches ?? []) {
    if (query.requireCommitted && !batch.committed) {
      continue;
    }
    for (const event of batch.events ?? []) {
      if (event.action !== query.action || event.target !== query.target) {
        continue;
      }
      const parsedDetails = parseDetails(event.details);
      if (query.requestId) {
        if (!isRecord(parsedDetails) || parsedDetails.requestId !== query.requestId) {
          continue;
        }
      }
      const auditEventHash = sha256Json(event);
      return {
        auditEventId: `${batch.key}:${auditEventHash}`,
        auditBatchKey: batch.key,
        auditEventHash,
        committed: batch.committed,
        subject: event.subject,
        actor: event.actor,
        vcId: event.vc_id,
        action: event.action,
        target: event.target,
        outcome: event.outcome,
        detailsHash: event.details ? sha256Json(parsedDetails) : undefined,
      };
    }
  }
  return null;
}

function canonicalize(value: unknown): unknown {
  if (value === null || typeof value !== "object") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => canonicalize(item));
  }
  const record = value as Record<string, unknown>;
  return Object.fromEntries(Object.keys(record).sort().map((key) => [key, canonicalize(record[key])]));
}

function parseDetails(details: string | null | undefined): unknown {
  if (!details) {
    return null;
  }
  try {
    return JSON.parse(details);
  } catch {
    return details;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

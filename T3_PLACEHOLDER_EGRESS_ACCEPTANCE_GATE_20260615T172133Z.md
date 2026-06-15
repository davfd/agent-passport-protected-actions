# Terminal 3 ADK extension — placeholder/egress acceptance gate

**Run token:** `T3_BOUNTY_MAX_LOOP_20260615T171622Z`  
**Gate stamp:** `20260615T172133Z`  
**Purpose:** one focused build spike that directly answers Terminal 3 ADK judge criteria without inventing authority.

## Build target

A no-money/no-raw-PII demo proving:

```text
user/data-owner grant + allowed host + http-with-placeholders + egress denial
```

Use `repos/z-tenant-flight` as the source seed because it already imports `host:interfaces/http-with-placeholders@2.1.0` and has booking error branches for egress/placeholder failures. It is **not** current evidence until built/run/receipted here.

## Non-negotiable red lines

- No real payment.
- No KYC/legal/governance authority claim.
- No production trust claim.
- No raw PII in stdout, logs, receipts, markdown, screenshots, or bundle.
- No API/private keys printed or committed.
- No broad action-surface claim unless each surface has a live receipt.

## Safe endpoint rule

Allowed endpoint must be one of:

1. A local mock endpoint under our control, if T3 testnet can reach it safely through a tunnel without secrets.
2. A benign echo endpoint configured not to receive real PII; use synthetic placeholder labels only if allowed by T3 grant/profile mechanics.
3. If no safe allowed endpoint exists, do not fake success. Record `PACKAGE_MAX` or `ASK_T3_SUPPORT`.

Denied endpoint should be a deliberately disallowed host in the invocation/grant configuration, not a random live service.

## Required proof edges

| Edge | Required receipt fields | Pass condition |
|---|---|---|
| Denied host | timestamp, contract tail/version/function, attempted host class, refusal code/string, sanitized raw error hash | refusal occurs before successful protected action; no secret/raw PII in detail |
| Placeholder denial | marker class, refusal code/string, sanitized raw error hash | unauthorized or unresolved marker refuses safely |
| Allowed host | timestamp, contract tail/version/function, safe host class, sanitized response hash, no raw placeholder value | scoped call succeeds only after grant/allowed host is present |
| Audit binding | audit event id/hash if `getAuditEvents` surfaces it; otherwise contract tx/hash/log reference | receipt ties call to T3 execution/audit path |
| Regression | automated checks over receipt JSON/markdown | no `.env`, `T3N_API_KEY`, private key, raw PII, payment, KYC/governance overclaim |

## Expected implementation surfaces

From SDK/type/docs inspection:

- `T3nClient`: `handshake`, `authenticate`, `execute`, `executeAndDecode`, `getAuditEvents`.
- `TenantClient`: `maps.create`, `contracts.register`, `contracts.execute`, `contracts.logs`, `executeControl`, `canonicalName`.
- Docs relevant to behavior:
  - `developers__adk__get-started__walkthrough__invoke-contract.md`
  - `developers__adk__tips__placeholders-outbound-calls.md`
  - `developers__adk__tips__outbound-http-auth-by-user.md`
  - `developers__adk__tips__create-kv-maps.md`
  - `developers__adk__tips__seed-api-key.md`

## One-day spike plan

1. Compile `repos/z-tenant-flight` and inspect its WIT/imports.
2. Confirm whether existing credentials/testnet can register or execute a tenant contract without printing secrets.
3. Add a local CLI/receipt harness under `agent-passport-protected-actions` or a dedicated `max-extension/` directory.
4. Implement normalization for:
   - denied egress receipt;
   - placeholder denial receipt;
   - allowed sanitized receipt;
   - audit binding / fallback reference.
5. Run tests and live calls if safe.
6. If live call fails ambiguously, stop and produce `ASK_T3_SUPPORT` with exact repro.

## Stop rules

| Condition | Action |
|---|---|
| SDK/docs/API ambiguity blocks grant/placeholder path | write exact T3 support question; do not fake |
| live allowed path would require real PII/API key/payment | stop and package current evidence |
| denial path cannot be proven | no extension claim |
| secret or raw PII appears in any artifact | delete/redact and mark BLOCK until clean |
| one focused attempt exceeds a day with no receipt | PACKAGE_MAX, not endless tinkering |

## Claim language if pass

Allowed:

```text
We added a bounded Terminal 3 testnet extension showing scoped outbound-action control: a disallowed host/placeholder path refuses, while a scoped safe-host path succeeds, with sanitized receipts and audit/log binding. No money, no raw PII, no production/KYC/legal authority is claimed.
```

Forbidden:

```text
Production governance, real KYC, real payments, legal authority, raw PII processing, or generalized external audit coverage.
```

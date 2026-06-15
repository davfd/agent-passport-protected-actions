# Terminal 3 ADK bounty — 90-second judge walkthrough

Purpose: fast demo/video or screenshot script that improves judge comprehension without changing claims.

## Rules for recording

```text
Do not show .env files.
Do not show T3N_API_KEY or private keys.
Do not claim production trust, real payment flow, KYC, legal authority, raw PII flow, or recognized external governance.
Keep the proof bounded: testnet, no money, no raw PII, live tenant-contract audit event, receipts.
```

## 90-second narration

### 0–10 sec — Problem / hook

**Show:** `SUBMISSION_FORM_FIELDS.md` project name + tagline.  
**Say:**

```text
This is Agent Passport for Protected Actions: a Terminal-3-native trust envelope for AI-agent actions. The question is not just can the agent act, but who is acting, under what scope, what refuses, and what receipt remains.
```

### 10–25 sec — Criteria map

**Show:** `SUBMISSION_PACKET.md` lines “Why it fits the bounty” / chain diagram.  
**Say:**

```text
The DoraHacks criteria ask for completeness, Agent Auth SDK integration, and creativity. This build uses a T3 DID-shaped passport, scoped authority gates, Terminal 3 testnet SDK calls, a WASM tenant contract, and audit receipts.
```

### 25–40 sec — Green verification

**Show:** terminal or saved log for `pnpm verify` and `pnpm registry:demo`.  
**Say:**

```text
The local verifier passes: 13 test files, 52 tests, typecheck, build, and demo receipts. The registry demo refuses when required evidence is missing and allows only when policy, signed grant, witness, and external registry anchor match.
```

### 40–55 sec — Refusal before payload

**Show:** refused receipt example, e.g. `demo_external_registry_missing-...-refused.json`.  
**Say:**

```text
The important safety behavior is pre-execution refusal. Missing or mismatched scope, issuer, revocation, delegation, policy, witness, or registry evidence refuses before a protected action payload is created.
```

### 55–70 sec — Live Terminal 3 audit proof

**Show:** `live_audit_probe-...-live-audited.json` and audit event fields.  
**Say:**

```text
The live claim is deliberately bounded. On Terminal 3 testnet, a no-money/no-PII tenant contract emitted a committed host-stamped audit event. The Agent Passport receipt binds that audit event by ID and hash.
```

### 70–80 sec — DevRel/bug lane

**Show:** `BUGS_AND_DOC_GAPS_RULE_COMPLIANT_APPENDIX_20260615T191349Z.md` summary count + first few findings.  
**Say:**

```text
The submission also includes a developer-experience report: 11 countable SDK/docs findings, each with reproduction, observed/expected behavior, and required code/docs fix framing.
```

### 80–90 sec — Safe boundary / close

**Show:** safe claim boundary in `SUBMISSION_FORM_FIELDS.md`.  
**Say:**

```text
This is testnet, no money, no raw PII. It proves scoped gates, Terminal 3 audit-event binding, and tamper-evident receipts. It does not claim production trust, legal authority, KYC, payment movement, or raw-PII flow.
```

## Screenshot checklist

Take 7 screenshots if video is too slow:

```text
1. DoraHacks criteria excerpt: completeness / SDK integration / creativity / bug-doc lane.
2. SUBMISSION_FORM_FIELDS.md tagline + safe claim boundary.
3. pnpm verify green log.
4. refused receipt: missing external registry anchor refused before payload.
5. allowed receipt: policy + signed grant + governance witness + external registry anchor allowed.
6. live-audited Terminal 3 receipt with auditEventCommitted=true and audit hash fields.
7. BUGS_AND_DOC_GAPS_RULE_COMPLIANT_APPENDIX_20260615T191349Z.md summary count: 11 findings.
```

## One-line caption for upload

```text
90-sec walkthrough: T3 DID Agent Passport, scoped pre-execution refusal, live no-money/no-PII Terminal 3 tenant-contract audit event, receipt binding, and 11-count DevRel/docs findings — with explicit no-production/no-KYC/no-payment/no-raw-PII boundary.
```

## If asked “what makes this creative?”

```text
It turns Terminal 3's identity, authorization, TEE contract, and audit-event primitives into a reusable agent accountability envelope: identity + scope + evidence gates + refusal + receipts, rather than another unconstrained tool-calling demo.
```

# Terminal 3 ADK bounty — 90-second judge walkthrough

Purpose: make the project obvious to a cold judge.

## Rules for recording

```text
Do not show .env files.
Do not show T3N_API_KEY or private keys.
Do not claim production trust, real payment flow, KYC, legal authority, raw PII flow, or recognized external governance.
Keep the proof bounded: testnet, no money, no raw PII, live tenant-contract audit event, receipts.
```

## 90-second narration

### 0-15 sec — Hook

Show `README.md` first screen.

Say:

```text
This is a safe checkout demo for AI agents. A finance team wants an AI assistant to handle routine vendor payments, but the agent should not get unlimited spend access. Here, a $425 test payment is allowed, a $650 payment is refused, and missing delegation is refused before any payload is created.
```

### 15-30 sec — Local demo

Show `pnpm verify` or `pnpm demo:local` output.

Say:

```text
The local demo writes four receipts: allowed under cap, refused over cap, refused because delegation is missing, and allowed when the matching delegation grant is present.
```

### 30-45 sec — Gate code

Show `src/protected-action.ts`.

Say:

```text
This is the key safety behavior. The request must match the agent passport: action, target, amount, currency, issuer, revocation status, delegation, policy, witness, and registry evidence. If a required check fails, the function returns refused and no Terminal 3 execute payload exists.
```

### 45-60 sec — Terminal 3 proof

Show a live-audited receipt.

Say:

```text
The live claim is deliberately bounded. On Terminal 3 testnet, a no-money/no-PII tenant contract emitted a committed host-stamped audit event. The receipt binds that audit event by ID and hash.
```

### 60-75 sec — Safe egress

Show safe-egress receipts.

Say:

```text
The safe-egress path proves the same idea for outbound data: egress is denied before grant, scoped to one host after grant, placeholder failure returns no raw PII, and the allowed edge is audited.
```

### 75-90 sec — Close

Show safe claim boundary in `SUBMISSION_FORM_FIELDS.md`.

Say:

```text
This is testnet only. It proves scoped gates, refusal before execution, Terminal 3 audit binding, and receipts. It does not claim production trust, legal authority, KYC, real payment movement, or raw PII flow.
```

## Screenshot checklist

```text
1. README first screen: safe AI checkout story.
2. pnpm verify green log: 13 test files / 52 tests.
3. demo_allowed-allowed.json: $425 allowed.
4. demo_refused_over_cap-refused.json: $650 refused against $500 cap.
5. demo_delegated_missing_grant-refused.json: missing delegation refused.
6. live_audit_probe receipt with auditEventCommitted=true.
7. safe-egress allowed receipt with auditEventCommitted=true and rawPiiReturned=false.
```

## One-line caption for upload

```text
Safe AI checkout on Terminal 3: $425 allowed, $650 refused, missing delegation refused, live no-money/no-PII audit receipts, scoped safe egress, and explicit no-production/no-KYC/no-real-payment boundary.
```

# Terminal 3 ADK bounty — Agent Passport checkout demo

## Project

```text
Agent Passport for Protected Actions
```

## One-line pitch

```text
A safe AI checkout assistant for Terminal 3: $425 test payment intent allowed, $650 over-cap attempt refused, missing delegation refused, matching delegation allowed, with receipts for every decision.
```

## What this is

Finance and ops teams want AI agents to handle routine buying and checkout. Manual approval is slow. Full autonomy is reckless.

This build shows the middle path: an agent can act only when its passport, amount cap, target, consent/delegation, policy evidence, and Terminal 3 audit boundary all line up. If something is missing or out of scope, the action is refused before the Terminal 3 payload is created.

The local demo uses a payment-intent shaped checkout flow:

```text
$425 test payment intent to approved merchant: allowed
$650 test payment intent when the cap is $500: refused
consent-required payment with no delegation grant: refused
same payment with matching delegation grant: allowed
```

The live Terminal 3 paths stay bounded: testnet only, no real money, no raw PII.

## Why it fits the bounty

Terminal 3 ADK is about identity, authorization, private-data boundaries, protected outbound actions, and auditability. This build turns those primitives into a concrete buyer/payment assistant first, then shows the reusable control layer underneath.

```text
AI checkout request
→ Agent Passport / T3 DID
→ amount + target + issuer + revocation checks
→ optional delegation / policy / witness / registry evidence checks
→ refusal before payload if evidence is missing or mismatched
→ bounded Terminal 3 testnet action if allowed
→ receipt with hashes and audit evidence
```

## What is built

```text
agent-passport-protected-actions/
  src/demo.ts                      $425 allowed / $650 refused / delegation demo
  src/passport.ts                  DID-shaped Agent Passport / AWE envelope
  src/protected-action.ts          decision gate + canonical T3 execute payload builder
  src/receipt.ts                   tamper-evident receipts
  src/t3n.ts                       @terminal3/t3n-sdk integration helpers
  src/audit.ts                     audit-event binding helpers
  src/delegation.ts                local opaque-hash delegation grant gate
  src/consent.ts                   Ed25519 signed delegated-consent ceremony
  src/policy.ts                    hashed policy source-of-truth anchor
  src/governance.ts                signed governance witness attestation
  src/registry.ts                  external audit registry anchor over T3 audit event
  src/safe-egress.ts               safe-egress helpers and canonical payload regression guard
  src/sdk-breadth.ts               live SDK breadth receipt helpers
  src/cli/*.ts                     local/live demos
  tests/*.test.ts                  Vitest coverage
  receipts/*.json                  generated receipts
  logs/*.json                      sanitized live/demo logs
repos/z-audit-probe/               Rust/WIT tenant contract emitting audit event
repos/z-safe-egress-demo/          Rust/WIT tenant contract using http-with-placeholders
```

## Judging criteria mapping

The authoritative track text scores the Best Agent lane as:

```text
Completeness (30%)
SDK integration in its entirety (40%)
Creativity (30%)
```

This packet therefore optimizes for a concrete finished demo, broad verified Terminal 3 SDK/ADK surface, and a simple safe-checkout story a cold judge can understand quickly.

### Completeness (30%)

- `pnpm verify` passes: 14 test files / 54 tests.
- Typecheck and build pass.
- Local demo emits allowed, refused-over-cap, missing-delegation, and delegated-allowed receipts.
- Rust/WIT contracts build for `wasm32-wasip2` and validate with `wasm-tools`.
- Final bundle is verified from a fresh extract.

### SDK integration in its entirety (40%)

- Uses `@terminal3/t3n-sdk@3.5.2`.
- Live smoke uses Terminal 3 testnet auth and usage paths.
- Tenant-contract paths register and execute WASI Preview 2 Rust/WIT contracts on T3 testnet.
- Audit proof calls `getAuditEvents` and binds returned audit event IDs/hashes into receipts.
- Safe-egress proof uses Terminal 3 self-grant semantics, `allowedHosts`, and `host:interfaces/http-with-placeholders@2.1.0`.
- SDK breadth proof exercises auth, usage, wallet/history, KYC-boundary handling, and audit-read.

### Creativity (30%)

Most agent demos stop at tool execution. This one makes action accountable before execution:

```text
identity → permission → evidence → refusal or bounded action → receipt
```

The checkout story is concrete, but the gate is reusable. The same pattern can guard payments, private-data reads, API calls, travel booking, vendor onboarding, or any other protected agent action.

## Verification commands

```bash
cd agent-passport-protected-actions
pnpm install --frozen-lockfile
pnpm verify

cd ../repos/z-audit-probe
cargo test
cargo build --target wasm32-wasip2 --release
wasm-tools validate target/wasm32-wasip2/release/z_audit_probe.wasm

cd ../z-safe-egress-demo
cargo test
cargo build --target wasm32-wasip2 --release
wasm-tools validate target/wasm32-wasip2/release/z_safe_egress_demo.wasm
```

Observed latest results:

```text
pnpm verify: 14 test files / 54 tests passed; typecheck passed; build passed; local demo wrote receipts.
z-audit-probe: cargo test/build/wasm validate passed.
z-safe-egress-demo: cargo test/build/wasm validate passed.
```

## Live evidence summary

Live Terminal 3 evidence included:

```text
auth smoke on testnet
no-money/no-raw-PII tenant-contract audit probe
safe egress denied before grant
safe egress allowed only after scoped grant
SDK breadth probe over auth/usage/wallet/history/audit-read/KYC-boundary
```

Safe boundaries:

```text
no real payment movement
no raw PII returned
no production trust claim
no completed KYC/human identity proof claim
no legal authority claim
```

## Developer-experience / bug report

Submit `DEVREL_REPORT.md` and `BUGS_AND_DOC_GAPS_RULE_COMPLIANT_APPENDIX_20260615T191349Z.md` separately for the bug/docs bounty lane. Do not confuse that report with the main build tarball.

The countable appendix follows the challenge rule: every report is SDK/onboarding/docs related, describes a real issue that is in scope, actionable, and verifiable, names the required code/docs change, and includes a reproduction. The exact challenge extract used for this mapping is preserved in `CHALLENGE_RULES_EXTRACT.md`.

## Current submission artifact

```text
submission-bundles/terminal3-agent-passport-submission-rules-patch-20260616T1759Z.tar.gz
submission-bundles/FINAL_RULES_PATCH_SUBMISSION_RECEIPT_20260616T1759Z.md
```

## Safe claim for bounty submission

```text
Agent Passport for Protected Actions demonstrates a Terminal-3-native control layer for AI checkout and other protected actions. A test payment intent under the passport cap is allowed; an over-cap attempt and missing-delegation attempt refuse before payload creation; matching delegated consent allows the action. The build uses Terminal 3 testnet auth, tenant-contract audit events, scoped safe egress, SDK breadth probes, and tamper-evident receipts. It does not claim production trust, legal authority, real money movement, completed KYC/human identity proofing, or raw-PII disclosure.
```

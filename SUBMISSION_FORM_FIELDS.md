# Terminal 3 ADK bounty — submission form fields

Use these as paste-ready answers. Do not paste API keys, `.env` contents, private keys, raw human identity, or raw PII.

## Project / BUIDL name

```text
Agent Passport for Protected Actions
```

## Short tagline

```text
Safe AI checkout on Terminal 3: a $425 test payment is allowed, a $650 over-cap attempt is refused, missing delegation is refused, and every decision leaves a receipt.
```

## One-sentence summary

```text
Agent Passport for Protected Actions gives an AI checkout agent a Terminal 3 passport and a pre-execution permission gate, so in-scope test payments can proceed while over-cap, wrong-target, missing-consent, or missing-evidence requests are refused before a payload is created.
```

## Full project description

```text
Finance and ops teams want AI agents to handle routine buying, invoices, and checkout, but they cannot safely give an agent blanket spend access. This build demonstrates a safer pattern on Terminal 3: the agent carries a passport-like identity and authority envelope; every protected action is checked against amount, target, issuer, revocation, delegation, policy, witness, and registry/audit evidence; and the system refuses before execution if a required gate fails.

The local demo is concrete: a $425 test payment intent to the approved test merchant is allowed; a $650 payment attempt against a $500 cap is refused; a consent-required payment without a delegation grant is refused; and the same payment with the matching delegation grant is allowed. Each path writes a receipt.

Under the simple checkout story, the repo includes a TypeScript Agent Passport / protected-action gate using @terminal3/t3n-sdk@3.5.2, local and live CLIs, Vitest coverage, tamper-evident JSON receipts, a Rust/WIT tenant contract that emits Terminal 3 audit events, a Rust/WIT safe-egress contract using http-with-placeholders, and a live SDK breadth probe over auth, usage, wallet/history, KYC-boundary handling, and audit-read. The live paths are testnet only, with no real money movement and no raw PII.
```

## What it demonstrates

```text
- Concrete AI checkout flow: $425 allowed, $650 refused, missing delegation refused, matching delegation allowed.
- Terminal 3 DID-shaped Agent Passport envelope.
- Scoped protected-action gate before T3 payload creation.
- Refusal before execution for over-cap actions, untrusted issuer, revoked passport, missing delegation grant, missing policy anchor, missing governance witness, missing external registry anchor, or missing egress grant.
- No raw PII in receipts; private data references are placeholders or hashes.
- Live Terminal 3 testnet auth smoke.
- Live no-money/no-PII tenant-contract invocation that emits a committed host-stamped audit event.
- Live safe-egress proof: http-with-placeholders egress denied before grant, self-grant scoped to one contract/function/host, placeholder denial without raw PII, allowed host egress with committed audit binding.
- Live SDK breadth proof: auth, usage, wallet/history, human-identity-status boundary, and audit-read.
```

## Completeness / verification

```text
pnpm install --frozen-lockfile: passed
pnpm verify: passed
13 test files / 52 tests passed
typecheck passed
build passed
local demo wrote receipts
z-audit-probe cargo test/build/wasm validate: passed
z-safe-egress-demo cargo test/build/wasm validate: passed
fresh extracted story-patch bundle verification: passed
```

## Demo instructions

```bash
# From the extracted bundle root
cd agent-passport-protected-actions
pnpm install --frozen-lockfile
pnpm verify

# Live calls require a private .env with T3N_API_KEY; never paste the key.
pnpm t3n:smoke
pnpm t3n:audit-probe
pnpm t3n:safe-egress
pnpm t3n:sdk-breadth
```

## Current build artifact

```text
submission-bundles/terminal3-agent-passport-submission-story-patch-20260616T0217Z.tar.gz
submission-bundles/FINAL_STORY_PATCH_SUBMISSION_RECEIPT_20260616T0217Z.md
```

## Safe claim boundary

```text
This is a testnet build and bounty demo. It proves local fail-closed authority gates, scoped checkout/payment-intent decisions, live Terminal 3 no-money/no-PII audit events, user-scoped http-with-placeholders egress control, and receipt binding. It does not prove production trust, delegated human authority as a legal fact, completed live KYC/human identity proofing, real payment movement, or raw PII flow.
```

## Developer report / docs gaps

```text
Submit DEVREL_REPORT.md plus BUGS_AND_DOC_GAPS_RULE_COMPLIANT_APPENDIX_20260615T191349Z.md separately for the bug/docs bounty lane. The main BUIDL is the working build tarball above.
```

## Referral / contact fields

```text
Leave blank or fill manually from David's DoraHacks account. Do not invent email/contact metadata.
```

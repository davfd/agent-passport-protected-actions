# Terminal 3 ADK Submission — Agent Passport for Protected Actions

**Status:** `READY_BUILD_SUBMIT_AFTER_COPY_PATCH`  
**Human action still required:** no DoraHacks submission has been made from this workspace. Submit the final build-Council bundle and paste the form fields manually from the files below.

> This is the clean handoff for a fresh reviewer. Start here, then run `pnpm verify` in `agent-passport-protected-actions/`.

## What this is

**Agent Passport for Protected Actions** is a Terminal-3-native trust demo for AI-agent authority:

```text
T3 DID / Agent Passport
→ scoped authority envelope
→ refusal before payload when scope/evidence is missing
→ no-money/no-raw-PII tenant-contract execution on T3 testnet
→ committed Terminal 3 audit receipts
→ scoped http-with-placeholders safe egress
→ SDK breadth probe over auth / usage / wallet-history / audit-read / KYC-boundary
```

It is intentionally bounded. It proves **testnet scoped agent authority and receipt discipline**. It does **not** claim production trust, live KYC/human identity proofing, legal/governance authority, real payment movement, or raw-PII disclosure.

## Current submission artifact

Use the final build-Council bundle and receipt:

```text
submission-bundles/terminal3-agent-passport-submission-build-council-20260615T2047Z.tar.gz
sha256: f15da968634c48f5e1ebdf725664e8bbe510131a34403b30234d340483abaf2e

submission-bundles/FINAL_BUILD_COUNCIL_SUBMISSION_RECEIPT_20260615T2047Z.md
sha256: e42f55b08c307b01bdf5fea426cd37d563e626662f6cf2effc543b14f4778a60
```

Do **not** submit older superseded bundles.

## Fresh reviewer quickstart

```bash
# 1. unpack the curated bundle or use this directory
cd terminal3-adk

# 2. install and verify the TypeScript demo
cd agent-passport-protected-actions
pnpm install
# pnpm-workspace.yaml approves only esbuild's required build script for fresh installs.
pnpm verify
```

Expected current local verifier result:

```text
pnpm test: 13 test files / 52 tests passed
pnpm typecheck: passed
pnpm build: passed
pnpm demo:local: writes allowed/refused/delegated receipts
```

Optional Rust/WASM contract checks:

```bash
cd ../repos/z-audit-probe
cargo test
cargo build --target wasm32-wasip2 --release
wasm-tools validate target/wasm32-wasip2/release/z_audit_probe.wasm

cd ../z-safe-egress-demo
cargo test
cargo build --target wasm32-wasip2 --release
wasm-tools validate target/wasm32-wasip2/release/z_safe_egress_demo.wasm
```

Optional live Terminal 3 testnet probes require a local API key. Never commit it or paste it in chat/logs:

```bash
cd agent-passport-protected-actions
cp .env.example .env
# edit .env and set T3N_API_KEY=***
set -a; . ./.env; set +a
pnpm t3n:smoke
pnpm t3n:safe-egress
pnpm t3n:sdk-breadth
```

## Submit these files / fields

Primary paste fields:

```text
SUBMISSION_FORM_FIELDS.md
SUBMISSION_PACKET.md
```

Attachments / evidence:

```text
submission-bundles/terminal3-agent-passport-submission-build-council-20260615T2047Z.tar.gz
submission-bundles/FINAL_BUILD_COUNCIL_SUBMISSION_RECEIPT_20260615T2047Z.md
DEVREL_REPORT.md
BUGS_AND_DOC_GAPS_RULE_COMPLIANT_APPENDIX_20260615T191349Z.md
T3_BUILD_SUBMISSION_COUNCIL_JUDGMENT_SYNTHESIS_20260615T2047Z.md
EVIDENCE_MANIFEST.md
```

`BUGS_AND_DOC_GAPS.md` is supporting/raw DevRel notes. The countable bug/docs bounty appendix is `BUGS_AND_DOC_GAPS_RULE_COMPLIANT_APPENDIX_20260615T191349Z.md`.

## What was verified

- `@terminal3/t3n-sdk@3.5.2` installed and used.
- Live auth/usage smoke reached Terminal 3 testnet.
- Live protected read was correctly labeled `live-submitted`, not overclaimed as audited.
- Tenant-contract paths register/execute WASI Preview 2 Rust/WIT contracts on T3 testnet.
- `getAuditEvents` returned committed audit events for tenant-contract proofs.
- Safe egress uses `agent-auth-update`/self-grant semantics, `allowedHosts`, and `host:interfaces/http-with-placeholders@2.1.0`.
- SDK breadth probe exercises `getUsage`, `getSelfEthAddress`, `listUserWallets`, `getWalletHistory`, `kycStatus`, and `getAuditEvents`.
- `kycStatus` refusal before provider-session setup is explicitly recorded as **not** KYC/human-identity proof.
- Bundle scan found no `.env`, no known secret values, no private-key PEMs, and no raw ETH-address files.

## Safe submission line

```text
This build proves Terminal-3-native scoped agent authority on testnet: auth, usage, wallet/history, audit-read, tenant-contract execution, scoped safe egress, audit receipts, and refusal boundaries. It deliberately does not claim production trust, live KYC/human identity proofing, legal authority, real payment movement, or raw-PII disclosure.
```

## File map

```text
agent-passport-protected-actions/
  src/passport.ts                  DID-shaped Agent Passport / AWE envelope
  src/protected-action.ts          scoped decision gate + canonical T3 execute payload builder
  src/receipt.ts                   tamper-evident receipts
  src/t3n.ts                       Terminal 3 SDK helpers
  src/audit.ts                     audit-event binding helpers
  src/delegation.ts                local opaque-hash delegated authority gate
  src/consent.ts                   Ed25519 signed delegated-consent ceremony
  src/policy.ts                    hashed policy source-of-truth anchor
  src/governance.ts                signed governance witness attestation
  src/registry.ts                  external audit registry anchor over T3 audit event
  src/safe-egress.ts               allowed-host / placeholder / egress receipt helpers
  src/sdk-breadth.ts               live SDK breadth receipt helpers
  src/cli/*.ts                     local and live demos
  tests/*.test.ts                  Vitest coverage
  receipts/*.json                  generated local/live receipts
  logs/*.json                      sanitized live/demo logs

repos/z-audit-probe/               Rust/WIT tenant contract emitting audit event
repos/z-safe-egress-demo/          Rust/WIT contract using http-with-placeholders
```

## Claim boundaries — do not soften these

Do **not** claim:

```text
production trust solved
live KYC or human identity proofing solved
recognized legal/governance authority solved
real payment movement proved
raw PII disclosure flow proved
```

Correct frame:

```text
testnet scoped authority proved
no-money/no-raw-PII audit receipts proved
safe egress/refusal boundaries proved
SDK breadth exercised
external authority gates named but not self-certified
```

## Council audit note

A visible Discord Council build-submission judgment was dispatched, but all five visible seats withdrew due provider/usage-limit transport failure. That was not counted as approval. A fallback independent five-seat build audit returned 4 `READY_BUILD_SUBMIT`, 1 `REVISE_COPY_ONLY`, 0 `BLOCK`; the stale-hash copy finding was patched, verification stayed green, and the 2047Z build-Council bundle was rebuilt/scanned. See:

```text
T3_BUILD_SUBMISSION_COUNCIL_JUDGMENT_SYNTHESIS_20260615T2047Z.md
```

## Troubleshooting

- Missing `T3N_API_KEY`: live probes fail closed; local `pnpm verify` should still pass.
- Terminal 3 contract reruns may require a unique contract tail/version; the live audit CLI defaults to unique tails.
- If Rust uses the wrong home, set `CARGO_HOME=/home/exor/.cargo RUSTUP_HOME=/home/exor/.rustup` on this host.
- If direct DoraHacks browsing is WAF/CAPTCHA-gated, do not bypass; use the cached/source receipts already included.

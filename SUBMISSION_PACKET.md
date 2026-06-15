# Terminal 3 ADK bounty — bounded submission packet

## Project

**Agent Passport for Protected Actions**

A Terminal-3-native agent trust demo: a passport-bearing agent has a Terminal 3 DID, scoped authority, fail-closed protected-action gates, no-money/no-raw-PII tenant-contract audit proofs, live user-scoped egress control, delegated-consent scaffolds, and tamper-evident receipts.

This is **bounded bounty copy** extracted from the build track. It does **not** claim production human identity proofing, recognized legal authority, raw-PII handling, real payment movement, or production trust.

## One-line pitch

Agent Passport for Protected Actions shows a Terminal-3-native trust envelope: scoped authority gates refuse before payload creation, SDK reads stay correctly labeled `live-submitted`, no-money/no-PII tenant contracts produce committed Terminal 3 audit receipts, and `http-with-placeholders` egress is denied before user grant then allowed only under a scoped host grant.

## Why it fits the bounty

Terminal 3 ADK is about verifiable agent identity, programmable authorization, TEE-backed private data handling, protected outbound actions, and auditability. This BUIDL demonstrates that chain in a small working artifact:

```text
T3 DID / Agent Passport
→ scoped authority envelope
→ issuer / revocation / delegation / policy / witness / registry gates
→ refusal before payload when a gate is missing or mismatched
→ no-money/no-PII tenant-contract audit probe on T3 testnet
→ user-scoped http-with-placeholders egress grant / denial / allowed-host proof
→ action receipts with policy/grant/witness/registry/audit hashes
```

## What is built

```text
agent-passport-protected-actions/
  src/passport.ts                  DID-shaped Agent Passport / AWE envelope
  src/protected-action.ts          scoped decision gate + canonical T3 execute payload builder
  src/receipt.ts                   tamper-evident receipts
  src/t3n.ts                       @terminal3/t3n-sdk integration helpers
  src/audit.ts                     audit-event binding helpers
  src/delegation.ts                local opaque-hash delegation grant gate
  src/consent.ts                   Ed25519 signed delegated-consent ceremony
  src/policy.ts                    hashed policy source-of-truth anchor
  src/governance.ts                signed governance witness attestation
  src/registry.ts                  external audit registry anchor over T3 audit event
  src/safe-egress.ts               safe-egress helpers and canonical payload regression guard
  src/sdk-breadth.ts               live SDK breadth receipt over auth/usage/wallet/KYC-boundary/audit-read
  src/cli/*.ts                     local/live demos, including t3n:safe-egress and t3n:sdk-breadth
  tests/*.test.ts                  Vitest coverage
  receipts/*.json                  generated receipts
  logs/*.json                      sanitized live/demo logs
repos/z-audit-probe/               minimal Rust/WIT tenant contract emitting audit event
repos/z-safe-egress-demo/          Rust/WIT tenant contract using http-with-placeholders
```

## Judging criteria mapping

### Completeness

- `pnpm verify` passes: **13 test files / 52 tests**.
- Typecheck and build pass.
- Local demo emits allowed, refused-over-cap, missing-delegation, and delegated-allowed receipts.
- Live Terminal 3 auth smoke passed with sanitized DID/balance output.
- Live protected read reached `live-submitted` and correctly did **not** claim audit when `getAuditEvents` returned zero events.
- Live tenant-contract audit probe emitted committed host-stamped Terminal 3 audit events.
- Repeatability gate: **4/4** no-money/no-PII audit-probe runs produced distinct request IDs and distinct committed audit-event IDs.
- External registry anchor demo refuses without an anchor and allows when policy + signed grant + governance witness + external registry anchor all match.
- New max-loop extension: live `http-with-placeholders` path proves egress denied before user grant, scoped self-grant to one contract/function/host, placeholder-denial without raw PII, and allowed host egress with committed audit binding.

### SDK / ADK integration

- Uses `@terminal3/t3n-sdk@3.5.2`.
- Live smoke uses `setEnvironment("testnet")`, `loadWasmComponent`, `eth_get_address`, `T3nClient`, `metamask_sign`, `createEthAuthInput`, `handshake`, `authenticate`, and `getUsage`.
- Live protected read uses `T3nClient.getSelfEthAddress` and records it as `live-submitted`, not `live-audited`.
- Tenant-contract paths register and execute WASI Preview 2 Rust/WIT contracts through T3 testnet.
- Audit proof calls `getAuditEvents` and binds returned audit event IDs/hashes into receipts.
- Safe-egress proof uses Terminal 3 `agent-auth-update`/self-grant semantics, `allowedHosts`, and `host:interfaces/http-with-placeholders@2.1.0`.
- New SDK breadth proof exercises `getUsage`, `getSelfEthAddress`, `listUserWallets`, `getWalletHistory`, `kycStatus`, and `getAuditEvents`; the `kycStatus` edge refuses before provider-session setup and is explicitly recorded as **not** human-identity/KYC proof.

### Creativity

- Treats agent identity as an accountability envelope rather than only login.
- Demonstrates refusal before execution when scope, issuer, revocation, delegation, policy, witness, registry evidence, or egress grant is missing/mismatched.
- Keeps raw PII out of receipts and action payloads; private data is represented by placeholders/hashes.
- Separates local scaffolds from real external proof so the demo does not launder a local signature into legal authority.
- Produces a developer-experience report with concrete Terminal 3 docs/SDK/WIT findings.

## Verification commands run

```bash
cd agent-passport-protected-actions
pnpm verify
pnpm registry:demo
set -a; . ./.env; set +a
pnpm t3n:safe-egress
pnpm t3n:sdk-breadth

cd ../repos/z-audit-probe
CARGO_HOME=/home/exor/.cargo RUSTUP_HOME=/home/exor/.rustup /home/exor/.cargo/bin/cargo +stable test
CARGO_HOME=/home/exor/.cargo RUSTUP_HOME=/home/exor/.rustup /home/exor/.cargo/bin/cargo +stable build --target wasm32-wasip2 --release
wasm-tools validate target/wasm32-wasip2/release/z_audit_probe.wasm

cd ../z-safe-egress-demo
CARGO_HOME=/home/exor/.cargo RUSTUP_HOME=/home/exor/.rustup /home/exor/.cargo/bin/cargo +stable test
CARGO_HOME=/home/exor/.cargo RUSTUP_HOME=/home/exor/.rustup /home/exor/.cargo/bin/cargo +stable build --target wasm32-wasip2 --release
wasm-tools validate target/wasm32-wasip2/release/z_safe_egress_demo.wasm
```

Observed latest results:

```text
pnpm verify: 13 test files / 52 tests passed; typecheck passed; build passed; local demo wrote receipts.
z-safe-egress-demo: 2 unit tests + 1 doctest passed; wasm build passed; wasm-tools validate passed.
pnpm t3n:safe-egress: ok=true; evidenceBoundary.ok=true.
pnpm t3n:sdk-breadth: ok=true; auth/usage/wallet/history/audit-read live-submitted; humanIdentity safeClaim=not-proved-by-this-probe.
```

## Live safe-egress evidence

Live run stamp: `20260615t173901793z`.

```text
log: agent-passport-protected-actions/logs/t3n-safe-egress-20260615t173901793z.json
log sha256: e2cec7df3a7e221ed2c22a7e69f519fec4edf6050768c203b45a02ee2caada5f
wasm sha256: 224ce92c892d9b2262639fd5ba5fe00ff9a33811b5c202cb878d72c9f2f4de79
```

| Edge | Receipt | Whole-file sha256 | Embedded receiptHash | Result |
|---|---|---:|---:|---|
| denied before grant | `agent-passport-protected-actions/receipts/safe_egress_denied-egress-req-egress-denied-20260615t173901793z-live-failed.json` | `f6dd3c5b3579e94a1cdf62e7e4c2cfb2d74caadbfc8e36daf4b65cb13e8971b8` | `sha256:fcefe46fc573a738ef85a706cc473179dca749fc745bf1c977612e42d571d2fa` | `egress denied for host httpbin.org` |
| placeholder denial | `agent-passport-protected-actions/receipts/safe_egress_placeholder-denial-req-placeholder-denied-20260615t173901793z-live-failed.json` | `016190feed620bfc75492f4892adaed8c18d61d1077a46248b9c7be9a591e8e7` | `sha256:f21db63749cb38c7489587e41438af54372cd36753203486c3ecff40a9544687` | `user profile missing field: __leonardo_forbidden_demo_field` |
| allowed after grant | `agent-passport-protected-actions/receipts/safe_egress_allowed-egress-req-egress-allowed-20260615t173901793z-live-audited.json` | `efb8351dd81192ceb7efaa3b758e2c567572b7dc049a15ff3d6265eaa1aa4618` | `sha256:59f5e3e3b30c897f61abe70b49878e140d859809be2798b2174c5d453268f663` | `live-audited`, `auditEventCommitted=true` |

Allowed edge audit:

```text
auditEventHash: sha256:1874bc2bc4906048d641e66521dc5c014b7715794e350a4d660133ac23e57ce0
responseHash: sha256:cb47d5e86e8f528563a16761618d57424f4ebb053e79551c80374ba2cc9db903
httpStatus: 200
rawPiiReturned: false
moneyMovement: false
```

Implementation receipt:

```text
T3_SAFE_EGRESS_IMPLEMENTATION_RECEIPT_20260615T173947Z.md
sha256:bd5bff8782a73e7cbc4e5c386fa57acc8f4f011ef72378ab3ce214f0a1a0ae8a
```

## Live SDK breadth evidence

Live run stamp: `20260615t192626284z`.

```text
receipt: agent-passport-protected-actions/receipts/sdk_breadth-20260615t192626284z-live-submitted.json
receipt whole-file sha256: 2066eab85f00a2df074ddb77280944f9292b115685d8c7e911c1c9f3d567ad23
embedded receiptHash: sha256:aa9bd48c91d8c752e1fd47a3f9fcf4e161107412e71df4d9f8aee09619d4f69f
log: agent-passport-protected-actions/logs/t3n-sdk-breadth-20260615t192626284z.json
log sha256: 87f334838cb3a4ddf089886392367a82f7c2b178d819f8bd4ba99accded3c194
implementation receipt: T3_SDK_BREADTH_IMPLEMENTATION_RECEIPT_20260615T192705Z.md
```

Observed surfaces:

```text
auth: ok=true, address hashed only
usage: ok=true, balanceAvailable=1546
wallet/history: ok=true, wallet address hashed only
humanIdentity: refused before provider-session setup, safeClaim=not-proved-by-this-probe
auditRead: ok=true, batchCount=5, eventCount=5
```

Safe boundary remains:

```text
no raw PII returned
no money movement
no human identity / KYC proof claim
no production trust claim
```

## Prior live Terminal 3 evidence

Sanitized auth smoke:

```text
environment: testnet
nodeUrl: https://cn-api.sg.testnet.t3n.terminal3.io
did: did:t3n:5c946503c2d9924f58ee273dbd2efba8d03a12df
balance.available: 20000
```

Live-audited external registry record used by registry demo:

```text
receipt: agent-passport-protected-actions/receipts/live_audit_probe-req-audit-20260615t051314496z-live-audited.json
whole-file sha256: ce6f38fbaaed85bcb0819e75b2b114c0e0eb85261943ffba5b10cf9805b7d873
receiptHash: sha256:4324628f9927999ae8a2c4ca322cfbbec9c90c6c045cfda348e87869286ee152
registryRecordHash: sha256:725f9534923c4453a86f0caa8de8459b786cb1ad6e83845babe469f665c6c2ed
auditEventCommitted: true
```

## Developer-experience / bug report

Submit `DEVREL_REPORT.md` and `BUGS_AND_DOC_GAPS_RULE_COMPLIANT_APPENDIX_20260615T191349Z.md` as companion report artifacts. The appendix is the countable bug/docs bounty artifact: 11 SDK-related findings, each with reproduction, observed/expected behavior, and required code/docs fix framing. `BUGS_AND_DOC_GAPS.md` remains supporting/raw DevRel notes.

## Safe claim for bounty submission

```text
Agent Passport for Protected Actions demonstrates a Terminal-3-native trust envelope for protected AI-agent actions. It combines a T3 DID-shaped passport, scoped authority, issuer/revocation checks, local delegated-consent and signed-consent gates, hashed policy source anchoring, governance witness attestation, live no-money/no-PII Terminal 3 tenant-contract audit proofs, repeatability receipts, a user-scoped http-with-placeholders egress proof, a live SDK breadth probe over auth/usage/wallet/history/human-identity-status-boundary/audit-read methods, and an external audit registry anchor over a committed Terminal 3 testnet audit event. Out-of-scope or missing-evidence actions refuse before payload creation, and receipts bind evidence hashes without raw PII, private keys, or money movement.
```

## Claims to avoid

```text
Do not claim delegated human authority is solved.
Do not claim live human identity proofing or KYC is complete.
Do not claim recognized external governance/legal authority is solved.
Do not claim production trust or production payment/action flow.
Do not claim raw PII flow is proved.
Do not drop BUILD_SPLIT caveats.
```

## Remaining submission step

No DoraHacks submission was made from this workspace. Final external submission still needs David/human account action: publish or attach the code packet, paste the field answers from `SUBMISSION_FORM_FIELDS.md`, attach `DEVREL_REPORT.md`, attach `BUGS_AND_DOC_GAPS_RULE_COMPLIANT_APPENDIX_20260615T191349Z.md` for the bug/docs lane, optionally attach `BUGS_AND_DOC_GAPS.md` as supporting raw notes, and include the safe claim boundary above.

# Terminal 3 ADK bounty — submission form fields

Use these as paste-ready answers. Do **not** paste API keys, `.env` contents, private keys, raw human identity, or raw PII.

## Project / BUIDL name

```text
Agent Passport for Protected Actions
```

## Short tagline

```text
A Terminal-3-native trust envelope for AI-agent actions: T3 DID, scoped authority, fail-closed gates, live audit receipts, and user-scoped http-with-placeholders egress control.
```

## One-sentence summary

```text
Agent Passport for Protected Actions gives an AI agent a T3 DID-shaped passport, checks issuer/scope/revocation/delegation/policy/witness/registry evidence before payload creation, refuses out-of-scope actions, keeps SDK reads correctly labeled live-submitted, proves no-money/no-PII Terminal 3 tenant-contract audit paths, and demonstrates user-granted http-with-placeholders egress with receipts bound to committed audit records.
```

## Full project description

```text
Agent Passport for Protected Actions is a compact Terminal-3-native demo of the Leonardo Agent Trust Stack. It treats agent identity as an accountability envelope: who is acting, under what authority, what scope is allowed, what evidence/witnesses are bound, whether the action is refused before execution, and which receipt/evidence record remains.

The BUIDL includes a TypeScript Agent Passport / protected-action gate using @terminal3/t3n-sdk@3.5.2, local and live demo CLIs, Vitest coverage, tamper-evident JSON receipts, a minimal Rust/WIT tenant contract that emits Terminal 3 audit events, a second Rust/WIT safe-egress contract that imports http-with-placeholders, and a live SDK breadth probe over auth/usage/wallet/history/human-identity-status-boundary/audit-read methods. The live paths use Terminal 3 testnet only, with no money movement and no raw PII.

The latest build verifies 13 test files / 52 tests, typecheck, build, local demo receipts, external registry anchor demo, cargo tests, wasm32-wasip2 builds, wasm-tools validation, a live safe-egress run proving denied-before-grant, self-granted allowed host, placeholder denial, and allowed host egress with committed audit binding, plus a live SDK breadth probe showing auth/usage/wallet/history/audit-read and a refused human-identity-status boundary before provider-session setup.
```

## What it demonstrates

```text
- T3 DID-shaped Agent Passport envelope.
- Scoped protected-action gate before T3 payload creation.
- Refusal before execution for over-cap actions, untrusted issuer, revoked passport, missing delegation grant, missing policy anchor, missing governance witness, missing external registry anchor, or missing egress grant.
- No raw PII in receipts; private data references are placeholders or hashes.
- Live Terminal 3 testnet auth smoke.
- Live protected read correctly marked live-submitted, not live-audited, when no audit event exists.
- Live no-money/no-PII tenant-contract invocation that emits a committed host-stamped audit event.
- Repeatability: 4/4 live-audited no-money/no-PII runs with distinct request IDs and audit event IDs.
- Live safe-egress proof: http-with-placeholders egress denied before grant, self-grant scoped to one contract/function/host, placeholder denial without raw PII, allowed host egress with committed audit binding.
- Live SDK breadth proof: auth, usage, wallet/history, human-identity-status boundary, and audit-read. The human-identity/KYC status edge refuses before provider-session setup and is explicitly not claimed as KYC proof.
- Local delegated-consent gate using opaque human/evidence hashes.
- Ed25519 signed delegated-consent ceremony over a canonical challenge.
- Hashed policy source-of-truth anchor.
- Signed governance witness attestation over policy + grant + request scope.
- External audit registry anchor that imports a committed Terminal 3 testnet audit event and refuses when missing/mismatched.
```

## How it uses Terminal 3 / Agent Auth SDK

```text
The TypeScript project installs @terminal3/t3n-sdk@3.5.2 and uses Terminal 3 testnet. The live smoke path uses setEnvironment("testnet"), loadWasmComponent, eth_get_address, T3nClient, metamask_sign, createEthAuthInput, handshake, authenticate, and getUsage. A protected read uses T3nClient.getSelfEthAddress and records the response as live-submitted. The audited proofs register and execute Rust/WIT WASI Preview 2 tenant contracts, use agent-auth-update/self-grant semantics for egress authorization, and poll getAuditEvents to bind returned audit event IDs/hashes into Agent Passport receipts. The additional SDK breadth probe exercises getUsage, getSelfEthAddress, listUserWallets, getWalletHistory, kycStatus, and getAuditEvents; the kycStatus edge refuses before provider-session setup and is preserved as a boundary, not a KYC-proof claim.
```

## Why it is creative

```text
Most agent demos stop at tool execution. This demo makes action accountable: the agent has a passport; the request has a scope; authority evidence is checked before payload; missing evidence refuses; live audit events are distinguished from unaudited SDK reads; user-granted egress is scoped to contract/function/host; and every claim leaves hashes a reviewer can inspect. It turns Terminal 3's identity, authorization, privacy, and audit primitives into a compact agent-governance pattern.
```

## Completeness / verification

```text
pnpm verify
✅ 13 test files / 52 tests passed
✅ typecheck passed
✅ build passed
✅ local demo wrote receipts

pnpm registry:demo
✅ missing external registry anchor refused before payload
✅ policy + signed grant + governance witness + external registry anchor allowed
✅ registry hashes bound into receipt

pnpm t3n:safe-egress
✅ denied egress before self-grant
✅ self-grant scoped agent to one z: contract/function/host
✅ placeholder lookup failure returned no raw PII
✅ allowed host egress succeeded and produced live-audited receipt
✅ evidenceBoundary.ok=true

pnpm t3n:sdk-breadth
✅ auth / usage / wallet-history / audit-read live-submitted
✅ human-identity-status boundary refused before provider-session setup
✅ safeClaim=not-proved-by-this-probe

cargo test/build/wasm validate
✅ z-audit-probe passed
✅ z-safe-egress-demo passed
```

## Demo instructions

```bash
# From the extracted bundle root
cd agent-passport-protected-actions
pnpm install
pnpm verify
pnpm registry:demo

# Live calls require a private .env with T3N_API_KEY; never paste the key.
pnpm t3n:smoke
pnpm t3n:audit-probe
pnpm t3n:safe-egress
pnpm t3n:sdk-breadth
```

Rust/WASM contracts:

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

## Live evidence summary

```text
environment: testnet
nodeUrl: https://cn-api.sg.testnet.t3n.terminal3.io
did: did:t3n:5c946503c2d9924f58ee273dbd2efba8d03a12df

safe-egress live log:
agent-passport-protected-actions/logs/t3n-safe-egress-20260615t173901793z.json
whole-file sha256: e2cec7df3a7e221ed2c22a7e69f519fec4edf6050768c203b45a02ee2caada5f

safe-egress denied-before-grant receipt:
agent-passport-protected-actions/receipts/safe_egress_denied-egress-req-egress-denied-20260615t173901793z-live-failed.json
whole-file sha256: f6dd3c5b3579e94a1cdf62e7e4c2cfb2d74caadbfc8e36daf4b65cb13e8971b8
receiptHash: sha256:fcefe46fc573a738ef85a706cc473179dca749fc745bf1c977612e42d571d2fa

safe-egress placeholder-denial receipt:
agent-passport-protected-actions/receipts/safe_egress_placeholder-denial-req-placeholder-denied-20260615t173901793z-live-failed.json
whole-file sha256: 016190feed620bfc75492f4892adaed8c18d61d1077a46248b9c7be9a591e8e7
receiptHash: sha256:f21db63749cb38c7489587e41438af54372cd36753203486c3ecff40a9544687

safe-egress allowed-after-grant receipt:
agent-passport-protected-actions/receipts/safe_egress_allowed-egress-req-egress-allowed-20260615t173901793z-live-audited.json
whole-file sha256: efb8351dd81192ceb7efaa3b758e2c567572b7dc049a15ff3d6265eaa1aa4618
receiptHash: sha256:59f5e3e3b30c897f61abe70b49878e140d859809be2798b2174c5d453268f663
auditEventHash: sha256:1874bc2bc4906048d641e66521dc5c014b7715794e350a4d660133ac23e57ce0
auditEventCommitted: true
rawPiiReturned: false
moneyMovement: false

SDK breadth live receipt:
agent-passport-protected-actions/receipts/sdk_breadth-20260615t192626284z-live-submitted.json
whole-file sha256: 2066eab85f00a2df074ddb77280944f9292b115685d8c7e911c1c9f3d567ad23
receiptHash: sha256:aa9bd48c91d8c752e1fd47a3f9fcf4e161107412e71df4d9f8aee09619d4f69f
auth/usage/wallet/history/audit-read: ok
humanIdentity safeClaim: not-proved-by-this-probe
rawPiiReturned: false
moneyMovement: false
```

## Developer report / docs gaps

```text
See DEVREL_REPORT.md plus BUGS_AND_DOC_GAPS_RULE_COMPLIANT_APPENDIX_20260615T191349Z.md. The appendix is the countable bug/docs bounty artifact: 11 SDK-related findings, each with reproduction, observed/expected behavior, and required code/docs fix framing. BUGS_AND_DOC_GAPS.md remains supporting/raw DevRel notes.
```

## Safe claim boundary

```text
This is a testnet build and bounty demo. It proves local fail-closed authority gates, live Terminal 3 no-money/no-PII audit events, repeatability, user-scoped http-with-placeholders egress control, and receipt binding. It does not prove delegated human authority is legally solved, live human identity proofing/KYC is complete, recognized external governance authority is solved, production trust is complete, real payment movement is proved, or raw PII flow is proved.
```

## Design Partner angle

```text
Design-partner-ready pattern for high-assurance agent actions: scoped authority, pre-execution refusal, user-granted egress boundaries, Terminal 3 audit-event binding, and reviewer-verifiable receipts without exposing raw sensitive data.
```

## Referral / contact fields

```text
Leave blank or fill manually from David's DoraHacks account. Do not invent email/contact metadata.
```

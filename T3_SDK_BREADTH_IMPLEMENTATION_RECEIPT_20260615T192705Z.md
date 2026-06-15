# Terminal 3 ADK bounty — SDK breadth implementation receipt

**Stamp:** `20260615T192705Z`  
**Live run stamp:** `20260615t192626284z`  
**Purpose:** Continue max-prize loop after rules/all-links rescan by adding one more safe Terminal-3-native SDK surface proof without real money, raw PII, production trust, legal authority, or KYC overclaim.

## What changed

Added a live SDK breadth probe that exercises and receipts additional SDK surfaces beyond the prior auth/audit/safe-egress path:

```text
authenticate
getUsage
getSelfEthAddress
listUserWallets
getWalletHistory
kycStatus boundary check
getAuditEvents
```

The probe deliberately treats human identity/KYC status as a **boundary**, not a solved claim. The live result refused with:

```text
precondition_failed: kyc-status called before create-kyc-provider-session
```

This is useful evidence: the SDK surface is reachable, and the submission can honestly say the current build does **not** claim KYC / live human identity proofing.

## New files

```text
agent-passport-protected-actions/src/sdk-breadth.ts
agent-passport-protected-actions/src/cli/sdk-breadth-probe.ts
agent-passport-protected-actions/tests/sdk-breadth.test.ts
```

Package script added:

```text
pnpm t3n:sdk-breadth
```

## Hashes

```text
agent-passport-protected-actions/src/sdk-breadth.ts
457aa3b4a771547694bd1946d0401fdfb35f388dd49f72cd9cbdf20416ec52a5

agent-passport-protected-actions/src/cli/sdk-breadth-probe.ts
4594743ac386421082620886125225d25b954e66bfed636348b5bf09c1cc3376

agent-passport-protected-actions/tests/sdk-breadth.test.ts
d9ccc431034921ae0fe5832d777dbdd13d2194d020dcd8ffa189449a24d9cbe7

agent-passport-protected-actions/package.json
041c61e9c16cdb8326fe4753cd5c37abdacf7c0968cdac7f84acb131a440e9c8
```

## TDD receipt

RED:

```text
pnpm vitest run tests/sdk-breadth.test.ts
FAIL: Cannot find module '../src/sdk-breadth.js'
```

GREEN:

```text
pnpm vitest run tests/sdk-breadth.test.ts
✓ tests/sdk-breadth.test.ts (2 tests)
```

Full local verification after integration:

```text
pnpm verify
✓ 13 test files passed
✓ 52 tests passed
✓ typecheck passed
✓ build passed
✓ local demo wrote receipts
```

## Live SDK breadth proof

Command run without printing the key:

```bash
set -a
. ./.env
set +a
pnpm t3n:sdk-breadth
```

Output receipt:

```text
receipt: agent-passport-protected-actions/receipts/sdk_breadth-20260615t192626284z-live-submitted.json
receipt whole-file sha256: 2066eab85f00a2df074ddb77280944f9292b115685d8c7e911c1c9f3d567ad23
embedded receiptHash: sha256:aa9bd48c91d8c752e1fd47a3f9fcf4e161107412e71df4d9f8aee09619d4f69f
log: agent-passport-protected-actions/logs/t3n-sdk-breadth-20260615t192626284z.json
log sha256: 87f334838cb3a4ddf089886392367a82f7c2b178d819f8bd4ba99accded3c194
```

Observed live surfaces:

```text
auth: ok=true, address hashed only
usage: ok=true, balanceAvailable=1546, responseHash=sha256:09538327440cd976bc5a41df8beb57779070a6dd5773059cbced61bc89f4a36b
wallet: ok=true, primary wallet hashed only, secondaryCount=0, historyHash=sha256:a5a156b69aeab2e35e6242a3f9ecbcd8b0c06c6a8eeb5167168c846855b8c49c
humanIdentity: refused, safeClaim=not-proved-by-this-probe
auditRead: ok=true, batchCount=5, eventCount=5, responseHash=sha256:e23ed7ee90162a9345f0655b901a2ae297e139c896449527eb8e40b5288f0f45
```

Boundary scan:

```text
evidenceBoundary.ok=true
hits=[]
```

## Safe boundary

```text
testnet only
no raw PII returned
no money movement
no production trust claim
no human identity / KYC proof claim
no real payment claim
no raw PII disclosure claim
```

## Claim this adds

Safe addition to the submission:

```text
The build also includes a live SDK breadth probe over auth, usage, wallet/history, KYC-status boundary, and audit-read methods. The KYC-status call correctly refuses before provider-session setup, so the receipt strengthens the boundary: the demo exercises the SDK surface while explicitly not claiming live KYC/human identity proofing.
```

Do **not** phrase this as KYC solved.

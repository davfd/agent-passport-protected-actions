# Terminal 3 ADK bounty — rules/all-links rescan

**Stamp:** `20260615T191349Z`  
**Purpose:** Re-read the DoraHacks track rules, challenge detail page, Terminal 3 claim/product surface, docs index, and public GitHub org after David's correction.

## Access / source receipts

Direct browser access to `https://dorahacks.io/hackathon/t3adkdevchallenge/detail` returned human verification. I did not bypass it.

Public-reader / docs receipts:

| Source | URL | Bytes | SHA-256 |
|---|---|---:|---:|
| DoraHacks detail reader | `https://r.jina.ai/http://https://dorahacks.io/hackathon/t3adkdevchallenge/detail` | 4042 | `5b4d64b0093cdc3012352500c7360cabacb8da74571da38584ce771181e5b499` |
| DoraHacks tracks reader | `https://r.jina.ai/http://https://dorahacks.io/hackathon/t3adkdevchallenge/tracks` | 1958 | `d84f553630f49d78cead6c6cc1050128558d348ebeb734a223021bd6a39656bf` |
| Terminal 3 claim/product reader | `https://r.jina.ai/http://https://www.terminal3.io/claim-page` | 9500 | `18decd900596a4cc3dcf5e5b210aca79a007a4584c5d0192537b83a0ac9bed8c` |
| Terminal 3 docs index | `https://docs.terminal3.io/llms.txt` | 4848 | `197489ee5209e064c28d0117beccee252d5318a4e480ea001be51cc9b04d228b` |

Docs link sweep from `llms.txt`: **35** docs/spec URLs checked; **33 HTTP 200**, **2 HTTP 404**:

```text
https://docs.terminal3.io/terminal-3-openapi.yml
https://docs.terminal3.io/api-reference/openapi.json
```

Terminal-3 GitHub org reachable through GitHub API. Relevant public repos observed:

```text
Terminal-3/z-tenant-flight       Rust sample tenant contract
Terminal-3/adk-getting-start     size=0 / empty public repo observation
Terminal-3/t3-claw               Rust, staging branch
Terminal-3/hedera-t3n-plugin     TypeScript
```

## Rules: exact scoring frame

From the DoraHacks tracks reader:

```text
Best Agent utilising Terminal 3 Agent Auth SDK
For this challenge, we are seeking the top agent utilising Terminal 3's Agent Auth SDK.

Scoring criteria:
- How complete the solution is (30%)
- How well integrated is the SDK in its entirety in your solution (40%)
- How creative is the application of the SDK in your agent (30%)

To start the onboarding journey, head over to the tokens claim page.
```

Bug Discovery Bounty rules:

```text
The most detailed developer that discovers and submits the most number of:
- bugs during onboarding
- documentation gaps

Reports should focus on SDK-related issues.
Generally not qualifying:
1. irrelevant scanner/automated-tool reports
2. bugs requiring physical device access
3. non-reproducible vulnerabilities from outdated/flawed OSS versions

An issue may only be submitted once; first valid report wins.
Each report must describe a real issue that is in scope, actionable, and verifiable from submitted materials.
To be fixed, the issue must require a code change.
Each report must contain a reproduction.
Reports after the relevant fix is already implemented in testnet will not be accepted.
LLMs are allowed, but we are responsible for validating every claim; low-effort AI reports can be ignored or lead to suspension.
```

## Product/docs facts that matter

Claim/product page says the sandbox includes:

```text
verifiable identity
programmable authorization
secure payments
20,000 test tokens
~25 agents / ~5,000 protected actions
npm SDK
MCP server
Stripe-backed test merchant
A2A
ERC-8004
Entra Agent ID
MCP
Web Bot Auth
```

It also frames the ADK as wrapping outbound action by:

```text
verifying identity
substituting sensitive references inside a TEE
writing an audit row to the ledger
before the action reaches the destination system
```

ADK docs say:

```text
current SDK: TypeScript / JavaScript
TEE contracts: Rust -> WASM/WASI Preview 2
agents authenticate as themselves, not tenants
user/data-owner authorization uses agent-auth-update
allowedHosts scope outbound HTTP
http-with-placeholders lets host resolve private profile fields without plaintext entering WASM
capabilities are determined by WIT imports and host authorization checks
```

T3N/use-case docs explicitly mention:

```text
procurement payments
payroll execution
travel booking / e-visa style private-data delegation
reusable verified user data / KYC credentials
VC issuers/verifiers
compliance authorities
```

## Correction to prior framing

My earlier answer was right on claim safety but too low-resolution for this bounty.

The challenge is not merely asking for a safe local Agent Passport story. The scoring weights **SDK integration in its entirety at 40%**. The claim/product surface advertises MCP, Stripe test merchant, A2A/ERC-8004/Entra/Web Bot Auth, full SDK + MCP, test payments, and placeholder resolution.

So the exact distinction is:

```text
Do not claim production/KYC/legal/payment/raw-PII solved.
But do show the richest Terminal-3-native testnet/sandbox use of the SDK that we can actually verify.
```

## Current artifact after comparison

Current final artifact already crosses the strongest safe core:

```text
final bundle: submission-bundles/terminal3-agent-passport-submission-max-curated-20260615T1800Z.tar.gz
bundle sha256: 95aafe67349e8d100b0601ccd9149eb080f3b71a3a116040c4e32b7fbb784be4
local verify rerun: 12 test files / 50 tests passed; typecheck passed; build passed; local demo wrote receipts
status: READY_MAX_SUBMIT, external DoraHacks submission not performed from this workspace
```

It uses:

```text
@terminal3/t3n-sdk@3.5.2
testnet auth / DID / usage smoke
T3nClient / handshake / authenticate / getUsage / getSelfEthAddress
Rust/WIT tenant contracts
WASI Preview 2 wasm builds
contract register/execute
getAuditEvents audit binding
agent-auth-update / self-grant semantics
allowedHosts
http-with-placeholders
before-grant denial
placeholder denial without raw PII
allowed host egress with committed audit event
```

Therefore the old gap from the 170958Z criteria rescan — missing user-grant/placeholder/egress proof — is now closed by the safe-egress max loop.

## Remaining honest gaps / optional extensions

These are not blockers, but they are the only platform-native score surfaces still not exercised by the current packet:

```text
MCP server
Stripe-backed test merchant / test payment intent
A2A card / ERC-8004 / Entra Agent ID / Web Bot Auth resolution surfaces
public hosted landing/demo video/screenshots
```

The highest-scoring extra technical extension, if time and access allow, would be:

```text
Terminal 3 sandbox Stripe-test-merchant payment-intent demo:
- test mode only
- no real money
- no raw card/PII in agent logs
- T3 placeholder resolution inside TEE
- scoped user grant / allowed host
- committed audit receipt
```

This would answer the product page's `secure payments` / `Stripe test mode` language without making the forbidden `real payment movement proved` claim.

## What the forbidden items would take

| Frontier | What it would take to honestly claim | Bounty posture |
|---|---|---|
| Production trust | production deployment, monitoring, incident/runbook, security review, uptime/error receipts | Do not claim; Design Partner next gate |
| KYC / human identity proofing | real VC/KYC issuer/verifier or Terminal 3 identity partner attestation | Mention T3 supports reusable verified user data; do not claim completed |
| Legal/governance authority | real entity/DAO/company/user policy issuer granting mandate and revocation path | Local witness/policy scaffolds only; no legal authority claim |
| Real payment | compliant processor/account authority, limits, receipt, refund/reversal path | Prefer Stripe test merchant only; no real money claim |
| Raw PII disclosure | explicit consent, minimization, retention/deletion, redaction/audit, need-to-know grants | Stronger claim is no raw PII returned; use placeholders/hashes |

## Submission posture after rescan

Use this line:

```text
This submission focuses on the highest-assurance Terminal-3-native core: Agent Auth SDK identity, scoped authorization, Rust/WIT TEE contracts, user-granted allowed-host egress, http-with-placeholders privacy, and committed audit receipts. It does not claim production trust, KYC, legal authority, real payment movement, or raw PII disclosure; those are Design Partner gates.
```

If we add one more technical demo, make it **Stripe test merchant / test payment intent**, not raw PII or real money.

If we do not add code, the immediate submission improvements are copy/packaging:

```text
1. paste/attach SUBMISSION_FORM_FIELDS.md
2. attach final curated bundle sha256 95aafe...
3. attach DEVREL_REPORT.md
4. attach BUGS_AND_DOC_GAPS.md and ensure each numbered finding has reproduction + code-change-required language
5. add 60-90 sec judge walkthrough/screenshots if possible
```

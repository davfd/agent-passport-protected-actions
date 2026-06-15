# Terminal 3 ADK bounty — max-prize Council loop packet

**Run token:** `T3_BOUNTY_MAX_LOOP_20260615T171622Z`  
**Discord thread:** Terminal 3 / `1515563429677633646`  
**Premise change:** We have ~6 days, not a few minutes. The goal is no longer only “safe ready-to-submit”; the goal is to maximize prize / Design Partner fit while preserving evidence discipline.

## User instruction

ChinaPrint / David asked:

```text
We have 6 days plenty of time we start less than 24 hours ago go in loop with council for a top tier submission that answers all what the judges want.
```

## Live challenge criteria

Direct browser access to DoraHacks returned human verification; no bypass attempted. Public-reader refresh used:

```text
https://r.jina.ai/http://https://dorahacks.io/hackathon/t3adkdevchallenge/detail
sha256:5b4d64b0093cdc3012352500c7360cabacb8da74571da38584ce771181e5b499
```

Relevant criteria:

```text
Bounty runs 9 June 2026 9.00AM to 22 June 2026 11.59PM GMT+8.
Submit BUIDLs and bugs for $2,000 cash prize pool.
Google grants 6 top teams $500 each in Google credits.
Cash prizes paid fiat via wire/bank transfer; no stablecoin/crypto payment.
```

Best implementation of Agent Auth SDK focuses on:

```text
- How complete is the solution built?
- How well integrated is the Agent Auth SDK?
- How creative is the agentic solution?
```

Separate developer-detail lane:

```text
- most detailed developer finding/submitting bugs during onboarding
- documentation gaps
```

Design Partner bonus:

```text
Top submissions may be invited into Terminal 3 Design Partner program for co-building/presenting across governments, banks, institutions, corporates.
```

## Terminal 3 product/docs facts the submission should answer

From Terminal 3 claim/product page:

```text
T3N sandbox = verifiable identity + programmable authorization + secure payments.
20,000 test tokens = ~25 agents and ~5,000 protected actions.
Full SDK access includes npm, MCP server, plus Stripe-backed test merchant.
One signup, every protocol: A2A, ERC-8004, Entra Agent ID, MCP, Web Bot Auth.
T3 ADK wraps outbound agent actions: verifies identity, substitutes sensitive references inside a TEE, and writes an audit row to the ledger before it reaches the destination system.
Reference use cases: payroll, e-commerce procurement, e-visa form filling, travel booking.
```

From ADK docs:

```text
T3 ADK lets developers onboard an agent tenant identity, manage tenant-scoped data and TEE contracts, and execute TEE contracts inside T3N.
Key capabilities: authenticated session, tenant onboarding, tenant maps, tenant contracts, cross-tenant calls, hardware-enforced isolation.
Why ADK: identify agents, access user-authorized data, perform real-world actions without exposing sensitive info to model/app/agent runtime.
Trusted actions include transactions, approvals, interactions with external services using verifiable permissions and auditability.
```

From invoke-contract / placeholder docs:

```text
Agents authenticate as themselves, not tenants.
Before outbound HTTP, user/data owner signs agent-auth-update scoping the agent to contract/functions/allowed hosts.
For private data, contracts should use http-with-placeholders so plaintext profile fields resolve host-side inside the enclave; WASM never sees plaintext.
Disallowed hosts fail with host/http.egress_denied; unauthorized markers fail with placeholder not permitted.
```

## Current artifacts and hashes

```text
SUBMISSION_PACKET.md
sha256:e21f26725f521a8bd54cf67ed1ac1a5de90dc8dd3b37b35207aa35964af17366

SUBMISSION_FORM_FIELDS.md
sha256:2c83dfbf6851de13d6d06c8fa9962d6ffd082c228095108c5037543a4b16b20a

DEVREL_REPORT.md
sha256:5e25640ed7435e094230d5a0ff34af3f96bb24d72d4f976033e43e4095d85684

BUGS_AND_DOC_GAPS.md
sha256:574a95902efa1a547219cfd38e9cbb86169357526740449c8f69e5c9af5dd31e

JUDGE_WALKTHROUGH_90S.md
sha256:987df2f54023bc941d3cc4f8ea6ac2dfbd2cc68de4a0e03b6d9636553c5cc832

T3_BOUNTY_CRITERIA_RESCAN_20260615T170958Z.md
sha256:170a039dfb11ef2e5bb075c781a1e02aabb16102f7b45cd6cfe971d45f9dffe6

submission-bundles/terminal3-agent-passport-submission-final-20260615T161518Z.tar.gz
sha256:2bb54299c276625e6c002f0e9233c3977f1081234fcd3c0d87035e49ffd5a45a
```

## Current proven strengths

```text
- T3 DID-shaped Agent Passport envelope.
- Scoped protected-action gate before payload creation.
- Refusal before execution for over-cap, untrusted issuer, revoked passport, missing delegation, missing policy, missing governance witness, missing external registry anchor.
- No raw PII or private keys in public receipts/logs.
- Live Terminal 3 auth smoke with sanitized DID/balance.
- Live protected read correctly labeled live-submitted when no audit event exists.
- Live no-money/no-PII tenant-contract invocation emitting committed host-stamped audit event.
- Repeatability: 4/4 live-audited no-money/no-PII runs with distinct request IDs/audit event IDs.
- External audit registry anchor imports a committed T3 testnet audit event and refuses when missing/mismatched.
- DevRel report now countable: 11 discrete bug/doc findings in BUGS_AND_DOC_GAPS.md.
- Judge walkthrough script exists but no video/screenshots yet.
```

## Current known gaps / possible max-prize improvements

These are hypotheses for Council to judge, not instructions to implement all:

```text
A. Judge-speed proof:
   60–90 sec video, screenshots, hosted/public landing, clean README path.

B. DevRel lane packaging:
   issue-style countable bug/doc appendix; maybe submit each as separate issue-style section.

C. Real T3-native extension:
   user-grant / allowed-host / http-with-placeholders / egress-denial demo.
   This directly matches T3 docs about user-authorized private data and outbound calls.

D. Secure payment / Stripe test merchant:
   platform-native, but high claim risk; only if actually available and no real money/secrets/PII.

E. Protocol surfaces:
   MCP / A2A / ERC-8004 / Entra / Web Bot Auth are advertised. Current build does not use them. Decide whether to explicitly disclaim or build one minimal surface.

F. Use-case story:
   payroll/procurement/travel/e-visa overlay for judges, without falsely claiming those full flows are implemented.
```

## Forbidden overclaims remain forbidden

```text
delegated human authority solved
live human identity proofing / KYC complete
recognized external governance or legal authority solved
production trust complete
real payment/action flow proved
raw PII flow proved
```

## Council task

Give a max-prize plan, not a narrow final-submit verdict. The question is:

```text
With ~6 days left, what must we build/package to answer all Terminal 3 judges want while preserving truth?
```

Seat focus:

```text
Humboldt — challenge criteria, product fit, Design Partner angle, what judges reward.
Archimedes — engineering roadmap, feasibility, exact next build/test gates.
Sextus Empiricus — proof attacks, unsupported claims, secret/PII/payment risk, falsification.
Kallimachos — judge readability, artifact packaging, video/screenshots, countable bug lane.
Philo — authority boundary, human consent/governance language, moral safety of claims.
```

## Required deposit format

```text
Run token: T3_BOUNTY_MAX_LOOP_20260615T171622Z
Seat:
Verdict: BUILD_MAX / PACKAGE_MAX / BLOCK / ASK_T3_SUPPORT
Top 5 priorities in order:
One real technical extension worth building, if any:
One thing NOT worth doing:
What judges will reward most:
Evidence required before we may call it done:
Overclaim/secret/PII/payment risk:
Smallest next action for Leonardo:
Refusal condition:
```

## Decision rule for Leonardo after deposits

```text
- Any BLOCK: fix or report blocker before build/package.
- If majority PACKAGE_MAX: focus video/screenshots/public landing/devrel packaging; no new live T3 risk.
- If majority BUILD_MAX: implement the smallest real T3-native extension with tests and receipts, then package.
- If ASK_T3_SUPPORT: prepare exact support questions / wait only if necessary; do not invent unverified claims.
- Never call local scaffolding external governance.
- Final done state requires: implementation receipts, judge-speed proof, countable DevRel report, sanitized bundle, final Council re-rate, and explicit safe boundary.
```

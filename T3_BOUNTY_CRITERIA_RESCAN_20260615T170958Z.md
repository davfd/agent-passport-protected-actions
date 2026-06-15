# Terminal 3 ADK bounty — criteria/product rescan

**Stamp:** `20260615T170958Z`  
**Question:** Are we actually done, or only locally packet-ready?  
**Short answer:** current packet is ready-to-submit and Council-rated top-tier, but not maximized. If not yet externally submitted, we are not done. If already submitted, the best remaining legal/safe upgrades are judge-speed proof and separate devrel/bug packaging — not more local governance scaffolds.

## Access and source notes

- Direct browser access to `https://dorahacks.io/hackathon/t3adkdevchallenge/detail#criteria` returned human verification. No bypass attempted.
- Public-reader refresh used `https://r.jina.ai/http://https://dorahacks.io/hackathon/t3adkdevchallenge/detail`.
- Refreshed reader hash: `5b4d64b0093cdc3012352500c7360cabacb8da74571da38584ce771181e5b499`.
- Local cached reader hash: `14db4fc82e3b1ed2b7e4210c99aa0aa96b67cab0115fbc4b75b434764fa40eeb`.
- Diff from local cache: refreshed DoraHacks page adds: `Note : cash prizes will be paid out in fiat via wire / bank transfer, no stablecoins / crypto payment options will be provided.`

## DoraHacks criteria facts

From the refreshed DoraHacks reader / local cache:

```text
Bounty challenge runs from 9 June 2026 9.00AM to 22 June 2026 11.59PM (GMT+8).
Submit BUIDLs and bugs to get a chance to win the $2,000 cash prize pool.
Google grants 6 top teams $500 each in Google credits.
Cash prizes are fiat wire/bank transfer only; no stablecoins / crypto payout.
```

Judging lane 1:

```text
The best implementation of our Agent Auth SDK with a focus on:
- How complete is the solution that you have built
- How well integrated is the Agent Auth SDK in the solution
- How creative is your agentic solution
Past submissions in previous bounties cannot be reused.
```

Strategic bonus:

```text
Top submissions may be invited to Terminal 3 Design Partner, co-building and presenting partner solutions across enterprise partner network: governments, banks, institutions, corporates.
```

Judging lane 2:

```text
The most detailed developer that discovers and submits the most number of:
- bugs during onboarding
- documentation gaps
```

## Terminal 3 product/docs facts that matter for scoring

From the Terminal 3 claim/product page:

```text
T3N sandbox gives developers verifiable identity, programmable authorization, and secure payments.
20,000 test tokens are enough for 25 agents and ~5,000 protected actions.
Full SDK access includes npm, MCP server, plus a Stripe-backed test merchant.
One signup, every protocol: A2A, ERC-8004, Entra Agent ID, MCP, Web Bot Auth.
T3 ADK wraps outbound agent actions: verifies identity, substitutes sensitive references inside a TEE, and writes an audit row to the ledger before it reaches destination system.
Reference use cases: payroll, e-commerce procurement, e-visa form filling, travel booking.
```

From ADK docs:

```text
T3 ADK lets developers onboard an agent tenant identity, manage tenant-scoped data and TEE contracts, and execute TEE contracts inside T3N.
Key capabilities: authenticated session, tenant onboarding, tenant data maps, tenant contracts, cross-tenant calls, hardware-enforced isolation.
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

## Current packet fit

Current submission packet already maps strongly to criteria:

### Completeness

- `pnpm verify`: 11 test files / 45 tests, typecheck, build, local demo receipts.
- Live T3 auth smoke: sanitized DID and balance.
- Live protected read correctly marked `live-submitted`, not `live-audited`.
- Live no-money/no-PII tenant-contract audit probe emitted committed T3 audit events.
- Repeatability: 4/4 live-audited no-money/no-PII runs with distinct request IDs/audit event IDs.
- External registry anchor demo refuses when anchor missing and allows when policy + signed grant + witness + registry anchor match.
- Final sanitized bundle exists and passed scan.

### SDK integration

- Uses `@terminal3/t3n-sdk@3.5.2`.
- Uses `setEnvironment("testnet")`, `loadWasmComponent`, `eth_get_address`, `T3nClient`, `metamask_sign`, `createEthAuthInput`, `handshake`, `authenticate`, `getUsage`.
- Uses `T3nClient.getSelfEthAddress` for protected read.
- Registers/executes Rust/WIT tenant contract and polls `getAuditEvents` for audit binding.

### Creativity

- Converts T3 identity/action primitives into an Agent Passport / protected-action accountability envelope.
- Refuses before payload creation for scope/issuer/revocation/delegation/policy/witness/registry failures.
- Keeps raw PII and secrets out of receipts.
- Preserves an honest boundary: local scaffolds are not claimed as legal/KYC/production authority.

### Developer detail lane

- `DEVREL_REPORT.md` contains 11 concrete onboarding/docs/SDK/WIT findings with suggested fixes.

## What is still not done / still improvable

### 0. External DoraHacks submission

Final receipt explicitly says external DoraHacks submission was not performed from this workspace. If David/human account has not submitted, then we are plainly not done.

### 1. Judge-speed proof is missing

DoraHacks judges likely skim. Current packet is dense and correct, but lacks the fastest comprehension layer:

```text
- 60–90 second demo video
- 5–8 screenshots
- hosted/public landing page or public repo README landing
- one-page judge walkthrough
```

This is the highest ROI improvement because it does not change claims or require new T3 authority.

### 2. DevRel / bug lane should be packaged separately

The challenge separately rewards detailed bugs/docs gaps. A single `DEVREL_REPORT.md` is good, but the page says `submits the most number of bugs/documentation gaps`. Safer packaging:

```text
- DEVREL_REPORT.md attached as a report
- 11 numbered issue-style entries, each with observed behavior / expected behavior / repro / suggested fix
- optional zip or markdown appendix named BUGS_AND_DOC_GAPS.md
```

This helps Terminal 3 count them.

### 3. Product-page protocol surfaces are not used

Terminal 3 advertises MCP server, Stripe test merchant, A2A, ERC-8004, Entra Agent ID, Web Bot Auth. Current packet should not claim these. This is not a blocker, but a competitor using one of those visibly may look more platform-native.

Fast safe response: explicitly say we used SDK + T3 DID + TEE tenant contract + audit events, not MCP/Stripe/A2A/etc.  
Higher-risk build response: only add a protocol/payment demo if it can be actually run and receipted safely.

### 4. Outbound placeholder / user-grant path is not fully exercised

Terminal 3 docs emphasize user/data-owner `agent-auth-update`, allowed hosts, and `http-with-placeholders` resolving private data inside the enclave. Current build avoids raw PII and proves audit events; it does not prove a real placeholder-substitution flow or user-signed egress grant.

This is a legitimate next technical frontier, but it is not a quick copy patch. Only attempt if time remains and we can verify live without exposing raw PII or touching real money.

Safe possible target:

```text
no-money/no-PII placeholder/egress demonstration:
- unauthorized marker or host refuses;
- allowed mock host returns sanitized confirmation;
- receipt binds grant/scope/audit event;
- no raw user profile data in logs.
```

Do not claim raw-PII flow unless the live evidence actually proves it.

### 5. Sponsor use-case story could be sharper

The product page frames payroll, procurement, e-visa, and travel. Current demo is abstract but strong. Judges may reward a vivid scenario.

Fast safe response:

```text
Frame the demo as the control layer a payroll/procurement/travel agent would need before last-mile protected action.
Keep wording as pattern/applicability, not proof of payroll/procurement/payment execution.
```

### 6. Public/hosted proof path is missing

Current bundle is local/attachable. A hosted README/landing page or public repo improves trust and Design Partner optics. Must avoid secrets and must keep the safe boundary.

### 7. External authority / payments / raw PII remain forbidden unless real

Do not chase these without real partner/infrastructure:

```text
recognized external governance/KYC/legal authority
production payment/action flow
raw PII flow
production trust
```

A false claim here damages the packet more than it helps.

## Recommended next moves

### If deadline is near: do these, no new code

1. Submit current final packet if not already submitted.
2. Add a 60–90 second demo video or screenshot walkthrough.
3. Attach/upload `DEVREL_REPORT.md` plus a countable `BUGS_AND_DOC_GAPS.md` appendix.
4. Add one line in submission copy: `Does not use MCP/Stripe/A2A/Entra/Web Bot Auth; this submission focuses on SDK + DID + TEE tenant-contract audit receipts.`
5. Keep safe claim boundary unchanged.

### If there are 3–6 focused hours

1. Public landing/README page with screenshots and hashes.
2. `BUGS_AND_DOC_GAPS.md` with 11 separate issue-style entries.
3. Optional no-money/no-PII use-case overlay: payroll/procurement/travel story over existing receipts.
4. Do not add new governance scaffolds.

### If there is 1+ day and live T3 support is stable

Attempt one real platform-native extension:

```text
user-grant / allowed-host / placeholder / egress-denial demo
```

or a Stripe-test merchant flow, but only if it can be verified with no secret leakage, no raw PII exposure, no real money, and receipts.

## Verdict

Current state: **ready-to-submit, not maximized**.

If external DoraHacks submission has not happened: **not done**.

If external submission has happened: **still worth adding/supplementing only judge-speed proof and countable devrel bug packaging if the platform allows edits.**

The mistake would be thinking “not done” means “invent more local governance.” It does not. The next gains are presentation, countable devrel reporting, and — only if time/evidence permit — one real Terminal 3 platform-native protected-action extension.

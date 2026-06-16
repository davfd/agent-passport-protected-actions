# Agent Passport for Protected Actions

This is a safe checkout demo for AI agents.

A finance or ops team wants an AI assistant to handle routine vendor checkout. That is useful, but dangerous if the agent can spend money or touch private customer data whenever it wants.

This repo shows the safer pattern:

```text
AI checkout request
  ↓
check the agent passport
  ↓
check amount, target, consent, policy, and evidence
  ↓
if anything is wrong: refuse before creating the action payload
  ↓
if everything is allowed: run the bounded Terminal 3 testnet action
  ↓
write a receipt a human can inspect
```

The local demo is deliberately simple:

| Scenario | Result |
|---|---|
| Create a $425 test payment intent for the approved test merchant | allowed |
| Try a $650 payment when the cap is $500 | refused |
| Require delegated consent but provide no grant | refused |
| Provide the matching delegation grant | allowed |

No judge has to infer the use case. It is a buyer/payment assistant with a spending cap and receipts.

The deeper point: the same passport gate can sit in front of any protected agent action, not just checkout.

Repository:

```text
https://github.com/davfd/agent-passport-protected-actions
```

Current human-readable submission bundle:

```text
submission-bundles/terminal3-agent-passport-submission-story-patch-20260616T0217Z.tar.gz
submission-bundles/FINAL_STORY_PATCH_SUBMISSION_RECEIPT_20260616T0217Z.md
```

The story-patch bundle supersedes the older `20260615T2047Z` bundle for submission copy. The core code and evidence are the same class of build; this patch makes the human-facing product story obvious.

---

## What this is

**Agent Passport for Protected Actions** is a Terminal 3 ADK demo for controlled AI-agent spending and other protected actions.

The demo asks one practical question:

> Before an AI agent creates a payment or protected action, can we prove who the agent is, what it is allowed to do, why this request is allowed, and what receipt remains afterward?

In this repo, the answer is yes for a bounded Terminal 3 testnet demo.

The agent has a passport-like identity and authority object. A request must fit that authority before any Terminal 3 payload is created. If the request is too large, aimed at the wrong target, missing delegated consent, missing a policy anchor, missing a witness, or missing a required registry/audit anchor, the gate refuses first.

That matters. The agent does not act first and explain later.

---

## Plain-English example

Imagine an AI billing assistant.

A human says:

```text
Pay this vendor invoice.
```

A normal tool-calling agent might try to do it if it has access to the payment tool.

This project says no. First the agent has to answer:

```text
Who am I?
Am I allowed to create this kind of payment?
Is this the approved merchant?
Is the amount under my cap?
Do I have the required delegation or consent?
Can I produce an audit receipt?
```

If any answer is wrong or missing, the action is refused.

This demo does not move real money. It uses Terminal 3 testnet, payment-intent shaped actions, placeholder-only private data, and receipts. The point is the control pattern.

---

## What it proves

The repo proves a practical agent-control pattern:

- an agent can carry a Terminal 3 DID-shaped passport;
- a payment/protected-action request can be checked before payload creation;
- a $425 in-scope test payment intent can be allowed;
- a $650 over-cap attempt can be refused;
- a delegated-consent-required action can refuse when the grant is missing;
- the same action can pass when the matching grant is present;
- receipts record the decision without raw PII or private keys;
- Terminal 3 testnet paths exercise auth, usage, wallet/history, audit-read, tenant-contract execution, safe egress, and audit receipts.

In one line:

```text
the agent cannot spend first and justify later
```

It must pass the passport gate before the protected action exists.

---

## What it does not prove

This is not a production payments product.

This demo does not claim:

- production trust is solved;
- live KYC or human identity proofing is complete;
- legal authority is solved;
- real payment movement is proved;
- raw PII access is proved.

Correct claim:

```text
This build proves Terminal-3-native scoped agent authority on testnet: auth, usage, wallet/history, audit-read, tenant-contract execution, scoped safe egress, audit receipts, and refusal boundaries. It deliberately does not claim production trust, live KYC/human identity proofing, legal authority, real payment movement, or raw-PII disclosure.
```

---

## Where to look first

If you have five minutes, read these in order:

1. [`agent-passport-protected-actions/src/demo.ts`](agent-passport-protected-actions/src/demo.ts) - the $425 allowed / $650 refused / delegation demo.
2. [`agent-passport-protected-actions/src/protected-action.ts`](agent-passport-protected-actions/src/protected-action.ts) - the main allow/refuse gate.
3. [`agent-passport-protected-actions/src/passport.ts`](agent-passport-protected-actions/src/passport.ts) - the agent passport object.
4. [`agent-passport-protected-actions/src/receipt.ts`](agent-passport-protected-actions/src/receipt.ts) - receipt hashing and writing.
5. [`SUBMISSION_PACKET.md`](SUBMISSION_PACKET.md) - the hackathon submission summary.

If you only want to run the demo, use the next section.

---

## Run it locally

You need Node and pnpm.

```bash
git clone https://github.com/davfd/agent-passport-protected-actions.git
cd agent-passport-protected-actions/agent-passport-protected-actions
pnpm install --frozen-lockfile
pnpm verify
```

Expected result:

```text
13 test files passed
52 tests passed
typecheck passed
build passed
local demo wrote allowed and refused receipts
```

The local demo writes these receipts:

```text
receipts/demo_allowed-allowed.json
receipts/demo_refused_over_cap-refused.json
receipts/demo_delegated_missing_grant-refused.json
receipts/demo_delegated_allowed-allowed.json
```

---

## Run live Terminal 3 testnet probes

The local demo does not need a Terminal 3 API key.

Live testnet probes do.

Use your own key. Do not commit it. Do not paste it into a chat or issue.

```bash
cp .env.example .env
# edit .env and set T3N_API_KEY=***
set -a; . ./.env; set +a
pnpm t3n:smoke
pnpm t3n:audit-probe
pnpm t3n:safe-egress
pnpm t3n:sdk-breadth
```

Those scripts exercise Terminal 3 SDK paths and write sanitized logs/receipts.

---

## What is in the code

```text
agent-passport-protected-actions/
  src/demo.ts              $425 allowed / $650 refused / delegation demo
  src/passport.ts          the agent identity/passport object
  src/protected-action.ts  the main permission gate
  src/receipt.ts           receipt hashing and writing
  src/t3n.ts               Terminal 3 SDK helpers
  src/audit.ts             audit-event helpers
  src/delegation.ts        delegated authority check
  src/consent.ts           signed consent ceremony
  src/policy.ts            policy hash anchor
  src/governance.ts        signed governance witness
  src/registry.ts          external audit registry anchor
  src/safe-egress.ts       safe egress helpers
  src/sdk-breadth.ts       SDK breadth probe
  src/cli/*.ts             local and live demos
  tests/*.test.ts          Vitest tests
  receipts/*.json          generated receipts
  logs/*.json              sanitized logs

repos/z-audit-probe/       Rust/WIT contract that emits an audit event
repos/z-safe-egress-demo/  Rust/WIT contract using http-with-placeholders
submission-bundles/        curated build packages and receipts
```

---

## What was verified

Latest local verification:

```text
pnpm install --frozen-lockfile: passed
pnpm verify: passed
13 test files passed
52 tests passed
typecheck passed
build passed
local demo wrote receipts
```

Rust/WASM checks:

```text
z-audit-probe cargo test/build/wasm validate: passed
z-safe-egress-demo cargo test/build/wasm validate: passed
```

The current story-patch bundle is also verified from a fresh extract. See:

```text
submission-bundles/FINAL_STORY_PATCH_SUBMISSION_RECEIPT_20260616T0217Z.md
```

---

## Hackathon submission files

For the main build submission, use the newest story-patch bundle and receipt:

```text
submission-bundles/terminal3-agent-passport-submission-story-patch-20260616T0217Z.tar.gz
submission-bundles/FINAL_STORY_PATCH_SUBMISSION_RECEIPT_20260616T0217Z.md
SUBMISSION_FORM_FIELDS.md
SUBMISSION_PACKET.md
README.md
```

For the separate bug/docs bounty lane, use:

```text
BUGS_AND_DOC_GAPS_RULE_COMPLIANT_APPENDIX_20260615T191349Z.md
DEVREL_REPORT.md
```

Do not mix those two lanes. The tarball is the working build. The bug/docs files are a separate report.

---

## One-sentence version

This repo shows a safe AI checkout assistant: it can create a bounded test payment intent when the agent passport allows it, refuses over-cap or missing-consent requests before execution, and leaves receipts a human can inspect.

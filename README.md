# Agent Passport for Protected Actions

An AI agent should not be able to do sensitive things just because it can type a command.

This project shows a safer pattern:

1. Give the agent an identity.
2. Check what the agent is allowed to do.
3. Refuse before doing anything if the request is outside that permission.
4. If the action is allowed, run it on Terminal 3 testnet.
5. Save a receipt so a person can inspect what happened later.

That is the whole idea.

Think of it like a badge, a permission slip, and a logbook for an AI agent.

```text
request from agent
  ↓
check the agent passport
  ↓
allowed? ── no ──> refuse and write a receipt
  ↓ yes
run the bounded Terminal 3 testnet action
  ↓
write an audit receipt
```

Repository:

```text
https://github.com/davfd/agent-passport-protected-actions
```

Final build artifact:

```text
submission-bundles/terminal3-agent-passport-submission-build-council-20260615T2047Z.tar.gz
sha256: f15da968634c48f5e1ebdf725664e8bbe510131a34403b30234d340483abaf2e
```

---

## What this is

This is a working Terminal 3 ADK demo.

It is built around one simple question:

> Before an AI agent takes a protected action, can we prove who it is, what permission it has, why the action is allowed, and what happened afterward?

The answer in this repo is yes, for a bounded testnet demo.

The project uses Terminal 3 for identity, testnet actions, and audit evidence. Around that, it adds a small local policy layer that decides whether the agent may act.

If the request is valid, the demo builds the Terminal 3 action payload and writes a receipt.

If the request is not valid, the demo refuses before it builds the payload. That matters. The agent does not "try anyway" and explain later. It stops first.

---

## Plain-English example

Imagine an AI billing assistant.

A human says:

```text
Pay this vendor invoice.
```

A normal agent might try to do it if it has the tool.

This project says no. First the agent has to answer:

```text
Who am I?
What action am I trying to take?
Am I allowed to take this action?
Is the amount under my limit?
Do I have the required delegation or consent?
Can I produce a receipt if I act?
```

If any answer is wrong or missing, the action is refused.

This demo does not move real money. It uses bounded Terminal 3 testnet actions and no raw PII. The point is the control pattern, not a production payment system.

---

## What it proves

The repo proves that we can wrap an AI agent action in a practical permission check:

- the agent has a passport-like identity object;
- the requested action is checked against scope, caps, policy, consent, and witness evidence;
- invalid requests fail closed;
- allowed requests produce receipts;
- Terminal 3 testnet calls and audit evidence are used;
- safe egress is tested with placeholder-based private-data handling;
- the SDK is exercised across auth, usage, wallet/history, audit-read, and KYC-boundary calls.

In short:

```text
the agent cannot act first and justify later
```

It must pass the gate before the protected action exists.

---

## What it does not prove

This is important.

This demo does not claim:

- production trust is solved;
- live KYC or human identity proofing is complete;
- legal authority is solved;
- real payment movement is proved;
- raw PII access is proved.

The correct claim is narrower:

```text
This build proves Terminal-3-native scoped agent authority on testnet: auth, usage, wallet/history, audit-read, tenant-contract execution, scoped safe egress, audit receipts, and refusal boundaries.
```

That narrower claim is the useful one.

---

## Where to look first

If you have five minutes, read these in order:

1. [`SUBMISSION_PACKET.md`](SUBMISSION_PACKET.md) - the hackathon submission summary.
2. [`agent-passport-protected-actions/src/protected-action.ts`](agent-passport-protected-actions/src/protected-action.ts) - the main allow/refuse gate.
3. [`agent-passport-protected-actions/src/passport.ts`](agent-passport-protected-actions/src/passport.ts) - the agent passport object.
4. [`agent-passport-protected-actions/src/receipt.ts`](agent-passport-protected-actions/src/receipt.ts) - how receipts are hashed and written.
5. [`submission-bundles/FINAL_BUILD_COUNCIL_SUBMISSION_RECEIPT_20260615T2047Z.md`](submission-bundles/FINAL_BUILD_COUNCIL_SUBMISSION_RECEIPT_20260615T2047Z.md) - final verification receipt.

If you only want to run the demo, skip to the next section.

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

`pnpm verify` runs:

```text
pnpm test
pnpm typecheck
pnpm build
pnpm demo:local
```

The local demo writes receipts for both allowed and refused actions.

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
pnpm t3n:safe-egress
pnpm t3n:sdk-breadth
```

Those scripts exercise Terminal 3 SDK paths and write sanitized logs/receipts.

---

## What is in the code

```text
agent-passport-protected-actions/
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
submission-bundles/        final build package and final receipt
```

---

## What was verified

Final verification recorded:

```text
pnpm verify: passed
13 test files passed
52 tests passed
typecheck passed
build passed
local demo wrote receipts
```

The final bundle was also unpacked fresh and verified from scratch.

The bundle scan found:

```text
no .env
no .git
no node_modules
no target dirs
no raw ETH-address files
no known secret values
no private-key PEMs
no nonempty T3N_API_KEY assignments
```

Final build bundle:

```text
submission-bundles/terminal3-agent-passport-submission-build-council-20260615T2047Z.tar.gz
sha256: f15da968634c48f5e1ebdf725664e8bbe510131a34403b30234d340483abaf2e
size: 313412 bytes
members: 115
```

Final receipt:

```text
submission-bundles/FINAL_BUILD_COUNCIL_SUBMISSION_RECEIPT_20260615T2047Z.md
sha256: e42f55b08c307b01bdf5fea426cd37d563e626662f6cf2effc543b14f4778a60
```

---

## Hackathon submission files

For the main build submission, use:

```text
submission-bundles/terminal3-agent-passport-submission-build-council-20260615T2047Z.tar.gz
submission-bundles/FINAL_BUILD_COUNCIL_SUBMISSION_RECEIPT_20260615T2047Z.md
SUBMISSION_FORM_FIELDS.md
SUBMISSION_PACKET.md
README.md
T3_BUILD_SUBMISSION_COUNCIL_JUDGMENT_SYNTHESIS_20260615T2047Z.md
```

For the separate bug/docs bounty lane, use:

```text
BUGS_AND_DOC_GAPS_RULE_COMPLIANT_APPENDIX_20260615T191349Z.md
DEVREL_REPORT.md
```

Do not mix those two lanes. The tarball is the working build. The bug/docs files are a separate report.

---

## Review note

A visible Discord Council review was attempted, but the seats withdrew because of provider/usage-limit transport failures. Those withdrawals were not counted as approval.

A fallback independent audit returned:

```text
READY_BUILD_SUBMIT: 4
REVISE_COPY_ONLY: 1
BLOCK: 0
average: 8.8 / 10
```

The one copy-only issue was a stale hash in docs. It was patched, the build stayed green, and the final 2047Z bundle was rebuilt and rescanned.

---

## One-sentence version

This repo shows how an AI agent can carry an identity and permission envelope, refuse unsafe requests before execution, run only bounded Terminal 3 testnet actions, and leave receipts a human can inspect.

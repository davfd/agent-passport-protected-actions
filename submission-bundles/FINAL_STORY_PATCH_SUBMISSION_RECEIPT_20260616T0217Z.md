# Final story-patch submission receipt — Terminal 3 Agent Passport

**Status:** `READY_BUILD_SUBMIT_AFTER_STORY_PATCH`  
**Stamp:** `20260616T0217Z`  
**Purpose:** fixes the gap David identified from the BoundBuyer comparison: the public artifact now opens with a concrete human use case instead of abstract agent-trust language.

## What changed

The submission is now framed around a simple AI checkout / vendor-payment assistant:

```text
$425 test payment intent to approved merchant: allowed
$650 over-cap attempt when cap is $500: refused
consent-required payment without delegation: refused
same payment with matching delegation: allowed
```

This makes the judge's first question easy:

```text
Can an AI agent safely handle routine checkout without getting unlimited spend or data access?
```

The answer demonstrated by the build is:

```text
Yes, on Terminal 3 testnet, when the agent carries a passport and must pass amount, target, consent, policy, evidence, and audit gates before a protected payload is created.
```

## Current artifact

```text
bundle: submission-bundles/terminal3-agent-passport-submission-story-patch-20260616T0217Z.tar.gz
sha256: 44eb67ad0fa6547a9d100fddb9c365a86fc1e32aeb4a3d7816ad595f93ea2d36
size: 307740 bytes
members: 115
```

This supersedes the older copy-facing bundle:

```text
submission-bundles/terminal3-agent-passport-submission-build-council-20260615T2047Z.tar.gz
```

The older bundle remains in the repo as history/evidence, but the story-patch bundle is the one to submit if the goal is a human-readable judge package.

## Files patched for human comprehension

```text
README.md
agent-passport-protected-actions/README.md
SUBMISSION_PACKET.md
SUBMISSION_FORM_FIELDS.md
JUDGE_WALKTHROUGH_90S.md
T3_BUILD_SUBMISSION_COUNCIL_JUDGMENT_PACKET_20260615T203639Z.md
T3_POST_SDK_BREADTH_COUNCIL_AUDIT_SYNTHESIS_20260615T2001Z.md
```

## Demo receipts preserved

| Receipt | Whole-file sha256 |
|---|---:|
| `agent-passport-protected-actions/receipts/demo_allowed-allowed.json` | `62f8560b0681b8a189cd69d5e5dded21ace06c5f5bc592b0449ccd4b9f801689` |
| `agent-passport-protected-actions/receipts/demo_refused_over_cap-refused.json` | `592bef0e7f0238fe00a1c5062a6e0427b9500900e3745b15d364612713402e28` |
| `agent-passport-protected-actions/receipts/demo_delegated_missing_grant-refused.json` | `42e47c9d64eaa4d24f249a1f5f946dbc02228bc266204a4fa5c2afe8f7d19715` |
| `agent-passport-protected-actions/receipts/demo_delegated_allowed-allowed.json` | `2bab2db82112f8580cbe2d13b2a1c76634fa42de17bba33598414ea82530b30b` |

## Fresh extracted-bundle verification

```text
log: logs/story-patch-fresh-bundle-verify-20260616T0217Z.txt
log sha256: a270c7d6f3e9e5ff16497b7dae3478a7adbb40cb21351b2099deae05b7d4a41f
```

Observed result:

```text
pnpm install --frozen-lockfile: passed
pnpm verify: passed
13 test files passed
52 tests passed
typecheck passed
build passed
local demo wrote receipts
```

The local demo output included:

```text
ALLOWED in-scope -> receipts/demo_allowed-allowed.json
REFUSED amount 65000 exceeds passport cap 50000 -> receipts/demo_refused_over_cap-refused.json
REFUSED delegation grant is required for this protected action -> receipts/demo_delegated_missing_grant-refused.json
ALLOWED in-scope -> receipts/demo_delegated_allowed-allowed.json
```

## Bundle safety scan

```text
scan: logs/story-patch-bundle-safety-scan-20260616T0217Z.json
scan sha256: 179d44809572813a8bf70c8ada1a5fe84951f5cd2d1c27ac4d06d7daf33915f0
ok: true
bad_env_names: []
git_dirs: []
node_modules: []
target_dirs: []
dist_dirs: []
nonempty_secret_assignments: []
private_key_pem_hits: []
old_weak_readme_markers: []
old_status_markers: []
raw_eth_files_flagged_count: 0
```

## Safe submission claim

```text
Agent Passport for Protected Actions demonstrates safe AI checkout on Terminal 3 testnet. A $425 test payment intent under the passport cap is allowed; a $650 over-cap attempt and a missing-delegation attempt are refused before payload creation; the matching delegated-consent path is allowed; and every path leaves a receipt. The build also exercises Terminal 3 auth, tenant-contract audit events, scoped safe egress, SDK breadth probes, and tamper-evident receipts. It does not claim production trust, legal authority, real payment movement, completed KYC/human identity proofing, or raw-PII disclosure.
```

## Human-facing first screen check

The root README now begins:

```text
This is a safe checkout demo for AI agents.

A finance or ops team wants an AI assistant to handle routine vendor checkout. That is useful, but dangerous if the agent can spend money or touch private customer data whenever it wants.
```

## Human action

Submit this story-patch bundle and copy from `SUBMISSION_FORM_FIELDS.md`. Do not paste API keys, `.env` contents, private keys, raw human identity, or raw PII.

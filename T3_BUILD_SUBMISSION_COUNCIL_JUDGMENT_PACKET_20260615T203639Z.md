# Terminal 3 build submission — Council judgment packet

**Run token:** `T3_BUILD_SUBMISSION_COUNCIL_JUDGMENT_20260615T203639Z`  
**Requested by:** David  
**Scope:** BUILD TRACK / main BUIDL submission only. This is not the bug/docs bounty-track judgment.  
**Thread:** Discord Terminal 3 thread `1515563429677633646`

## Artifact to judge

```text
bundle: submission-bundles/terminal3-agent-passport-submission-max-curated-20260615T2025Z.tar.gz
bundle sha256: 11a14158694684616eda8751706ff77fb3f50e3f058ca87d21a76549ac1a374e
bundle size: 308966 bytes
bundle member_count: 111
final receipt: submission-bundles/FINAL_MAX_SUBMISSION_RECEIPT_20260615T2025Z.md
final receipt sha256: 756d078ac4e05c83922b5177d6a03fb48cc9adf38997637b5582cd8a980a55e4
clean handoff receipt: T3_CLEAN_HANDOFF_READINESS_20260615T2025Z.md
clean handoff receipt sha256: 1135e17a050feeca98f4c396de2dc6e9a14dc1cb8fdc798ecbc021a6cd54f0fa
root README sha256: e4e6ba5858f2d925b385de207d723f6fab6a2d7138a6ff025d991093386f8fa6
```

## Build submission claim

Agent Passport for Protected Actions is a Terminal-3-native build submission:

```text
T3 DID / Agent Passport
→ scoped authority envelope
→ refusal before payload when scope/evidence missing
→ no-money/no-raw-PII tenant-contract execution on T3 testnet
→ committed Terminal 3 audit receipts
→ scoped http-with-placeholders safe egress
→ SDK breadth probe over auth / usage / wallet-history / audit-read / KYC-boundary
```

## What was verified

Working-tree verification:

```text
pnpm verify
13 test files passed
52 tests passed
typecheck passed
build passed
local demo wrote receipts
log: logs/clean-handoff-verify-20260615T2025Z.txt
log sha256: 80ba42fdb0c33fb6546a17a66c665c559c8bf94cd7d4acaca2a5bde6534810da
```

Fresh extracted-bundle verification:

```text
tar -xzf submission-bundles/terminal3-agent-passport-submission-max-curated-20260615T2025Z.tar.gz -C /tmp/t3-clean-handoff-final-20260615T2025Z
cd /tmp/t3-clean-handoff-final-20260615T2025Z/agent-passport-protected-actions
pnpm install --frozen-lockfile
pnpm verify
result: install passed; 13 test files passed; 52 tests passed; typecheck passed; build passed; local demo wrote receipts
log: logs/fresh-bundle-extract-verify-20260615T2025Z.txt
log sha256: 175d91c8f419726d222f140f6329b11b45f710d4666d3b8523e070202b79a118
```

Rust/WASM checks:

```text
repos/z-audit-probe: cargo test passed; wasm32-wasip2 release build passed; wasm-tools validate passed
repos/z-safe-egress-demo: cargo test passed; wasm32-wasip2 release build passed; wasm-tools validate passed
```

Bundle hygiene scan:

```text
bad_env_names: []
git_dirs: []
node_modules: []
target_dirs: []
raw_eth_files: []
secretish_keys_checked: [T3N_API_KEY]
secretish_value_hits: []
nonempty_T3N_API_KEY_assignments: []
private_key_pem_hits: []
required_members_missing: []
scan: logs/clean-bundle-safety-scan-20260615T2025Z.json
scan sha256: b5f1b62fd7a2ba03f25ec0e302125ddc916c5df8f0d6b51e3a4d8414f00aee27
```

## Judging frame

This is the main build submission / BUIDL. Judge for:

```text
Completeness: can a fresh reviewer install and verify it?
SDK/ADK depth: does it use Terminal 3 SDK/ADK surfaces deeply enough?
Creativity: does Agent Passport for Protected Actions make a differentiated build?
Safety: does it avoid unsupported production/KYC/legal/payment/raw-PII claims?
Packaging: is the README/handoff enough for a judge to understand and run?
```

## Do not judge as the bug/docs bounty lane

Bug/docs bounty artifacts are separate:

```text
BUGS_AND_DOC_GAPS_RULE_COMPLIANT_APPENDIX_20260615T191349Z.md
DEVREL_REPORT.md
```

They may be noted as supporting material, but the verdict here is for the build tarball.

## Forbidden overclaims

A `READY_BUILD_SUBMIT` verdict must still forbid these claims:

```text
production trust solved
live KYC / human identity proofing solved
recognized legal/governance authority solved
real payment movement proved
raw PII disclosure flow proved
```

Safe line:

```text
This build proves Terminal-3-native scoped agent authority on testnet: auth, usage, wallet/history, audit-read, tenant-contract execution, scoped safe egress, audit receipts, and refusal boundaries. It deliberately does not claim production trust, live KYC/human identity proofing, legal authority, real payment movement, or raw-PII disclosure.
```

## Required Council deposit format

```text
Run token: T3_BUILD_SUBMISSION_COUNCIL_JUDGMENT_20260615T203639Z
Seat:
Verdict: READY_BUILD_SUBMIT / REVISE_COPY_ONLY / BLOCK
Score 1-10:
Strongest reason:
Required change before main BUIDL submit, if any:
Overclaim / secret / reproducibility risk found:
One thing that could still beat this build:
Best one-line build-submission pitch:
```

Decision rule:

```text
Any BLOCK pauses submission.
REVISE_COPY_ONLY permits copy/package-only patch and rehash.
READY_BUILD_SUBMIT means the build tarball is acceptable as the main BUIDL artifact.
Visible transport withdrawal is not a vote.
```

## Seat focus

```text
Philo — authority boundary, KYC/legal/payment/raw-PII moral claims.
Archimedes — engineering completeness, fresh extracted-bundle verification, reproducibility.
Humboldt — Terminal 3 build-track fit, SDK/ADK depth, judge value.
Sextus Empiricus — proof attack, secret/privacy scan, unsupported claim risk.
Kallimachos — packaging, README clarity, handoff completeness, correct build-vs-bounty split.
```

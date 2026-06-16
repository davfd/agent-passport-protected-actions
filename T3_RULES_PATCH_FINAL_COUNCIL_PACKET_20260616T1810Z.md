# T3 rules-patch final Council packet — 10/10 readiness check

**Run token:** `T3_RULES_PATCH_FINAL_COUNCIL_20260616T1810Z`  
**Discord thread:** `1515563429677633646`  
**Scope:** final submission-readiness audit after rules-patch bundle.

## Artifact

```text
repo: https://github.com/davfd/agent-passport-protected-actions
commit: b60b273 Add Terminal 3 rules-patch submission bundle
bundle: submission-bundles/terminal3-agent-passport-submission-rules-patch-20260616T1759Z.tar.gz
bundle sha256: 152a7daae7e87b6fc627ef485d848ddc7375ffdfe54d7c5081db21101951ee23
receipt: submission-bundles/FINAL_RULES_PATCH_SUBMISSION_RECEIPT_20260616T1759Z.md
receipt sha256: 8b27922294ce6a2abc19a2c025197a8b9b203fd22b4346d3b814cd322b175a77
```

## Authoritative rules extract

Direct DoraHacks access was WAF-gated. The operator supplied the rendered challenge text, preserved in `CHALLENGE_RULES_EXTRACT.md`.

Best Agent scoring:

```text
Completeness (30%)
SDK integration in its entirety (40%)
Creativity (30%)
```

Bug/docs lane:

```text
SDK-related bugs during onboarding and documentation gaps.
Each report must be real, in-scope, actionable, verifiable, require code/docs change, and contain reproduction.
```

Video check:

```text
No video requirement appears in the supplied challenge text or CHALLENGE_RULES_EXTRACT.md.
A 60-90 sec walkthrough is useful judge-speed packaging, not a stated rule requirement from the extracted rules.
```

## Current evidence

```text
pnpm verify: passed — 14 test files / 54 tests, typecheck, build, local demo.
fresh extracted bundle verify: passed.
fresh extracted Rust/WASM: passed for z-audit-probe and z-safe-egress-demo.
bundle safety scan: passed — no .env, .git, node_modules, dist, target, secret assignments, private key PEMs, raw ETH files, missing required members.
```

## Submission components

Build track:

```text
terminal3-agent-passport-submission-rules-patch-20260616T1759Z.tar.gz
FINAL_RULES_PATCH_SUBMISSION_RECEIPT_20260616T1759Z.md
SUBMISSION_FORM_FIELDS.md
SUBMISSION_PACKET.md
README.md
JUDGE_WALKTHROUGH_90S.md
```

Bug/docs track:

```text
DEVREL_REPORT.md
BUGS_AND_DOC_GAPS_RULE_COMPLIANT_APPENDIX_20260615T191349Z.md
CHALLENGE_RULES_EXTRACT.md
```

## Safe claim boundary

```text
Testnet safe-checkout/protected-action demo.
$425 test payment-intent shaped action allowed.
$650 over-cap and missing-delegation attempts refuse before payload creation.
Matching delegation allows.
Terminal 3 auth, tenant-contract audit events, scoped safe egress, SDK breadth probes, receipts, and 11 countable SDK bug/docs findings.
No production trust, legal authority, real money movement, completed KYC/human identity proofing, or raw-PII disclosure claim.
```

## Seat mandates

```text
Philo — authority boundary and moral/legal/KYC/payment/raw-PII claims.
Archimedes — engineering completeness, reproducibility, bundle/test receipts.
Humboldt — challenge fit against 30/40/30 and Design Partner positioning.
Sextus Empiricus — proof attack: unsupported claim, stale hash, secret/privacy risk, rule mismatch.
Kallimachos — judge readability, paste-ready packaging, whether video is required vs optional.
```

## Required visible deposit format

```text
Run token: T3_RULES_PATCH_FINAL_COUNCIL_20260616T1810Z
Seat:
Verdict: READY_10_OF_10 / READY_9_OF_10_OPTIONAL_VIDEO / REVISE_COPY_ONLY / BLOCK
Score:
Strongest reason:
One required change, if any:
Does the supplied rule text require a video? YES/NO, with reason:
Best line for winning the bounty:
Overclaim/secret risk found:
```

Decision rule:

```text
Any BLOCK blocks submission.
REVISE_COPY_ONLY requires a copy patch and reseal.
READY_9_OF_10_OPTIONAL_VIDEO means artifact is submit-ready but optional video/screenshots would improve cold-judge comprehension.
READY_10_OF_10 means no required change; optional video is not counted as a rule blocker.
```

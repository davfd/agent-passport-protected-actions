# Terminal 3 ADK bounty — Post-SDK-breadth Council audit packet

**Run token:** `T3_POST_SDK_BREADTH_COUNCIL_AUDIT_20260615T194334Z`  
**Thread:** Discord `1515563429677633646`  
**Project:** Agent Passport for Protected Actions  
**Mode:** full five-seat Council audit after the SDK breadth continuation  
**Scope:** final submission audit: evidence, copy, packaging, bug lane, SDK-in-entirety fit  
**Default action rule:** no new code/live runs unless a Council seat finds a true `BLOCK`; copy-only fixes allowed if needed

## Current final bundle under audit

```text
bundle: submission-bundles/terminal3-agent-passport-submission-max-curated-20260615T1927Z.tar.gz
bundle path: /home/exor/Leonardo/hackathons/terminal3-adk/submission-bundles/terminal3-agent-passport-submission-max-curated-20260615T1927Z.tar.gz
bundle sha256: 9adb76f27e0c17f69be81f986f7ec9057e79cd8686fa82f719759489b87ff379
bundle size: 305563 bytes
bundle member count: 105
final receipt: submission-bundles/FINAL_MAX_SUBMISSION_RECEIPT_20260615T1927Z.md
final receipt sha256: 74a89c5f74c268fdebff6cc56e64356cbea24273f1ec0ea432d5a4bb6dfee822
```

Bundle safety scan already run:

```text
bad_env_names=[]
secretish_keys_checked=['T3N_API_KEY']
secretish_value_hits=[]
has_sdk_breadth_source=True
has_sdk_breadth_receipt=True
has_rules_appendix=True
```

## Current artifact hashes

| Artifact | sha256 |
|---|---:|
| `SUBMISSION_PACKET.md` | `eab744b3373f0caa60c5161cb0d8ccf38fd9e7411f2a79ea6d3d4169dd8eaaf6` |
| `SUBMISSION_FORM_FIELDS.md` | `26e3650cea694396e22e216f7ed1e3e51f9422374bc3dddb32ac941b3b134851` |
| `EVIDENCE_MANIFEST.md` | `be17d77f6eaa53780343029dbca0a3fad105b9b88a95326710b2fcae38e38da3` |
| `DEVREL_REPORT.md` | `5e25640ed7435e094230d5a0ff34af3f96bb24d72d4f976033e43e4095d85684` |
| `BUGS_AND_DOC_GAPS_RULE_COMPLIANT_APPENDIX_20260615T191349Z.md` | `1eb68afd3ec28b8d668e2b784422f54dc9ae028fc746850869f955a8edf4f983` |
| `T3_RULES_ALL_LINKS_RESCAN_20260615T191349Z.md` | `bd4ec41f08714406a5ed2ae096b7ac537230415b56a6e5f0c199849fa2532d87` |
| `T3_SDK_BREADTH_IMPLEMENTATION_RECEIPT_20260615T192705Z.md` | `73122ba74bed18b081973fe73db2d7117095aa3c8db61298e8a76f8b00a1ee26` |
| `logs/bounty-package-verify-20260615T1927Z.txt` | `9a62540f780d412086f9eab305dfc89eb7bb868013fcf1ff3fe31d4935fc88f2` |

## Latest verification basis

```text
pnpm verify
✓ 13 test files passed
✓ 52 tests passed
✓ typecheck passed
✓ build passed
✓ local demo wrote receipts
```

Verification log:

```text
logs/bounty-package-verify-20260615T1927Z.txt
sha256: 9a62540f780d412086f9eab305dfc89eb7bb868013fcf1ff3fe31d4935fc88f2
```

Live safe-egress proof remains in packet:

```text
denied before grant
self-grant scoped agent to one z: contract/function/host
placeholder lookup failure returned no raw PII
allowed host egress succeeded and produced live-audited receipt
```

Live SDK breadth proof added after the previous Council round:

```text
command: pnpm t3n:sdk-breadth
status: ok=true
receipt: agent-passport-protected-actions/receipts/sdk_breadth-20260615t192626284z-live-submitted.json
receipt whole-file sha256: 2066eab85f00a2df074ddb77280944f9292b115685d8c7e911c1c9f3d567ad23
embedded receiptHash: sha256:aa9bd48c91d8c752e1fd47a3f9fcf4e161107412e71df4d9f8aee09619d4f69f
log sha256: 87f334838cb3a4ddf089886392367a82f7c2b178d819f8bd4ba99accded3c194
```

Observed live SDK breadth surfaces:

```text
auth ok; address hashed only
usage ok; balanceAvailable=1546
wallet/history ok; wallet address hashed only
humanIdentity refused before provider-session setup; safeClaim=not-proved-by-this-probe
auditRead ok; batchCount=5; eventCount=5
```

## Challenge criteria to audit against

DoraHacks / Terminal 3 scoring from refreshed rule scan:

```text
How complete the solution is — 30%
How well integrated is the SDK in its entirety — 40%
How creative is the application of the SDK in your agent — 30%
```

Bug/docs bounty rule shape:

```text
real issue
SDK-related
actionable/verifiable
requires code change
contains reproduction
no duplicate / low-effort / scanner-only report
```

Current bug/docs appendix has 11 findings in countable form.

## Current safe claim

```text
This build proves Terminal-3-native scoped agent authority on testnet: auth, usage, wallet/history, audit-read, tenant-contract execution, scoped safe egress, audit receipts, and refusal boundaries. It deliberately does not claim production trust, live KYC/human identity proofing, legal authority, real payment movement, or raw-PII disclosure.
```

## Forbidden overclaims

```text
production trust solved / complete
KYC or live human identity proofing solved / complete
recognized legal/governance authority solved
real payment movement proved
raw PII disclosure flow proved
external audit registry = external legal/governance authority
kycStatus refusal = KYC success or KYC failure
```

## Seat-specific audit mandates

### Philo — authority / moral claim boundary

Audit whether the new SDK breadth copy preserves the authority boundary. Special focus: `humanIdentity refused before provider-session setup` must stay `not-proved-by-this-probe`, not KYC success/failure. No legal/governance/payment/raw-PII inflation.

### Archimedes — engineering completeness / verification

Audit whether the evidence chain is technically sufficient after SDK breadth. Is there any real blocker in tests, receipts, live proof, bundle construction, or reproducibility? If not, say no new code/live run.

### Humboldt — challenge fit / Design Partner positioning

Audit whether the packet now maximizes the 30/40/30 criteria, especially the 40% SDK-in-entirety lane, without burying the judge story. Give the best headline if current copy should be sharpened.

### Sextus Empiricus — proof attack / secret risk

Attack the proof. Look for unsupported claims, stale hashes, secret/API-key/private-key leakage, raw address/PII exposure, bad bundle assumptions, or a mismatch between what receipts prove and what copy claims.

### Kallimachos — packaging / judge readability / bug lane

Audit whether `SUBMISSION_FORM_FIELDS.md`, `SUBMISSION_PACKET.md`, the final bundle, DevRel report, and new rule-compliant appendix are paste-ready and judge-readable. Check whether the bug lane is countable under the rule.

## Required deposit format

```text
Run token: T3_POST_SDK_BREADTH_COUNCIL_AUDIT_20260615T194334Z
Seat:
Verdict: READY_MAX_SUBMIT / REVISE_COPY_ONLY / BLOCK
Score 1-10:
Strongest reason:
One required change, if any:
Best line for winning the bounty:
Overclaim/secret/repro risk found:
One thing that could still beat us:
```

## Decision rule

```text
- Any BLOCK pauses submission and must be fixed before final delivery.
- If majority READY_MAX_SUBMIT and remaining issues are REVISE_COPY_ONLY, patch copy/forms only, then rehash affected docs/bundle.
- If all seats are READY_MAX_SUBMIT or REVISE_COPY_ONLY with no true blocker, do not add new code/live Terminal 3 runs.
- Do not claim legal authority, production identity proofing, raw PII flow, or real payment movement.
```

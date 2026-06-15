# Terminal 3 ADK — Build Council final receipt

**Receipt stamp:** `20260615T2047Z`  
**Status:** `READY_BUILD_SUBMIT_AFTER_COPY_PATCH`  
**Scope:** BUILD TRACK / main BUIDL submission only. Bug/docs bounty lane remains separate.

## Final bundle after build-Council judgment

```text
bundle: submission-bundles/terminal3-agent-passport-submission-build-council-20260615T2047Z.tar.gz
sha256: f15da968634c48f5e1ebdf725664e8bbe510131a34403b30234d340483abaf2e
size: 313412 bytes
members: 115
```

This supersedes:

```text
terminal3-agent-passport-submission-max-curated-20260615T2025Z.tar.gz
terminal3-agent-passport-submission-max-curated-20260615T2001Z.tar.gz
terminal3-agent-passport-submission-max-curated-20260615T1927Z.tar.gz
terminal3-agent-passport-submission-max-curated-20260615T1800Z.tar.gz
```

Use only the 2047Z build-Council tarball for the build track.

## Council judgment

Visible Discord Council dispatch:

```text
message_id: 1516179904448958577
packet: T3_BUILD_SUBMISSION_COUNCIL_JUDGMENT_PACKET_20260615T203639Z.md
packet sha256: 3c5c4de5f0c5fa67126f2e8a184e9e4b431104d62f858f87e2c63e16596b2e7e
```

Visible result:

```text
Philo: WITHDRAWN — Codex/ChatGPT usage limit / shell snapshot transport failure
Archimedes: WITHDRAWN — Codex/ChatGPT usage limit
Humboldt: WITHDRAWN — Codex/ChatGPT usage limit
Sextus Empiricus: WITHDRAWN — Codex/ChatGPT usage limit
Kallimachos: WITHDRAWN — Codex/ChatGPT usage limit
```

These are not counted as votes.

Fallback independent build audit:

```text
Philo: REVISE_COPY_ONLY, 8 — stale safe-egress log hash copy
Archimedes: READY_BUILD_SUBMIT, 9
Humboldt: READY_BUILD_SUBMIT, 9
Sextus Empiricus: READY_BUILD_SUBMIT, 9
Kallimachos: READY_BUILD_SUBMIT, 9

READY: 4
REVISE_COPY_ONLY: 1
BLOCK: 0
Average: 8.8 / 10
```

Synthesis:

```text
T3_BUILD_SUBMISSION_COUNCIL_JUDGMENT_SYNTHESIS_20260615T2047Z.md
sha256: 51bdd5e040a32dc707d2893ac1dc0b7b9218e63c5edc1981f04f5e75fec05d40
```

## Copy patch applied

Philo's stale-hash finding was corrected in build-facing docs.

Patched hashes:

```text
SUBMISSION_PACKET.md: 23353734d23e50f02632ab306529e0d3e3e12f570d910f25abc18d1a292d09fa
SUBMISSION_FORM_FIELDS.md: 0d69a883d020f2d408230d1ab2ef94e31405d34d2d26d968588a02a0b919356d
T3_SAFE_EGRESS_IMPLEMENTATION_RECEIPT_20260615T173947Z.md: 06844b59bcc61f7fca75e985f1b3c9d100612ac2e23a991d43f2685a14d7d7d7
T3_BOUNTY_MAX_FINAL_REVIEW_PACKET_20260615T1750Z.md: b0874330d1cfcd6f6e429c617234a3a2a90e671551a118da16b74551259b803d
agent-passport-protected-actions/README.md: befa6656b8b81509075c99deb3bbf9f869232dc04b6c6b763f95453570221549
```

## Verification after copy patch

Working-tree post-patch verification:

```text
command: pnpm verify
result: 13 test files passed; 52 tests passed; typecheck passed; build passed; local demo wrote receipts
log: logs/post-build-council-copy-patch-verify-20260615T2047Z.txt
log sha256: 79f505f78c1f06a8cdad4b701cf0773f39dc23f57df4e91795b1d7ffad22523c
```

Fresh extracted final bundle verification:

```text
bundle: submission-bundles/terminal3-agent-passport-submission-build-council-20260615T2047Z.tar.gz
extract: /tmp/t3-build-council-20260615T2047Z
pnpm install --frozen-lockfile: passed
pnpm verify: passed
13 test files passed
52 tests passed
typecheck passed
build passed
local demo wrote receipts
log: logs/build-council-fresh-bundle-verify-20260615T2047Z.txt
log sha256: 555a6cdd2ef369ee67d18ea20e047aca7487a740c539aa0868735db7bce0b433
```

## Final bundle scan

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
stale_safe_egress_hash_files: []
required_members_missing: []
```

Scan artifact:

```text
logs/build-council-bundle-safety-scan-20260615T2047Z.json
sha256: a155c531416abf71b46d70d8179e08e274778ecf1676cf0877d2370896e3673c
```

## Submit instruction

Build track / main BUIDL:

```text
submission-bundles/terminal3-agent-passport-submission-build-council-20260615T2047Z.tar.gz
submission-bundles/FINAL_BUILD_COUNCIL_SUBMISSION_RECEIPT_20260615T2047Z.md
SUBMISSION_FORM_FIELDS.md
SUBMISSION_PACKET.md
README.md
T3_BUILD_SUBMISSION_COUNCIL_JUDGMENT_SYNTHESIS_20260615T2047Z.md
```

Bug/docs bounty lane remains separate:

```text
BUGS_AND_DOC_GAPS_RULE_COMPLIANT_APPENDIX_20260615T191349Z.md
DEVREL_REPORT.md
```

## Safe build-track line

```text
This build proves Terminal-3-native scoped agent authority on testnet: auth, usage, wallet/history, audit-read, tenant-contract execution, scoped safe egress, audit receipts, and refusal boundaries. It deliberately does not claim production trust, live KYC/human identity proofing, legal authority, real payment movement, or raw-PII disclosure.
```

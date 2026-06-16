# Terminal 3 final Council synthesis — rules-patch 10/10 check

**Run token:** `T3_RULES_PATCH_FINAL_COUNCIL_20260616T1810Z`  
**Synthesis stamp:** `20260616T1812Z`  
**Visible dispatch:** `1516504568752640101` plus single-seat pings `1516504919413100656` through `1516504992276545768`.

## Visible Council deposits

| Seat | Visible message(s) | Verdict | Score | Video required by supplied rules? | Required change |
|---|---:|---|---:|---|---|
| Philo | `1516505057196114140`, `1516505057577664745`, `1516505058580107285`, `1516505370539856184`, `1516505371781628214` | `READY_10_OF_10` | 10/10 | NO | None; preserve no-KYC/no-legal/no-real-money/no-raw-PII boundary |
| Archimedes | `1516505284829253722`, `1516505286372753582` | `READY_10_OF_10` | 10/10 | NO | None; optional 60-90s video helps comprehension but is not required |
| Humboldt | `1516505072165716141`, `1516505073549578251`, `1516505075013648575` | `READY_10_OF_10` | 10/10 | NO | None, contingent on no hidden live-form video rule |
| Sextus Empiricus | `1516505153791070329`, `1516505155082780843`, `1516505156370563124`, `1516505157624402000`, `1516505358250672300`, `1516505359441854637`, `1516505360347693257`, `1516505361811640440` | `READY_9_OF_10_OPTIONAL_VIDEO` after proof attack | 9/10 | NO in supplied extract | Fix artifact-evidence continuity: cited fresh logs and scan must be included or receipt must stop implying they are shipped |
| Kallimachos | `1516505295851880590`, `1516505296938471434`, `1516505298624581793` | `READY_10_OF_10` | 10/10 | NO | None; optional walkthrough is packaging, not a rule blocker |

## Council result before patch

```text
READY_10_OF_10: 4 seats
READY_9_OF_10_OPTIONAL_VIDEO / proof caveat: 1 seat (Sextus)
REVISE_COPY_ONLY: 0
BLOCK: 0
```

Video ruling:

```text
The supplied DoraHacks/rules extract does NOT require video.
Council unanimously treats video/walkthrough/screenshots as optional judge-speed packaging, not a rule blocker.
```

Important boundary:

```text
The no-video ruling is only as strong as the supplied rules extract.
Direct DoraHacks page access remained WAF-gated here. Human should still check the live DoraHacks submission form before final upload; if the form has a required video field, satisfy that field.
```

## Sextus proof attack and patch

Sextus found a real packaging-continuity issue: the `20260616T1759Z` tarball did not include three files named in the final receipt:

```text
logs/rules-patch-fresh-bundle-verify-20260616T1759Z.txt
logs/rules-patch-fresh-bundle-rust-wasm-20260616T1759Z.txt
logs/rules-patch-bundle-safety-scan-20260616T1759Z.json
```

This was not a code/test failure or safety leak. It was evidence packaging: the files existed in the repo but were absent from the tarball.

Patch applied:

```text
new bundle: submission-bundles/terminal3-agent-passport-submission-council-fix-20260616T1812Z.tar.gz
new bundle sha256: 1ad3e64d3aff307cae6b648dbb55e33139493deb78ee1a999adbd236e32b746e
members: 125
```

Membership check now passes:

```text
FOUND logs/rules-patch-final-verify-20260616T1400Z.txt
FOUND logs/rules-patch-rust-wasm-20260616T1356Z.txt
FOUND logs/rules-patch-fresh-bundle-verify-20260616T1759Z.txt
FOUND logs/rules-patch-fresh-bundle-rust-wasm-20260616T1759Z.txt
FOUND logs/rules-patch-bundle-safety-scan-20260616T1759Z.json
```

## Post-patch verification

```text
fresh council-fix extract: /tmp/t3-council-fix-20260616T1812Z
pnpm install --frozen-lockfile: passed
pnpm verify: passed
14 test files passed
54 tests passed
typecheck passed
build passed
local demo wrote receipts
log: logs/council-fix-fresh-bundle-verify-20260616T1812Z.txt
log sha256: 718baef1d66747012d7c0eb9a408762ac9ad83f10ed16f8503eb60b60901a4c5
```

Rust/WASM post-patch verification:

```text
z-audit-probe cargo test/build/wasm validate: passed
z-safe-egress-demo cargo test/build/wasm validate: passed
log: logs/council-fix-fresh-bundle-rust-wasm-20260616T1812Z.txt
log sha256: 6151c8cbbb17d99b9be4ce21611834c8d1965596c81b583c655d74bc46734187
```

Safety scan for council-fix bundle:

```text
scan: logs/council-fix-bundle-safety-scan-20260616T1812Z.json
scan sha256: 8bd205deb2bfe5334810547383ea65678865446850417adfbb43d55000dd7b03
ok: true
bad_env_names: []
git_dirs: []
node_modules: []
target_dirs: []
dist_dirs: []
nonempty_secret_assignments: []
private_key_pem_hits: []
raw_eth_files_flagged: []
required_members_missing: []
```

## Final synthesis

```text
READY_10_OF_10_AFTER_COUNCIL_FIX
```

Reason:

```text
Four seats gave READY_10_OF_10 immediately.
Sextus found one evidence-packaging caveat, not a code/safety/rule blocker.
The caveat was patched by rebuilding the tarball so the cited evidence files are present.
Fresh extraction, tests, Rust/WASM, and safety scan remain green.
```

## Final submit set

Build track:

```text
submission-bundles/terminal3-agent-passport-submission-council-fix-20260616T1812Z.tar.gz
submission-bundles/FINAL_COUNCIL_FIX_SUBMISSION_RECEIPT_20260616T1812Z.md
SUBMISSION_FORM_FIELDS.md
SUBMISSION_PACKET.md
README.md
JUDGE_WALKTHROUGH_90S.md
```

Bug/docs lane:

```text
DEVREL_REPORT.md
BUGS_AND_DOC_GAPS_RULE_COMPLIANT_APPENDIX_20260615T191349Z.md
CHALLENGE_RULES_EXTRACT.md
```

## Video answer

```text
Rules: NO video requirement appears in the supplied challenge text.
Recommendation: optional 60-90 sec walkthrough or 5-8 screenshots if DoraHacks allows it, because it helps cold judges, but do not treat it as a rule blocker.
Live-form caveat: human should check the actual upload form; if it has a mandatory video field not present in the supplied rules text, record one from JUDGE_WALKTHROUGH_90S.md.
```

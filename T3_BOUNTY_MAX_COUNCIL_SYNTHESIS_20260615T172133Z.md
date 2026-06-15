# Terminal 3 ADK bounty — max-prize Council synthesis and build roadmap

**Run token:** `T3_BOUNTY_MAX_LOOP_20260615T171622Z`  
**Synthesis stamp:** `20260615T172133Z`  
**Thread:** Terminal 3 / `1515563429677633646`

## Operator correction

ChinaPrint/David corrected the prior minimal-submit stance:

```text
We have ~6 days. We started <24 hours ago. Run a Council loop for a top-tier submission that answers what judges want.
```

Second operator correction after Council deposits:

```text
Council needs to chill with a video. I am not creating one before everything is done.
```

**Effect:** Video/screenshot/hosted walkthrough is a final packaging gate, not the first build task.

## Council deposits received

| Seat | Verdict | Main point |
|---|---|---|
| Kallimachos | BUILD_MAX, packaging first | Baseline is safe/top-tier; add judge-speed proof, count DevRel, and attempt exactly one real T3-native extension if safely receipted. |
| Sextus | CONTESTED / packaging-first warning | Do not let a new mechanism distract from judge-visible proof. Missing artifact is comprehension speed. |
| Philo | BUILD_MAX | Preserve authority boundary; build no-money/no-PII placeholder/egress path only if truthful and receipted. |
| Archimedes | BUILD_MAX | One-day spike: reuse `repos/z-tenant-flight`; prove denied host and allowed sanitized host with audit binding. |
| Humboldt | BUILD_MAX | Split strategy: judge-speed + countable DevRel + exactly one product-native extension; no governance theater. |

**Decision:** Majority `BUILD_MAX` with Sextus’ objection absorbed as a sequencing constraint.

```text
Build first.
Package/video last.
Stop the extension after one focused attempt if T3 support is unstable.
```

## Current proven baseline

Already strong and must not be corrupted:

- T3 DID-shaped Agent Passport.
- Scoped pre-payload refusal gates.
- Live T3 auth smoke.
- Live-submitted SDK read.
- Live no-money/no-PII tenant-contract audit event.
- 4/4 repeatability.
- External audit registry anchor, bounded to Terminal 3 testnet evidence.
- `DEVREL_REPORT.md` plus `BUGS_AND_DOC_GAPS.md` with 11 countable findings.
- Explicit no-production/no-KYC/no-payment/no-raw-PII boundary.

## Work order for max submission

### Gate 0 — freeze forbidden claims

Forbidden unless new external evidence truly exists:

- production trust / production governance;
- legal, KYC, or recognized human identity authority;
- real payment/action flow;
- delegated human authority solved;
- raw PII handling;
- broad audited protected-action surface beyond live receipts.

### Gate 1 — acceptance spec before code

Produce a one-page acceptance gate for the T3-native extension:

- exact contract/function to use;
- safe allowed endpoint;
- denied endpoint or missing grant scenario;
- placeholder marker(s), but no raw PII in logs or receipts;
- expected refusal strings/codes;
- expected allowed receipt fields;
- audit binding fields;
- redaction rules;
- fallback criteria: PACKAGE_MAX or ASK_T3_SUPPORT.

### Gate 2 — one real Terminal-3-native extension

Build exactly one extension:

```text
no-money/no-raw-PII user-grant / allowed-host / http-with-placeholders / egress-denial demo
```

Use `repos/z-tenant-flight` as build seed, not as existing evidence.

Target proof edges:

| Edge | Required evidence |
|---|---|
| Denied path | missing grant / disallowed host / unauthorized marker refuses before protected action is counted successful. |
| Allowed path | scoped allowed host succeeds against a safe/mock endpoint with no raw profile value in WASM logs or receipts. |
| Audit binding | receipt includes contract tail/version/function, allowed-host/grant scope summary, audit event id/hash where available. |
| Sanitization | no `.env`, API key, private key, raw PII, payment, KYC, or legal-governance language. |

### Gate 3 — tests and receipts

Required before calling extension done:

- build succeeds;
- unit/CLI tests for refusal/allow receipt normalization;
- live receipts if credentials/testnet support are available;
- secret scan and overclaim scan;
- clean logs scan;
- hash all new artifacts.

If blocked:

| Block type | Result |
|---|---|
| ambiguous SDK/doc/API behavior | ASK_T3_SUPPORT with exact repro and question. |
| no safe live allowed path after one focused attempt | PACKAGE_MAX: keep current bundle + DevRel count + final packaging. |
| secret/raw PII/payment/KYC/legal overclaim | BLOCK and remove artifact. |

### Gate 4 — final packaging only after build

Do **not** record final video now. After Gate 2/3:

- update `SUBMISSION_PACKET.md` and form fields only with proven claims;
- attach `DEVREL_REPORT.md` and `BUGS_AND_DOC_GAPS.md` as countable DevRel evidence;
- rebuild sanitized bundle;
- produce 5-8 screenshots or a 60-90 sec walkthrough using final receipts;
- run final Council re-rate.

## Immediate next action

Create the extension acceptance gate, then begin the one-day spike.

No more local governance scaffolding. No Stripe/KYC/payment. No video before build completion.

*Ostinato rigore.*

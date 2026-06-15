# Terminal 3 ADK bounty — rule-compliant bug/docs-gap appendix

**Stamp:** `20260615T191349Z`  
**Purpose:** Make the DevRel lane countable under the exact DoraHacks track rule: each issue is SDK-related, actionable/verifiable, requires a code/docs change, and contains a reproduction.

Do not submit scanner noise. Do not submit unvalidated LLM claims. All items below are from public docs/repo checks or live SDK/WIT integration work; no secrets, API keys, raw PII, private keys, or private user identity are included.

## Count

```text
Total findings: 11
Scope: SDK/onboarding/docs/WIT/testnet developer experience
Every item includes: reproduction, observed, expected, required fix
```

---

## 1 — OpenAPI links in `llms.txt` return 404

**Type:** Documentation / broken links  
**SDK relevance:** `llms.txt` is the public machine-readable docs index developers use while integrating the ADK.  
**Requires code/docs change:** Yes — publish the specs or remove/update the index entries.

**Reproduction:**

```bash
curl -i https://docs.terminal3.io/terminal-3-openapi.yml
curl -i https://docs.terminal3.io/api-reference/openapi.json
```

**Observed:** Both URLs returned HTTP 404 during the docs sweep.  
**Expected:** Every OpenAPI link advertised by `llms.txt` resolves, or the index omits unavailable specs.  
**Suggested fix:** Publish the OpenAPI specs at those URLs or remove/update the two entries in `llms.txt`.

---

## 2 — Public `adk-getting-start` repo appears empty

**Type:** Onboarding / sample repo gap  
**SDK relevance:** A getting-started repo is a likely first stop after the claim/onboarding path.  
**Requires code/docs change:** Yes — populate the repo or remove/clarify public references.

**Reproduction:**

```bash
git clone https://github.com/Terminal-3/adk-getting-start.git
cd adk-getting-start
git rev-parse HEAD
```

**Observed:** Git reported an empty repository / no `HEAD` in the earlier repo check. GitHub API also reports size `0`.  
**Expected:** The getting-started repo contains a minimal ADK walkthrough or a clear placeholder/status note.  
**Suggested fix:** Populate the repo with the current minimal ADK walkthrough or remove public references until ready.

---

## 3 — `z-tenant-flight` version mismatch

**Type:** Documentation/source consistency  
**SDK relevance:** `z-tenant-flight` is the public Rust/WIT tenant-contract sample used by ADK builders.  
**Requires code/docs change:** Yes — update README/source version strings.

**Reproduction:**

```bash
git clone https://github.com/Terminal-3/z-tenant-flight.git
cd z-tenant-flight
grep -n "v0\.\|version =\|CONTRACT_VERSION" README.md Cargo.toml src/lib.rs
```

**Observed:** Prior verification found README `v0.3.0`, Cargo `0.4.1`, source header `v0.4.0`, and `CONTRACT_VERSION` `0.4.1`.  
**Expected:** README, Cargo metadata, source header, and contract constant agree.  
**Suggested fix:** Standardize README and source header to the actual current version, e.g. `0.4.1` if that is authoritative.

---

## 4 — `z-tenant-flight` privacy wording conflicts with placeholder implementation

**Type:** Documentation / privacy mental-model gap  
**SDK relevance:** The ADK's strongest privacy surface is `http-with-placeholders`; developers must understand whether raw PII enters the agent/contract.  
**Requires code/docs change:** Yes — README/input examples should match implementation behavior.

**Reproduction:**

```bash
git clone https://github.com/Terminal-3/z-tenant-flight.git
cd z-tenant-flight
grep -n "PII\|profile\.\|placeholder\|passenger" README.md src/lib.rs
```

**Observed:** README wording says passenger PII is passed by the agent and used inside the enclave; source comments describe `{{profile.<field>}}` placeholders resolved by the host so passenger PII is never passed as a contract argument.  
**Expected:** Docs emphasize the stronger privacy model: private fields are resolved by the host/TEE placeholder path, not held as raw agent/contract arguments.  
**Suggested fix:** Rewrite README privacy and input sections to show placeholder references and explicitly say raw PII does not enter agent memory or WASM arguments.

---

## 5 — README native test command fails when repo defaults target to WASM

**Type:** Onboarding / test-command bug  
**SDK relevance:** Builders validating a Rust/WIT tenant contract hit this immediately.  
**Requires code/docs change:** Yes — update README test command or provide a WASM runner.

**Reproduction:**

```bash
git clone https://github.com/Terminal-3/z-tenant-flight.git
cd z-tenant-flight
cargo test --lib
```

**Observed:** Because `.cargo/config.toml` defaults `target = "wasm32-wasip2"`, the README command attempts to execute a `.wasm` test binary locally and fails. The working native command observed was:

```bash
cargo test --lib --target x86_64-unknown-linux-gnu
```

**Expected:** README test command should pass on a normal native developer machine or explicitly use a WASM test runner.  
**Suggested fix:** Update README to include `--target x86_64-unknown-linux-gnu` for native tests, then show WASM build/validate separately.

---

## 6 — Claim page says `sandbox`; SDK docs/code use `testnet`

**Type:** Documentation terminology  
**SDK relevance:** New developers need to know which SDK environment to select after claiming sandbox tokens.  
**Requires code/docs change:** Yes — one docs/claim-page sentence fixes it.

**Reproduction:**

```bash
curl -L https://r.jina.ai/http://https://www.terminal3.io/claim-page | grep -i sandbox
curl -L https://docs.terminal3.io/developers/adk/get-started/prerequisites/set-up-dev-env.md | grep 'setEnvironment'
```

**Observed:** Claim/product copy says sandbox; SDK setup uses `setEnvironment("testnet")`.  
**Expected:** Docs should say whether sandbox and SDK `testnet` are the same environment.  
**Suggested fix:** Add: `In the SDK, the sandbox environment is selected with setEnvironment("testnet").`

---

## 7 — Audit host-call WIT shape is under-documented

**Type:** SDK/WIT documentation gap  
**SDK relevance:** Developers need the exact host interface call shape to emit audit events and satisfy the auditability promise.  
**Requires code/docs change:** Yes — add a minimal WIT/Rust audit example.

**Reproduction:**

```bash
# In a minimal tenant contract importing host:interfaces/logging@2.1.0,
# attempt an audit call with multiple scalar arguments, then register/execute it.
# Compare with a single-record call shape: logging.audit(event: audit-event).
```

**Observed:** A scalar-style `logging.audit(action, target, outcome, details)` shape compiled locally but failed live. The working shape was a single `audit-event` record argument and produced a committed audit event.  
**Expected:** Docs should show the exact WIT import and Rust `logging.audit(event: audit-event)` call with required fields.  
**Suggested fix:** Add a minimal audit-probe contract example under docs, including WIT and Rust code.

---

## 8 — `z:` tenant script tail length limit needs clearer docs callout

**Type:** Documentation / error explanation  
**SDK relevance:** Contract registration/invocation depends on valid `z:<tid>:<tail>` names.  
**Requires code/docs change:** Yes — add validation/limit text to registration docs.

**Reproduction:**

```bash
# Register a tenant contract using a long tail under z:<tid>:<tail>.
# Then retry with a short tail such as ap-audit-probe or generated ap-audit-<base36-ms>.
```

**Observed:** A long tail produced `HTTP 400: z: segment exceeds 32 bytes`; short tails worked.  
**Expected:** Naming limits should be visible before developers hit the 400.  
**Suggested fix:** Put the `z:` segment length limit near tenant contract registration examples and show valid short-tail patterns.

---

## 9 — Fixed-tail reruns require clearer version discipline

**Type:** Onboarding / repeatability behavior  
**SDK relevance:** Demo scripts and CI reruns need predictable contract registration/version semantics.  
**Requires code/docs change:** Yes — document idempotency/version behavior.

**Reproduction:**

```bash
# Register a contract at a fixed tail with one version.
# Register/rerun the same fixed tail after a higher version exists.
# Observe behavior when trying an older/default version again.
```

**Observed:** After a fixed tenant script tail was registered at a higher version, rerunning the same tail with the default lower version failed. Our local CLI was repaired to default to unique short tails while preserving explicit tail/version overrides.  
**Expected:** Developers know whether registration is create-only, update-by-semver, idempotent, or monotonic by version.  
**Suggested fix:** Add a registration behavior note and recommended pattern for rerunnable demos.

---

## 10 — SDK reads and tenant-contract audit events should be distinguished

**Type:** Documentation / audit semantics  
**SDK relevance:** Audit receipts are central to the ADK claim; developers need to know which SDK calls create auditable events.  
**Requires code/docs change:** Yes — add a table or troubleshooting note.

**Reproduction:**

```bash
# Authenticate with @terminal3/t3n-sdk, call T3nClient.getSelfEthAddress,
# then call getAuditEvents({ limit: 5 }).
# Separately invoke a tenant contract that calls logging.audit(event).
```

**Observed:** `T3nClient.getSelfEthAddress` succeeded but `getAuditEvents({ limit: 5 })` returned zero events; a tenant-contract invocation calling `logging.audit(event)` produced a committed audit event.  
**Expected:** Docs distinguish `live-submitted` SDK reads from `live-audited` tenant-contract events.  
**Suggested fix:** Add a table showing which SDK actions produce audit events, which only authenticate/read, and what to poll afterward.

---

## 11 — No-audit control is a useful diagnostic example

**Type:** Troubleshooting documentation  
**SDK relevance:** Developers may wrongly treat successful contract execution as audit proof.  
**Requires code/docs change:** Yes — add a “why no audit events?” diagnostic.

**Reproduction:**

```bash
# Execute a tenant contract that does not call the audit host interface.
# Poll getAuditEvents afterward.
# Then execute a contract that does call logging.audit(event) and compare.
```

**Observed:** The no-audit control WASM executed successfully but returned zero audit batches/events. This proved execution alone is not audit proof; the contract must call the audit host interface.  
**Expected:** Developers understand that an audit event requires an explicit audit host call.  
**Suggested fix:** Add a troubleshooting note: if `getAuditEvents` is empty, verify the contract imports/calls the audit host interface, then poll again.

## Submission handling

Attach this appendix with `DEVREL_REPORT.md`. If only one file can be attached, merge these sections into `BUGS_AND_DOC_GAPS.md` before submission so each finding has reproduction + required fix language.

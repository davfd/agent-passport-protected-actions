# Terminal 3 ADK bounty — bugs and documentation gaps appendix

Purpose: countable companion to `DEVREL_REPORT.md` for the DoraHacks lane that rewards the most detailed developer discovering/submitting bugs and documentation gaps.

Source report: `DEVREL_REPORT.md`  
Generated from observed onboarding/docs/SDK/WIT findings; no secrets, API keys, private keys, raw human identity, or raw PII included.

## Summary count

```text
Total findings: 11
Bugs / docs gaps: 11
Security-sensitive secret material included: no
```

## Finding 1 — OpenAPI links in `llms.txt` return 404

**Type:** Documentation / broken links  
**Observed:** `docs.terminal3.io/llms.txt` lists:

```text
https://docs.terminal3.io/terminal-3-openapi.yml
https://docs.terminal3.io/api-reference/openapi.json
```

Both returned HTTP 404 during the docs cache run.

**Expected:** Listed OpenAPI links should resolve to published specs, or the index should not advertise them.

**Suggested fix:** Publish the OpenAPI specs at those URLs or remove/update the links in `llms.txt`.

---

## Finding 2 — Public `adk-getting-start` repo appears empty

**Type:** Onboarding / sample repo gap  
**Observed:** `https://github.com/Terminal-3/adk-getting-start.git` cloned, but git reported an empty repository and no `HEAD`:

```text
warning: You appear to have cloned an empty repository.
fatal: Needed a single revision
```

**Expected:** A getting-started repository should contain the minimal ADK walkthrough or a clear placeholder/status note.

**Suggested fix:** Populate the repo with the current minimal ADK walkthrough, or remove/avoid public references until ready.

---

## Finding 3 — `z-tenant-flight` README version mismatch

**Type:** Documentation consistency  
**Observed:** In the public sample repo:

```text
README.md says v0.3.0
Cargo.toml says version = "0.4.1"
src/lib.rs header says v0.4.0
CONTRACT_VERSION is 0.4.1
```

**Expected:** README, source header, Cargo metadata, and contract constant should agree.

**Suggested fix:** Standardize README and source header to `0.4.1` or the actual current release.

---

## Finding 4 — `z-tenant-flight` privacy wording contradicts implementation comments

**Type:** Documentation / privacy mental model  
**Observed:** README says passenger PII is passed in by the agent and used inside the enclave. `src/lib.rs` says passenger PII is never passed as a contract argument; instead the contract templates `{{profile.<field>}}` markers and the host resolves them from the user's profile at dispatch time.

**Expected:** Docs should emphasize the stronger privacy model if implementation uses host-side placeholder resolution.

**Suggested fix:** Update README privacy guarantee and input examples to match `http-with-placeholders`: private fields are resolved host-side, not held as raw agent/contract arguments.

---

## Finding 5 — README native test command fails because repo defaults target to WASM

**Type:** Onboarding / test command bug  
**Observed:** README says:

```bash
cargo test --lib
```

But `.cargo/config.toml` sets:

```toml
[build]
target = "wasm32-wasip2"
```

So the README command attempts to execute a generated `.wasm` test binary locally and fails:

```text
could not execute process ... z_tenant_flight-...wasm
Permission denied (os error 13)
```

**Working command observed:**

```bash
cargo test --lib --target x86_64-unknown-linux-gnu
```

**Suggested fix:** Update README native test command to include the explicit native target, or provide a WASM test runner.

---

## Finding 6 — Claim page terminology says `sandbox`; SDK docs/code use `testnet`

**Type:** Documentation terminology  
**Observed:** Claim page says “Set to sandbox”; SDK docs/code use:

```ts
setEnvironment("testnet");
```

**Expected:** New developers should know whether `sandbox` and `testnet` refer to the same environment.

**Suggested fix:** Add one sentence: “In the SDK, the sandbox environment is selected with `setEnvironment("testnet")`.”

---

## Finding 7 — Audit host-call WIT shape is under-documented

**Type:** SDK/WIT documentation gap  
**Observed:** During a minimal audit-probe tenant contract, this host call shape compiled but failed live with HTTP 500:

```text
logging.audit(action, target, outcome, details)
```

The working shape was a single record argument:

```text
logging.audit(event: audit-event)
```

**Expected:** Docs should show the exact WIT import and Rust call shape needed to emit an audit event.

**Suggested fix:** Add a minimal Rust/WIT example calling `logging.audit(event: audit-event)` with required record fields.

---

## Finding 8 — `z:` tenant script tail length limit needs clearer docs callout

**Type:** Documentation / error explanation  
**Observed:** A long tenant script tail produced:

```text
HTTP 400: z: segment exceeds 32 bytes
```

Working tails were short, e.g. `ap-audit-probe` or generated `ap-audit-<base36-ms>`.

**Expected:** Naming limit should be visible near register/invoke examples.

**Suggested fix:** Put the `z:` segment length limit near the tenant contract registration examples and show valid short-tail patterns.

---

## Finding 9 — Fixed-tail reruns require version discipline

**Type:** Onboarding / repeatability behavior  
**Observed:** After a fixed tenant script tail was registered at a higher version, rerunning the same tail with the default lower version failed. The local CLI was repaired to default to a unique short tail while preserving explicit `T3N_AUDIT_PROBE_TAIL` / `T3N_AUDIT_PROBE_VERSION` overrides.

**Expected:** Developers should know whether script registration is create-only, update-by-semver, or idempotent.

**Suggested fix:** Document fixed-tail rerun behavior and the expected semver/version-increase pattern for demo scripts.

---

## Finding 10 — SDK reads and tenant-contract audit events should be distinguished

**Type:** Documentation / audit semantics  
**Observed:** A live `T3nClient.getSelfEthAddress` protected read succeeded, but `getAuditEvents({ limit: 5 })` returned zero batches/events afterward. That receipt was correctly marked `live-submitted`, not `live-audited`. A tenant-contract invocation that called `logging.audit(event)` did produce a committed audit event.

**Expected:** Developers need to know which SDK actions emit audit events and which only authenticate/read.

**Suggested fix:** Add a table clarifying which SDK calls produce audit events, which only authenticate/read, and what developers should poll/expect after each call.

---

## Finding 11 — No-audit control is a useful diagnostic example

**Type:** Troubleshooting documentation  
**Observed:** A no-audit control WASM executed successfully but returned zero audit batches/events. This proved execution alone is not audit proof; the contract must emit the audit host event.

**Expected:** Developers debugging empty audit polls need a clear diagnostic path.

**Suggested fix:** Add a “why don't I see audit events?” troubleshooting note: verify the contract actually calls the audit host interface, then poll `getAuditEvents`.

---

## Attachment note

Recommended submission handling:

```text
Attach DEVREL_REPORT.md as the full evidence report.
Attach or paste this BUGS_AND_DOC_GAPS.md appendix so Terminal 3 can count 11 discrete findings.
```

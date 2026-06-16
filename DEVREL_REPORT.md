# Terminal 3 ADK bounty — Developer Experience Report

Working directory: `/home/exor/Leonardo/hackathons/terminal3-adk/`

Public access route used:

- Direct DoraHacks page was WAF/CAPTCHA gated; I did not bypass it.
- Public text was read through Jina Reader and Terminal 3 docs.
- Terminal 3 docs and GitHub API were accessible with normal HTTP requests.

## Verified local environment

```text
node: v24.14.0
npm: 11.9.0
pnpm: 11.6.0 during install/run
rustc: 1.96.0
cargo: 1.96.0
rustup target: wasm32-wasip2 installed
wasm-tools: 1.252.0
@terminal3/t3n-sdk: 3.5.2
```

## Positive onboarding notes

- `@terminal3/t3n-sdk` installed successfully from npm.
- SDK type surface includes the documented helpers: `T3nClient`, `setEnvironment`, `loadWasmComponent`, `eth_get_address`, `metamask_sign`, `createEthAuthInput`, `getNodeUrl`.
- Live SDK auth/usage smoke passed against Terminal 3 testnet after `T3N_API_KEY` was supplied and kept private.
- A small Rust/WIT tenant contract built to `wasm32-wasip2`, validated with `wasm-tools`, registered, executed, and produced committed audit events.
- `getAuditEvents` can return a committed audit batch quickly once the tenant contract emits the correct host audit event.

## Bugs / documentation gaps found

### 1. OpenAPI links in `llms.txt` return 404

`docs.terminal3.io/llms.txt` lists:

- `https://docs.terminal3.io/terminal-3-openapi.yml`
- `https://docs.terminal3.io/api-reference/openapi.json`

Both returned HTTP 404 during the docs cache run.

Suggested fix: remove these links from `llms.txt` or publish the OpenAPI specs at those URLs.

### 2. Public `adk-getting-start` repo appears empty

`https://github.com/Terminal-3/adk-getting-start.git` cloned, but git reported an empty repository and no `HEAD`.

Observed output:

```text
warning: You appear to have cloned an empty repository.
fatal: Needed a single revision
```

Suggested fix: populate this repo with the current minimal ADK walkthrough or remove/avoid references to it until ready.

### 3. `z-tenant-flight` README version mismatch

Repo: `Terminal-3/z-tenant-flight`

Observed:

- `README.md` line 3 says `v0.3.0`.
- `Cargo.toml` says `version = "0.4.1"`.
- `src/lib.rs` header says `v0.4.0`.
- `CONTRACT_VERSION` is `0.4.1`.

Suggested fix: standardize README and source header to `0.4.1`.

### 4. `z-tenant-flight` privacy wording contradicts implementation comments

README says passenger PII is passed in by the agent and used inside the enclave.

`src/lib.rs` says passenger PII is **never** passed as a contract argument; the contract templates `{{profile.<field>}}` markers and the host resolves them from the user's profile at dispatch time.

This matters because the placeholder flow is the stronger privacy story and directly affects developer mental models.

Suggested fix: update README privacy guarantee and input examples to match `http-with-placeholders` behavior.

### 5. README native test command fails because repo defaults target to WASM

README says:

```bash
cargo test --lib
```

But `.cargo/config.toml` sets:

```toml
[build]
target = "wasm32-wasip2"
```

So `cargo test --lib` attempts to execute the generated `.wasm` test binary and fails locally:

```text
could not execute process ... z_tenant_flight-...wasm
Permission denied (os error 13)
```

Working command:

```bash
cargo test --lib --target x86_64-unknown-linux-gnu
```

Suggested fix: update README's native test command to include the explicit native target, or provide a WASM test runner.

### 6. Claim page terminology says `sandbox`; SDK docs use `testnet`

The claim page says “Set to sandbox”; docs/code use:

```ts
setEnvironment("testnet");
```

Suggested fix: add one sentence: “In the SDK, the sandbox environment is selected with `setEnvironment("testnet")`.”

### 7. Audit host-call WIT shape is under-documented

During a minimal audit-probe tenant contract, this host call shape compiled but failed live with HTTP 500:

```text
logging.audit(action, target, outcome, details)
```

The working shape was a single record argument:

```text
logging.audit(event: audit-event)
```

The working contract emitted a committed audit event on the first poll.

Suggested fix: document the exact WIT import and provide a minimal Rust example that calls `logging.audit(event: audit-event)` with the required record fields.

### 8. `z:` tenant script tail length limit needs a clearer docs callout

A long tenant script tail produced:

```text
HTTP 400: z: segment exceeds 32 bytes
```

The working tail was short, e.g. `ap-audit-probe` or a generated `ap-audit-<base36-ms>`.

Suggested fix: put the `z:` segment length limit near the register/invoke examples and show a valid short-tail naming pattern.

### 9. Fixed-tail reruns require version discipline

After a fixed tenant script tail was registered at a higher version, rerunning the same tail with the default lower version failed. The local CLI was repaired to default to a unique short tail while preserving explicit `T3N_AUDIT_PROBE_TAIL` / `T3N_AUDIT_PROBE_VERSION` overrides.

Suggested fix: document whether script registration is create-only, update-by-semver, or idempotent, and show the expected behavior for rerunning a demo script.

### 10. SDK reads and tenant-contract audit events should be distinguished

A live `T3nClient.getSelfEthAddress` protected read succeeded, but `getAuditEvents({ limit: 5 })` returned zero batches/events afterward. That receipt was correctly marked `live-submitted`, not `live-audited`.

A tenant-contract invocation that called `logging.audit(event)` did produce a committed audit event.

Suggested fix: add a table clarifying which SDK calls produce audit events, which only authenticate/read, and what developers should poll/expect after each call.

### 11. No-audit control is a useful diagnostic example

A no-audit control WASM executed successfully but returned zero audit batches/events. That was helpful: it proved execution alone is not audit proof.

Suggested fix: include a “why don't I see audit events?” troubleshooting note: verify the contract actually calls the audit host interface, then poll `getAuditEvents`.

## Repro receipts

Docs cache:

- `/home/exor/Leonardo/hackathons/terminal3-adk/docs/all-docs-manifest.json`
- `/home/exor/Leonardo/hackathons/terminal3-adk/logs/access-check.txt`

Sample repo verification:

- `/home/exor/Leonardo/hackathons/terminal3-adk/logs/z-tenant-flight-verify.txt`
- Native tests: 7 passed after explicit target override.
- Clippy: passed.
- WASM build: passed.
- WASM SHA256: `56eebf470fdfddaa6872dfb9abb2b04d3e0d936ec646c52cd0355abb02d5a1c1`

Leonardo BUIDL verification:

- `/home/exor/Leonardo/hackathons/terminal3-adk/logs/bounty-package-verify-20260615T153821Z.txt`
- `/home/exor/Leonardo/hackathons/terminal3-adk/logs/bounty-package-registry-demo-20260615T153821Z.txt`
- `/home/exor/Leonardo/hackathons/terminal3-adk/logs/bounty-package-z-audit-cargo-test-20260615T153821Z.txt`
- `/home/exor/Leonardo/hackathons/terminal3-adk/logs/bounty-package-z-audit-wasm-build-20260615T153821Z.txt`
- `/home/exor/Leonardo/hackathons/terminal3-adk/logs/bounty-package-z-audit-wasm-validate-20260615T153821Z.txt`
- `/home/exor/Leonardo/hackathons/terminal3-adk/LIVE_SMOKE.md`
- `/home/exor/Leonardo/hackathons/terminal3-adk/EVIDENCE_MANIFEST.md`
- `/home/exor/Leonardo/hackathons/terminal3-adk/SUBMISSION_PACKET.md`
- `/home/exor/Leonardo/hackathons/terminal3-adk/SUBMISSION_FORM_FIELDS.md`

Current verification summary:

```text
pnpm verify: 14 test files / 54 tests passed; typecheck passed; build passed; local demo wrote receipts.
pnpm t3n:sdk-breadth: auth/usage/wallet/history/audit-read ok; humanIdentity boundary refused before provider-session setup.
pnpm registry:demo: missing external registry anchor refused before payload; matching policy + signed grant + governance witness + external registry anchor allowed.
cargo test: 1 unit test + 1 doctest passed.
cargo build wasm32-wasip2: passed.
wasm-tools validate: passed.
```

Live smoke passed against Terminal 3 testnet after `T3N_API_KEY` was supplied. Sanitized values: node URL `https://cn-api.sg.testnet.t3n.terminal3.io`, DID `did:t3n:5c946503c2d9924f58ee273dbd2efba8d03a12df`, available balance `20000`.

## Safety note

This report intentionally does not include the API key, raw `.env`, private keys, raw human identity, or raw PII. All authority/identity claims are bounded: local signatures, local policy/witness scaffolds, and Terminal 3 testnet audit records are evidence handles, not production legal authority.

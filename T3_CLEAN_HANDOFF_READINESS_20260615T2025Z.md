# Terminal 3 ADK — Clean handoff readiness receipt

**Stamp:** `20260615T2025Z`  
**Status:** `READY_MAX_SUBMIT_CLEAN_HANDOFF`  
**External submission:** not made from this workspace; David/human account action still required.

## Purpose

David asked to confirm the repo is clean and ready for another person to use, with a clear README. This pass did four things:

1. Added a root `README.md` as the first file a fresh reviewer should read.
2. Updated the package README and `.env.example` so another user can install, verify, and run optional live probes without exposing secrets.
3. Fixed fresh `pnpm install` readiness for pnpm 11 by approving only the required `esbuild` build script in `pnpm-workspace.yaml`.
4. Re-ran local TypeScript verification and Rust/WASM contract checks.

## Git / repo state

```text
/home/exor/Leonardo: not a git repository
/home/exor/Leonardo/hackathons/terminal3-adk: not a git repository
/home/exor/Leonardo/hackathons/terminal3-adk/agent-passport-protected-actions: not a git repository
```

Therefore “clean repo” here means: curated public handoff bundle is clean, reproducible, and excludes local-only secrets/build directories. Do not publish the raw working directory blindly; use the curated bundle.

## README / handoff patches

```text
README.md
- new root handoff README
- starts with status, quickstart, exact safe claim boundary, submit-file list, file map, Council caveat, and troubleshooting
- points fresh reviewers to pnpm install && pnpm verify first

agent-passport-protected-actions/README.md
- updated latest verification count from 12/50 to 13/52
- added sdk-breadth helper/CLI to file map
- added dotenv source command for live probes
- notes pnpm 11 build-script behavior

agent-passport-protected-actions/.env.example
- declares the `T3N_API_KEY` key name only; value is blank
- warns not to commit, submit, log, or paste the filled .env

agent-passport-protected-actions/pnpm-workspace.yaml
- changed from placeholder `allowBuilds: esbuild: set this to true or false`
- now `allowBuilds: esbuild: true`
- this is required for fresh pnpm 11 installs because Vitest/Vite require esbuild's postinstall build step
```

## Fresh verification run

```text
command: pnpm verify
workdir: agent-passport-protected-actions
log: logs/clean-handoff-verify-20260615T2025Z.txt
log sha256: 80ba42fdb0c33fb6546a17a66c665c559c8bf94cd7d4acaca2a5bde6534810da
```

Observed result:

```text
13 test files passed
52 tests passed
typecheck passed
build passed
local demo wrote receipts
exit code: 0
```

Toolchain observed:

```text
node: v24.14.0
pnpm: 11.6.0
rustc: 1.96.0
cargo: 1.96.0
wasm-tools: 1.252.0
```

## Rust/WASM contract checks

`repos/z-audit-probe`:

```text
cargo test: 1 unit test + 1 doctest passed
cargo build --target wasm32-wasip2 --release: passed
wasm-tools validate z_audit_probe.wasm: passed
```

`repos/z-safe-egress-demo`:

```text
cargo test: 2 unit tests + 1 doctest passed
cargo build --target wasm32-wasip2 --release: passed
wasm-tools validate z_safe_egress_demo.wasm: passed
```

## Important boundaries preserved

```text
No production trust claim.
No live KYC / human identity proofing claim.
No recognized legal/governance authority claim.
No real payment movement claim.
No raw PII disclosure claim.
```

Safe line remains:

```text
This build proves Terminal-3-native scoped agent authority on testnet: auth, usage, wallet/history, audit-read, tenant-contract execution, scoped safe egress, audit receipts, and refusal boundaries. It deliberately does not claim production trust, live KYC/human identity proofing, legal authority, real payment movement, or raw-PII disclosure.
```

## Hashes for changed handoff files

```text
README.md
sha256: e4e6ba5858f2d925b385de207d723f6fab6a2d7138a6ff025d991093386f8fa6

agent-passport-protected-actions/README.md
sha256: c566fce431ecb6b1a1969f7958864138b724ec20c727b6576ed3b75f156c559c

agent-passport-protected-actions/.env.example
sha256: 79efa4057eb8b3c15358c10774d1ffcdf29ba24f4f4762437703001b8b11e8b3

agent-passport-protected-actions/pnpm-workspace.yaml
sha256: ac02d96368617c760f093cfe61fdec64b6244007ab3553e0d6621f706f54a353

logs/clean-handoff-verify-20260615T2025Z.txt
sha256: 80ba42fdb0c33fb6546a17a66c665c559c8bf94cd7d4acaca2a5bde6534810da
```

## Verdict

The handoff surface is now clear enough for another reviewer/developer:

```text
START: README.md
RUN: cd agent-passport-protected-actions && pnpm install && pnpm verify
SUBMIT: newest curated tarball + newest FINAL_MAX_SUBMISSION_RECEIPT_*.md + SUBMISSION_FORM_FIELDS.md + SUBMISSION_PACKET.md + bug/docs appendix
DO NOT SUBMIT: raw working directory, .env, node_modules, target dirs, superseded bundles
```

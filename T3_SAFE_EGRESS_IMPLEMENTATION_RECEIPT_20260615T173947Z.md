# Terminal 3 ADK safe-egress extension implementation receipt

**Run token:** `T3_BOUNTY_MAX_LOOP_20260615T171622Z`  
**Receipt stamp:** `20260615T173947Z`  
**Build target:** real Terminal 3-native user-grant / allowed-host / `http-with-placeholders` / egress-denial evidence, with no money movement and no raw PII.

## What was built

New bounded contract + live harness:

```text
repos/z-safe-egress-demo/Cargo.toml
repos/z-safe-egress-demo/src/lib.rs
repos/z-safe-egress-demo/wit/world.wit
repos/z-safe-egress-demo/wit/deps/...
agent-passport-protected-actions/src/safe-egress.ts
agent-passport-protected-actions/src/cli/safe-egress-demo.ts
agent-passport-protected-actions/tests/safe-egress.test.ts
agent-passport-protected-actions/package.json   # adds pnpm t3n:safe-egress
```

The contract imports Terminal 3 `http-with-placeholders`, `logging`, and `tenant-context`, but does **not** use API keys, money, raw PII, or KV writes. It exposes two functions:

```text
ping-allowed
ping-placeholder-denial
```

## Important debugging correction

First live attempt failed because the CLI passed the camelCase local request shape into `executeAndDecode`:

```text
scriptName / scriptVersion / functionName
```

Live Terminal 3 requires the canonical action request shape:

```text
script_name / script_version / function_name
```

Regression added:

```text
agent-passport-protected-actions/tests/safe-egress.test.ts
- extracts the canonical snake_case T3N execute payload from an allowed decision
```

Helper added:

```text
executePayloadFromAllowedDecision(decision)
```

This prevents the old bug from reappearing.

## Verification commands run

```bash
cd /home/exor/Leonardo/hackathons/terminal3-adk/repos/z-safe-egress-demo
CARGO_HOME=/home/exor/.cargo RUSTUP_HOME=/home/exor/.rustup /home/exor/.cargo/bin/cargo +stable test
CARGO_HOME=/home/exor/.cargo RUSTUP_HOME=/home/exor/.rustup /home/exor/.cargo/bin/cargo +stable build --target wasm32-wasip2 --release
```

Result:

```text
Rust unit tests: 2 passed
Rust doc tests: 1 passed
WASM release build: success
```

```bash
cd /home/exor/Leonardo/hackathons/terminal3-adk/agent-passport-protected-actions
pnpm test tests/safe-egress.test.ts
pnpm verify
```

Result:

```text
safe-egress focused tests: 5 passed
full verifier: 12 test files passed, 50 tests passed, typecheck/build/local demo passed
```

Live command:

```bash
cd /home/exor/Leonardo/hackathons/terminal3-adk/agent-passport-protected-actions
set -a; . ./.env; set +a
pnpm t3n:safe-egress
```

Secret handling: `.env` was sourced but not printed.

## Live receipt set

Live run stamp:

```text
20260615t173901793z
```

### 1. Denied egress before self-grant

```text
receipt: agent-passport-protected-actions/receipts/safe_egress_denied-egress-req-egress-denied-20260615t173901793z-live-failed.json
whole-file sha256: f6dd3c5b3579e94a1cdf62e7e4c2cfb2d74caadbfc8e36daf4b65cb13e8971b8
embedded receiptHash: sha256:fcefe46fc573a738ef85a706cc473179dca749fc745bf1c977612e42d571d2fa
observed error: safe-egress http-with-placeholders: egress denied for host httpbin.org
```

### 2. Self-grant was applied

The live log records `selfGrant.ok=true` with hashed input/result only:

```text
log: agent-passport-protected-actions/logs/t3n-safe-egress-20260615t173901793z.json
log sha256: e2cec7df3a7e221ed2c22a7e69f519fec4edf6050768c203b45a02ee2caada5f
selfGrant.inputHash: sha256:e6527c31dc0612d72a8b5d573ae5d1c324459b63f78d338618e4c40e9abc6e25
selfGrant.resultHash: sha256:e3b05923f9f6df4a9190495d79665ad88f565377acf5f194a6da51efd97c2d2d
```

### 3. Placeholder denial after grant

```text
receipt: agent-passport-protected-actions/receipts/safe_egress_placeholder-denial-req-placeholder-denied-20260615t173901793z-live-failed.json
whole-file sha256: 016190feed620bfc75492f4892adaed8c18d61d1077a46248b9c7be9a591e8e7
embedded receiptHash: sha256:f21db63749cb38c7489587e41438af54372cd36753203486c3ecff40a9544687
observed error: safe-egress http-with-placeholders: user profile missing field: __leonardo_forbidden_demo_field
```

The receipt stores only a placeholder hash:

```text
piiRefHashes[0]: sha256:5e0f900248a92f35aa4fa1c499ff1e2476fc25f1e4ea2f152b5ed1c7b0085f3d
```

### 4. Allowed egress after self-grant, with committed audit binding

```text
receipt: agent-passport-protected-actions/receipts/safe_egress_allowed-egress-req-egress-allowed-20260615t173901793z-live-audited.json
whole-file sha256: efb8351dd81192ceb7efaa3b758e2c567572b7dc049a15ff3d6265eaa1aa4618
embedded receiptHash: sha256:59f5e3e3b30c897f61abe70b49878e140d859809be2798b2174c5d453268f663
responseHash: sha256:cb47d5e86e8f528563a16761618d57424f4ebb053e79551c80374ba2cc9db903
auditEventHash: sha256:1874bc2bc4906048d641e66521dc5c014b7715794e350a4d660133ac23e57ce0
auditEventCommitted: true
audit poll attempt: 1
```

Sanitized response facts:

```text
httpStatus: 200
responseBytes: 822
rawPiiReturned: false
moneyMovement: false
placeholderMode: none
```

WASM artifact:

```text
agent-passport-protected-actions/../repos/z-safe-egress-demo/target/wasm32-wasip2/release/z_safe_egress_demo.wasm
sha256: 224ce92c892d9b2262639fd5ba5fe00ff9a33811b5c202cb878d72c9f2f4de79
```

## Evidence boundary scan

Scanned live log and three receipts for:

```text
credential environment-variable marker
private-key marker
PEM private-key header marker
raw-PII-returned true marker
money-movement true marker
real-payment phrase
production-governance phrase
dotenv path marker
```

Result:

```text
OK — no hits in log or receipt set.
```

## Claim boundary

Safe claim:

```text
Live Terminal 3 testnet safe-egress extension demonstrates user-scoped egress control: outbound http-with-placeholders call fails before grant, a self-grant scopes the agent to one contract/function/host, placeholder lookup fails without returning raw PII, and allowed egress succeeds with a committed Terminal 3 audit event bound into an Agent Passport receipt.
```

Forbidden claims still not made:

```text
production trust complete
recognized legal governance authority
KYC/identity proofing solved
real payment/action flow proved
raw PII flow proved
```

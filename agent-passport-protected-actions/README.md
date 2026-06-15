# Agent Passport for Protected Actions

Terminal 3 ADK bounty/build demo for Leonardo's Agent Trust Stack.

> A capable agent without a passport is power behind a curtain. This demo gives an agent a Terminal-3-shaped identity, scoped authority, a refusal boundary, and a receipt for every protected action it attempts.

## What this BUIDL demonstrates

```text
Agent DID / passport
→ scoped authority envelope
→ protected-action decision gate
→ T3 execute payload shape when allowed
→ refusal before execution when out of scope / wrong issuer / revoked passport
→ local action receipt with hashes and no raw PII
→ live Terminal 3 testnet auth smoke
→ bounded no-money/no-PII live protected read (`live-submitted`)
→ bounded no-money/no-PII tenant-contract invocation with committed T3 audit event (`live-audited`)
→ user-scoped safe egress: denied before grant, self-granted host, placeholder denial, allowed host audited
```

This is intentionally small: it does **not** pitch all of Leonardo. It shows one platform-native spear: **Agent Passport for Protected Actions**.

## Files

- `src/passport.ts` — Terminal 3 DID validation and Agent Passport / AWE envelope.
- `src/protected-action.ts` — scoped action gate and T3 execute payload builder; supports binding to a concrete tenant script/function/input.
- `src/receipt.ts` — audit receipt builder with tamper hash, PII reference hashes, live evidence status, and audit-event binding fields.
- `src/audit.ts` — deterministic JSON hashing and `getAuditEvents` event binding helper.
- `src/t3n.ts` — installed `@terminal3/t3n-sdk` integration surface + live smoke helper.
- `src/demo.ts` — local demo receipt generator.
- `src/cli/local-demo.ts` — writes local receipts.
- `src/cli/t3n-smoke.ts` — live Terminal 3 testnet auth/usage smoke; requires `T3N_API_KEY`.
- `src/cli/live-audit-probe.ts` — live register → execute → `getAuditEvents` → bind → receipt path.
- `src/safe-egress.ts` and `src/cli/safe-egress-demo.ts` — live user-grant / allowed-host / `http-with-placeholders` / egress-denial harness.
- `src/sdk-breadth.ts` and `src/cli/sdk-breadth-probe.ts` — live SDK breadth receipt over auth, usage, wallet/history, human-identity boundary, and audit-read.
- `tests/*.test.ts` — Vitest coverage for passport, gate, receipt, audit binding, demo, SDK surface, safe-egress canonical payload behavior, and SDK breadth redaction/boundary behavior.
- `receipts/*.json` — generated demo, live-submitted, live-failed-denial, and live-audited receipts.
- `logs/*.json` / `../logs/*.txt` — sanitized live and verification logs; no API key.
- `../repos/z-audit-probe/` — minimal Rust/WIT Terminal 3 tenant contract that emits one no-money/no-PII audit event.
- `../repos/z-safe-egress-demo/` — minimal Rust/WIT Terminal 3 tenant contract that imports `http-with-placeholders` and proves scoped egress controls.

## Local setup

```bash
# From the extracted bundle root
cd agent-passport-protected-actions
pnpm install
# If pnpm 11+ refuses dependency build scripts, this repo approves only esbuild in pnpm-workspace.yaml.
pnpm verify
```

Latest local verification:

```text
pnpm test       # 13 files / 52 tests passed
pnpm typecheck  # passed
pnpm build      # passed
pnpm demo:local # wrote allowed/refused + delegated-consent receipts
```

Audit probe contract verification:

```bash
cd ../repos/z-audit-probe
cargo test
cargo build --target wasm32-wasip2 --release
wasm-tools validate target/wasm32-wasip2/release/z_audit_probe.wasm
```

Verified:

```text
cargo test: 1 unit test + 1 doctest passed
wasm build: passed
wasm validate: passed
z_audit_probe.wasm sha256: 243ebb088c125e8f95c08bb8b042c1a03b155c0fb675f139a8bcb0e710cf232b
```

## Live Terminal 3 auth smoke

First claim the sandbox key from Terminal 3's claim page. The page says the API key is shown once; keep it out of git and logs.

```bash
# From the extracted bundle root
cd agent-passport-protected-actions
cp .env.example .env
# put T3N_API_KEY in the local dotenv file or export it in the shell; do not paste it in chat
set -a; . ./.env; set +a
pnpm t3n:smoke
```

The smoke path uses the installed SDK exports:

```ts
setEnvironment("testnet");
loadWasmComponent();
eth_get_address(T3N_API_KEY);
new T3nClient({ handlers: { EthSign: metamask_sign(address, undefined, T3N_API_KEY) } });
client.handshake();
client.authenticate(createEthAuthInput(address));
client.getUsage({ limit: 5 });
```

Observed live smoke:

```text
environment: testnet
nodeUrl: https://cn-api.sg.testnet.t3n.terminal3.io
did: did:t3n:5c946503c2d9924f58ee273dbd2efba8d03a12df
balance.available: 20000
```

Without `T3N_API_KEY`, it fails closed:

```text
T3N_API_KEY is required for live Terminal 3 testnet calls. Claim it on the T3N sandbox page and keep it secret.
```

## Live Terminal 3 protected-read smoke

After Council asked for a build-track step beyond auth-only smoke, one bounded no-money/no-PII live protected read was run via the SDK:

```text
method: T3nClient.getSelfEthAddress
environment: testnet
nodeUrl: https://cn-api.sg.testnet.t3n.terminal3.io
did: did:t3n:5c946503c2d9924f58ee273dbd2efba8d03a12df
protectedRead.status: live-submitted
protectedRead.ok: true
protectedRead.responseHash: sha256:f175836fc46f4da7aedf17529a0bb2360eb2e90b6f449417f7865e13f7ac0287
auditRead.ok: true
auditRead.batchCount: 0
auditRead.eventCount: 0
```

Receipt:

```text
Path: receipts/live_get_self_eth_address-submitted.json
Receipt hash: sha256:ea56b71749d81e66211c09ef8be1de913415a343c5d352042f41fbeae129e088
Whole-file sha256: 3d961ac16dc704c6aea1d858ec0509b395dc35ed6254e7f6e3134199af92bb27
```

This is **live-submitted**, not **live-audited**: `getAuditEvents({ limit: 5 })` returned zero batches/events for that SDK read.

## Live Terminal 3 audited tenant-contract proof

Council then required a true audited path: no money, no raw PII, tenant contract execution, and an audit event returned by `getAuditEvents`.

Run path:

```bash
# From the extracted bundle root
cd agent-passport-protected-actions
# .env contains T3N_API_KEY; do not print it
pnpm t3n:audit-probe
```

What `pnpm t3n:audit-probe` does:

```text
1. authenticate to T3 testnet
2. register ../repos/z-audit-probe/target/wasm32-wasip2/release/z_audit_probe.wasm
3. build a local Agent Passport with amount cap 0 and no PII refs
4. execute z:<did>:ap-audit-probe audit-ping()
5. poll getAuditEvents
6. bind the committed audit event to the receipt
```

Important WIT discovery:

```text
working host call shape: logging.audit(event: audit-event)
failed host call shape: logging.audit(action, target, outcome, details)
```

Successful live-audited run:

```text
log: logs/t3n-live-audit-probe-20260615t030651722z.json
receipt: receipts/live_audit_probe-req-audit-20260615t030651722z-live-audited.json
requestId: req-audit-20260615t030651722z
contract tail: ap-audit-probe
contract version: 0.1.2
contract_id: 129
amountCents: 0
pii: false
execute.ok: true
auditPoll.attempt: 1
auditPoll.batchCount: 1
auditEventCommitted: true
```

Bound audit evidence:

```text
auditEventId: 5c946503c2d9924f58ee273dbd2efba8d03a12df0000019ec93f1ef55c946503c2d9924f58ee273dbd2efba8d03a12df00000081d60f0617e4b2ef06:sha256:8c60e69f7af5b79e839943f6d93311e60612bee27c145eeaa62bcc88d3084b80
auditBatchKey: 5c946503c2d9924f58ee273dbd2efba8d03a12df0000019ec93f1ef55c946503c2d9924f58ee273dbd2efba8d03a12df00000081d60f0617e4b2ef06
auditEventHash: sha256:8c60e69f7af5b79e839943f6d93311e60612bee27c145eeaa62bcc88d3084b80
responseHash: sha256:9c5bdbeb5a5ee5ea89f5fbb8dc926e2c50350d699936ac8c516829dba185426a
executePayloadHash: sha256:688e6bbf903b51104a21bb23bd612b3d066d35db1ad877b96d0a5f6f328ebea1
receiptHash: sha256:89df2ddcf390a45745eaa6460bc7b8f94a0aec69ccfef2f92046300b37e80a03
whole-file receipt sha256: 137743ea9e1791aa797c4d9c4bcb10969edaba6ca8fe6f724faedbc00abd54e8
```

## Repeatability gate

After Council verified the first live-audited receipt, the next smallest useful experiment was repeatability: run the audit probe several times with distinct request IDs and require distinct committed audit events.

```text
summary: ../logs/t3n-audit-repeatability-summary-20260615T0323Z.json
summary sha256: f059bf7db182263a55f8782ad91c2f9e74a5470dbefe6fff78a118fcc14b1e80
totalLiveAuditedRuns: 4
allStatusLiveAudited: true
distinctRequestIds: 4
distinctAuditEventIds: 4
allNoMoney: true
allNoPii: true
```

Repeatability receipts:

| Request ID | Whole-file sha256 | Embedded receiptHash | Audit event hash |
|---|---:|---:|---:|
| `req-audit-20260615t032117658z` | `2c4f49d9a2cedbb1b216c2ec3591006aff70197d162d70677f83d0cf7374dad7` | `sha256:d7c3b45d555e93e79b157f7db77e5e91308f03c5feeb6d3a0728cff91ec26b0d` | `sha256:5d1b5623aaa3fbc55a8f4b166e9b8ff4b69aa0ef18dd09b2abe59f1c5b41eb2e` |
| `req-audit-20260615t032125784z` | `833eb4b404dc3a1acedc29ec2bfa9ade4ac31a1080ad31b1efa9cbca402f0fa8` | `sha256:2da2cd28daa97b9ea81824b5d4d4c14fb8e496c95ed5aba6c411a4f8741c5183` | `sha256:514500d0925259255997a7c2c49e19bb5a9e081365d8144d62d3fbf3f816eed1` |
| `req-audit-20260615t032136561z` | `7ca53926b0ae1bb4ed9bbd88e55268e24092005eaa17e28e1ff3e448ca985736` | `sha256:c5c7e61da5357538dbb129de4fc15fbccad0823e0e8cae1c093d51b3cae7f38a` | `sha256:019dee496dfeb0485647b85424fdb0dfe17e73725604531eac691a5f2d9cca83` |
| `req-audit-20260615t032311691z` | `73378c1c83c74f7e4f85bda2ba1631fd1b740db7cf32addb4597cd80e823df81` | `sha256:5c59f8d8a88cb42762910deb59dd5f6f603126696259beb20703f9e10501d49c` | `sha256:c1de6c6b047922ed0f59d942edb33c7b7d54dd212d7d8cd9cda7755d4a420cac` |

Operational note: Terminal 3 rejects fixed-tail reruns if the version is not higher than the already registered version. The CLI now defaults to a unique short tail (`ap-audit-<base36-ms>`) so `pnpm t3n:audit-probe` can be repeated without manual version override. If you force a fixed tail with `T3N_AUDIT_PROBE_TAIL`, also increment `T3N_AUDIT_PROBE_VERSION`.

## Delegated-consent local gate

The next build step adds a local delegated-consent boundary without claiming live human authority. A protected action can now require an explicit delegation grant before the decision gate creates any T3 payload.

The gate checks:

```text
passport issuer == delegation issuer
passport agent == delegation agent
action/target/currency/PII mode covered by delegation
action amount <= delegated cap
grant is active, not expired, not revoked
nonce has not been used
human reference is only an opaque sha256 hash
```

Local receipts:

| Receipt | Whole-file sha256 | Receipt hash | Result |
|---|---:|---:|---|
| `receipts/demo_delegated_missing_grant-refused.json` | `42e47c9d64eaa4d24f249a1f5f946dbc02228bc266204a4fa5c2afe8f7d19715` | `sha256:89cb6c2bc14d7519c83db961e0a00452793a5b2df9557e5664c1d43c44ad5076` | refused before payload |
| `receipts/demo_delegated_allowed-allowed.json` | `2bab2db82112f8580cbe2d13b2a1c76634fa42de17bba33598414ea82530b30b` | `sha256:d19fe3717846a5c2a41ab059a50dcbfc5dfb300a0395a37194acf1036b31e906` | allowed with grant |

Allowed receipt binds, without raw human identity:

```text
grantId: deleg_f7baae10eef76ecdf881c7f5e7496f72
grantHash: sha256:8d6a76206461fb42039c07d9c8249df8b79c1e35100734c43414755221029175
humanRefHash: sha256:6718ba5c24a11369a88690b26827fe5f9eefc0f740cfa334f329191ad4ad9524
evidenceHash: sha256:cb1c4819bd68669fa86e6f3447a614ef6302fc9099b3c278b9ed5d7101864ed0
nonceHash: sha256:5efeb27d240078bfa4d924704eba6c408c8500ff0f5988f5b4637a7874d1f7e9
```

This is a local authority scaffold. It does **not** prove live human signature, legal consent, production identity proofing, real payment flow, or raw-PII handling.

## Signed delegated-consent ceremony

The next build step adds a local cryptographic ceremony over the delegation challenge. This is still not production legal authority, but it does prove the signature mechanics and receipt binding.

The ceremony checks:

```text
canonical challenge covers issuer DID, agent DID, scope, amount cap, currency, PII mode, expiry, nonce, opaque humanRefHash, evidenceHash
Ed25519 signature verifies over that exact challenge
tampered challenge verification fails
requireSignedDelegationGrant=true refuses unsigned grants before payload
signed grants inject consent signature/challenge hashes into the execute payload
receipts bind consentChallengeHash, consentSignatureHash, publicKeyFingerprint
private key is not persisted
raw human identity is not included
```

Command:

```bash
pnpm consent:demo
```

Signed ceremony artifacts:

| Artifact | Whole-file sha256 |
|---|---:|
| `src/consent.ts` | `4ceb9e7439dfe9cb0d0ae062b53575f08c91adff6e4e73137418cb7f4dcc525f` |
| `src/cli/consent-ceremony.ts` | `6169a4715c8cc783c9227578ff339d527a8930466343a5fc344150417e35dd06` |
| `tests/consent.test.ts` | `d7c2630307e08dcf3f02d32d908abd1f227aa46931a193a5ac9af77cda928f68` |
| `receipts/demo_signed_delegation-20260615t035401682z-allowed.json` | `e2f27b0be9c217e94f64b1488f6e8e10213f6e68cda162a061e378ae58b2a24d` |
| `logs/signed-consent-ceremony-20260615t035401682z.json` | `8f39a2c629cadb365ae20f3b1dab7f360db6775cc8656a2bad5337d4465fabdf` |

Signed receipt binds:

```text
receiptHash: sha256:2a6cc058b2bf4bffbf7d4f69470028988933a38ac173257f92447acc8d17ad1f
grantId: deleg_8cfd1c253daacb160382817d966872f7
grantHash: sha256:01823feb41807f6748fab34ca06e40d4774f531cd45f22524380b59a8e9a66ff
consentChallengeHash: sha256:702bbb16eabf570f28735e2b497e579e5f03057685f8c0585a1eebf1947e250e
consentSignatureHash: sha256:f1a0bbd62892a37f9c1e9633bc488cb4f61ef6634b361931471c6f81a8cd4eda
publicKeyFingerprint: sha256:371eb6b2ecfaca46ffbe9f969352b2040b3789c64f22af361808494065d99d15
signatureVerified: true
privateKeyPersisted: false
rawHumanIdentityIncluded: false
```

This narrows the remaining gap to externally anchored human identity / consent policy.

## Consent policy source-of-truth anchor scaffold

The next build step adds a fail-closed policy anchor. This proves policy source hash enforcement and receipt binding, not legal authority or production governance.

The policy gate checks:

```text
policy source document has a stable sha256 source hash
policy anchor names policyId/version/sourceUri/sourceHash
policy scope covers issuer DID, action, target, amount cap, currency, PII mode
policy can require signed consent and audit
missing policy anchor refuses before payload
revoked or over-cap policy refuses before payload
active policy + signed grant allows payload and injects consent_policy_id/hash/source_hash
receipt binds policy id/hash/version/source URI/source hash without raw policy text
```

Command:

```bash
pnpm policy:demo
```

Policy anchor artifacts:

| Artifact | Whole-file sha256 |
|---|---:|
| `policies/agent-passport-consent-policy-v0.1.json` | `89310ff9542391fa6d1e621e618d26be65bd027f43acb748361398cc4d8a3696` |
| `src/policy.ts` | `0bae2eec263fe74150dcf772d6a14eb706d4dac01d73ea762ce8fe152379fb80` |
| `src/cli/policy-anchor-demo.ts` | `ae965ef262e66189771fe171971d7feec03bbd653366081cb446d0679c416ef7` |
| `tests/policy.test.ts` | `c2007dfc6f3e1794949917ebc50db9ec48ac7f8724baa446339d79bf9d234f8e` |

Policy receipts:

| Receipt | Whole-file sha256 | Receipt hash | Result |
|---|---:|---:|---|
| `receipts/demo_policy_anchor_missing-20260615t040834535z-refused.json` | `93ab8644702129bb0b09f21834a3c500e5ca822adb66d7bf5ea2244fdb4d3efb` | `sha256:800828a6edb0319478984fb06b179fa7f47c8c9838e306b6afc90727c92893ce` | refused before payload |
| `receipts/demo_policy_anchor-20260615t040834535z-allowed.json` | `2b7f326be782974cac4858c7833efbe77993f3c36b0f36d5f83fee9d862d6d13` | `sha256:0ea93675ab7f509adb512147dd56ea20cab3eed5f4fd56580f5130ed2a93fbc4` | allowed with signed grant + policy |

Allowed policy receipt binds:

```text
policyId: policy-agent-passport-demo-v0.1
policyHash: sha256:5cd0d6646c6a094e9f8d26826e05e645702e81c6c393ed5983f385f72a027094
sourceUri: file://policies/agent-passport-consent-policy-v0.1.json
sourceHash: sha256:cc364995d1a687caa1d0cde1af6a3096dfffc633584a23fd684b3c29d766ef2b
requiresSignedConsent: true
requiresAudit: true
rawPolicyTextInReceipt: false
```

This narrows the remaining gap to external policy governance + external human identity proofing.

## Governance witness scaffold

The next build step adds a fail-closed governance witness. This proves a witness-attestation interface and receipt binding, not that the witness is externally recognized or legally authoritative.

The witness gate checks:

```text
governance witness challenge covers witness ID/role, policy hash/source hash, grant hash, consent signature hash, request hash
witness attestation verifies over the exact challenge
tampered request scope fails verification
missing governance witness refuses before payload
revoked or request-mismatched witness refuses before payload
policy + signed grant + governance witness allows payload and injects governance_witness_id/attestation_hash/signature_hash
receipt binds witness id/role/challenge/signature/attestation hashes
```

Command:

```bash
pnpm governance:demo
```

Governance witness artifacts:

| Artifact | Whole-file sha256 |
|---|---:|
| `src/governance.ts` | `271725c9ceca405c1da0b5ad53fe486849a1eecb10ebdf2a757e2adc74a27b42` |
| `src/cli/governance-witness-demo.ts` | `d2a5e0e0cafc43ca47c0254a939f45226f0bf05ef84d467bd842e4024c099394` |
| `tests/governance.test.ts` | `da8e41bbb21ad65b9b5579e27c8701669cbe0ea2ed1533579a31578e418fb9d6` |

Governance receipts:

| Receipt | Whole-file sha256 | Receipt hash | Result |
|---|---:|---:|---|
| `receipts/demo_governance_witness_missing-20260615t042857030z-refused.json` | `ddfa256384f0035620059aae3b2a841645d2aedcf3bc64a53340457556a59cf1` | `sha256:21a9ff1799fd84c808a1d33b6a01b3edad6fe388f467ae8822f1cdbc6b1ee2c7` | refused before payload |
| `receipts/demo_governance_witness-20260615t042857030z-allowed.json` | `9725b48ce30c0f653903ba7620acb6a52a86968abbd2e80474649585f5c9975b` | `sha256:4721c459ec7142c686582b1f0881eb2aeff09da7a90c6a57a0f3995a1bea8cc3` | allowed with signed grant + policy + witness |

Allowed governance receipt binds:

```text
witnessId: witness-local-governance-demo-1
witnessRole: policy-governance-witness
attestationHash: sha256:eb4b4f18925d96e0bb5e5f44e17555478550aa76ee901391f61a38eafc89b98a
challengeHash: sha256:e7e26c49a11a90786b1f2cf0e819dab95cf60b6ee78c5ed1e79d0061c5ac8b3d
signatureHash: sha256:6e9effea6281d86e449b0a9ae134a2583704b7b6bf0ac6211b13e03fd68803fc
publicKeyFingerprint: sha256:3c98591f49ebd0744eef4b080694074d1d32d20bc7cc2a99452a12fff801ad24
realExternalGovernanceClaimed: false
```

## External audit registry anchor scaffold

The next build step imports a committed Terminal 3 testnet audit event as an external host-stamped registry record, then requires a local anchor binding that record to the policy, signed grant, governance witness, and request subject before payload creation. This is stronger than local-only ceremony; it is still not a claim that the registry is a legal/governance authority.

The registry gate checks:

```text
external registry subject binds policyHash/sourceHash, grantHash, consentSignatureHash, governance witness hashes, and requestHash
external registry anchor requires live-audited Terminal 3 evidence with auditEventCommitted=true
auditEventId and auditEventHash become the registryRecordId and registryRecordHash
missing external registry anchor refuses before payload
request-mismatched external registry anchor refuses before payload
policy + signed grant + governance witness + external registry anchor allows payload
receipt binds registry id/kind/url/record hash/subject hash/anchor hash
realExternalGovernanceClaimed stays false
```

Commands:

```bash
# Fresh no-money/no-PII external registry audit event
set -a; . ./.env; set +a
T3N_AUDIT_PROBE_ACTION='agent-passport.external-registry-anchor' \
T3N_AUDIT_PROBE_TARGET='terminal3.testnet.external-registry' \
T3N_AUDIT_PROBE_ANCHOR_KIND='external-registry-anchor' \
pnpm t3n:audit-probe

# Bind that live-audited event into local policy/grant/witness receipts
T3N_REGISTRY_RECEIPT='receipts/live_audit_probe-req-audit-20260615t051314496z-live-audited.json' pnpm registry:demo
```

External registry artifacts:

| Artifact | Whole-file sha256 |
|---|---:|
| `src/registry.ts` | `4d24cae2a00a91fe647f8a99e0dac11727f576b791eede845ed137e74f94b876` |
| `src/cli/external-registry-anchor-demo.ts` | `410957f80767e4df50bd845deb4137016c6f548f1861fe3c5cf6fb9e90d5f35f` |
| `tests/registry.test.ts` | `44c9d50e8c00ada009c3a8e8e67fe90e582a51010b0c56b9596cdde56a5becff` |
| `src/cli/live-audit-probe.ts` | `369c5e9179353019ca85d29f81fd9492d00f2ceb1d3773ae9f0059313f39de56` |
| `../repos/z-audit-probe/src/lib.rs` | `598a77a3285bac55b54faf42d5323719970381a4bf958503d79bd4b646f39395` |
| `../repos/z-audit-probe/target/wasm32-wasip2/release/z_audit_probe.wasm` | `243ebb088c125e8f95c08bb8b042c1a03b155c0fb675f139a8bcb0e710cf232b` |

External registry receipts:

| Receipt | Whole-file sha256 | Receipt hash | Result |
|---|---:|---:|---|
| `receipts/live_audit_probe-req-audit-20260615t051314496z-live-audited.json` | `ce6f38fbaaed85bcb0819e75b2b114c0e0eb85261943ffba5b10cf9805b7d873` | `sha256:4324628f9927999ae8a2c4ca322cfbbec9c90c6c045cfda348e87869286ee152` | live-audited external registry probe |
| `receipts/demo_external_registry_missing-20260615t051347500z-refused.json` | `d30b5e11a0a5ef59490df0d6fa0da11872180e35b4d6e4c481ea84fe60074c50` | `sha256:c30efe7fe541fe53e48a51944e18f5baa814b313512fbabb2792b82e270c2392` | refused before payload |
| `receipts/demo_external_registry_anchor-20260615t051347500z-allowed.json` | `1576803b4755fc849df250797fdd5311812cbffa163dd6010f65d3a4f93bd63e` | `sha256:289a6cdfc6dbeb3dc239885775949048e875aeb3a540c7f5cc2a96d02078d6df` | allowed with signed grant + policy + witness + external registry anchor |

Allowed external-registry receipt binds:

```text
registryKind: terminal3-testnet-audit
registryUrl: https://cn-api.sg.testnet.t3n.terminal3.io
registryRecordHash: sha256:725f9534923c4453a86f0caa8de8459b786cb1ad6e83845babe469f665c6c2ed
subjectHash: sha256:b5ec16b0034deebc1c065b3b083315c245a8fb1f6a987e6a46fcf57110169bc6
anchorHash: sha256:b5268af8d119dda8852514b29efd653960a5361d450d344fd56d1947c6787e15
externalRegistryRecordLiveAudited: true
realExternalGovernanceClaimed: false
```

This narrows the remaining gap to recognized external governance authority / human identity proofing, not another local receipt-binding scaffold.

## Live Terminal 3 safe-egress proof

After the max-prize Council loop, the build added a real user-scoped egress path using Terminal 3 `http-with-placeholders`.

Command:

```bash
set -a; . ./.env; set +a
pnpm t3n:safe-egress
```

What it proves:

```text
1. Before grant, outbound http-with-placeholders fails with egress denied for host httpbin.org.
2. A self-grant scopes this agent to one z: contract, functions ping-allowed / ping-placeholder-denial, and allowedHost httpbin.org.
3. Placeholder lookup failure returns only the missing field name/hash path; no raw PII is returned.
4. After grant, allowed host egress succeeds, emits a committed Terminal 3 audit event, and binds that event into the receipt.
```

Live run stamp: `20260615t173901793z`.

| Edge | Receipt | Whole-file sha256 | Embedded receiptHash | Result |
|---|---|---:|---:|---|
| denied before grant | `receipts/safe_egress_denied-egress-req-egress-denied-20260615t173901793z-live-failed.json` | `f6dd3c5b3579e94a1cdf62e7e4c2cfb2d74caadbfc8e36daf4b65cb13e8971b8` | `sha256:fcefe46fc573a738ef85a706cc473179dca749fc745bf1c977612e42d571d2fa` | `egress denied for host httpbin.org` |
| placeholder denial | `receipts/safe_egress_placeholder-denial-req-placeholder-denied-20260615t173901793z-live-failed.json` | `016190feed620bfc75492f4892adaed8c18d61d1077a46248b9c7be9a591e8e7` | `sha256:f21db63749cb38c7489587e41438af54372cd36753203486c3ecff40a9544687` | `user profile missing field: __leonardo_forbidden_demo_field` |
| allowed after grant | `receipts/safe_egress_allowed-egress-req-egress-allowed-20260615t173901793z-live-audited.json` | `efb8351dd81192ceb7efaa3b758e2c567572b7dc049a15ff3d6265eaa1aa4618` | `sha256:59f5e3e3b30c897f61abe70b49878e140d859809be2798b2174c5d453268f663` | `live-audited`, `auditEventCommitted=true` |

Allowed edge audit:

```text
auditEventHash: sha256:1874bc2bc4906048d641e66521dc5c014b7715794e350a4d660133ac23e57ce0
responseHash: sha256:cb47d5e86e8f528563a16761618d57424f4ebb053e79551c80374ba2cc9db903
log: logs/t3n-safe-egress-20260615t173901793z.json
log sha256: e2cec7df3a7e221ed2c22a7e69f519fec4edf6050768c203b45a02ee2caada5f
wasm sha256: 224ce92c892d9b2262639fd5ba5fe00ff9a33811b5c202cb878d72c9f2f4de79
```

Boundary: no money movement, no raw PII returned, no API key printed, no production/legal/KYC claim.

## Receipt examples

Allowed local action:

- Path: `receipts/demo_allowed-allowed.json`
- Receipt hash: `sha256:317b2cab394fb1fed2430bbc9abbc47baa40dbe4dbad905ef1aa9dc8995c2552`
- Decision: `allowed=true`, reason `in-scope`
- Execute payload hash: `sha256:fe74219c80827be1b051f529cb219d524abccc4a0f20265d23ca80680b572fb8`

Refused local action:

- Path: `receipts/demo_refused_over_cap-refused.json`
- Receipt hash: `sha256:e302700e58b9996bc23bdf779efabefd2170c518e4fd39d6ceaba4d7907e472a`
- Decision: `allowed=false`, reason `amount 65000 exceeds passport cap 50000`
- No T3 execute payload is produced.

Live-audited tenant-contract action:

- Path: `receipts/live_audit_probe-req-audit-20260615t030651722z-live-audited.json`
- Receipt hash: `sha256:89df2ddcf390a45745eaa6460bc7b8f94a0aec69ccfef2f92046300b37e80a03`
- Whole-file sha256: `137743ea9e1791aa797c4d9c4bcb10969edaba6ca8fe6f724faedbc00abd54e8`
- T3 status: `live-audited`
- Audit event committed: `true`

## Security and privacy boundary

- No raw PII is accepted in the gate. Private values must be `{{profile.field}}` placeholders.
- Receipts store hashes of PII references, not raw private data.
- Out-of-scope actions fail before any T3 execute payload is generated.
- `DecisionContext.trustedIssuerDids` can require an explicit issuer allow-list; untrusted issuer passports fail before payload.
- `DecisionContext.revokedPassportIds` can revoke a passport; revoked passports fail before payload.
- `live-audited` receipts require `auditEventId`; a live response hash alone is only `live-submitted`.
- Signed delegation receipts bind `consentChallengeHash`, `consentSignatureHash`, and `publicKeyFingerprint`; they do not store private keys or raw human identity.
- Policy anchor receipts bind `policyId`, `policyHash`, `sourceUri`, and `sourceHash`; they do not store raw policy text as authority proof.
- Governance witness receipts bind `witnessId`, `witnessRole`, `attestationHash`, `challengeHash`, `signatureHash`, and `publicKeyFingerprint`; they do not claim the witness is externally authorized.
- External registry anchor receipts bind `registryId`, `registryKind`, `registryUrl`, `registryRecordId`, `registryRecordHash`, `subjectHash`, and `anchorHash`; they do not claim the registry is legal/governance authority.
- Safe-egress receipts prove `http-with-placeholders` egress is denied before user grant, scoped by a self-grant to one contract/function/host, rejects unresolved profile placeholders without returning raw PII, and succeeds after grant with a committed Terminal 3 audit event.
- The demo defaults to the authenticated Terminal 3 DID from live smoke: `did:t3n:5c946503c2d9924f58ee273dbd2efba8d03a12df`.
- This is not a government ID, not a magic safety badge, and not proof of production readiness. It is a structured accountability envelope for identity, scope, evidence, and receipts.

## Current claim boundary

Safe:

```text
We have live Terminal 3 testnet tenant-contract invocations, with no money and no raw PII, that emitted committed host-stamped audit events and produced live-audited Agent Passport receipts bound to those events. Repeatability is 4/4: four distinct request IDs and four distinct committed audit-event IDs. We also have a live user-scoped safe-egress proof: `http-with-placeholders` egress fails before grant, a self-grant scopes one contract/function/host, placeholder lookup fails without returning raw PII, and allowed host egress succeeds with a committed Terminal 3 audit event. A local delegated-consent gate requires an explicit opaque-hash grant before selected payloads can be created. A signed delegated-consent ceremony verifies an Ed25519 signature over a canonical challenge and binds challenge/signature/fingerprint hashes into the receipt without raw human identity or a persisted private key. A policy anchor scaffold requires a hashed policy source-of-truth before payload creation and binds policy id/hash/source hash into receipts. A governance witness scaffold requires a separately signed witness attestation over policy, signed grant, and request scope before payload creation and binds witness hashes into receipts. An external audit registry anchor scaffold imports a committed Terminal 3 testnet audit event as a host-stamped registry record, requires an anchor over policy + signed grant + governance witness + request subject before payload creation, and binds registry id/kind/url/record hash/subject hash/anchor hash into receipts.
```

Unsafe:

```text
Delegated human authority is solved; live human signature/identity proofing is complete; recognized external governance/legal authority is solved; production trust is complete; real payment/action flow is proved; raw PII flow is proved; bounty copy can drop BUILD_SPLIT caveats.
```

Current bounty step: bounded submission copy has been extracted in `../SUBMISSION_PACKET.md` and paste-ready form answers in `../SUBMISSION_FORM_FIELDS.md`, with BUILD_SPLIT caveats preserved. Next build-track gate remains recognized external governance authority / human identity proofing; do not turn the local policy/witness/registry scaffolds into a legal-authority claim.

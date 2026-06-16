# Terminal 3 ADK — Build Track Evidence Manifest

**Scope:** build-track evidence after real Council BUILD_SPLIT, first hardening gate, and live-audited tenant-contract gate.  
**Secret policy:** API key not printed; raw `.env` not copied; logs are sanitized.  
**Current doctrine:** build may claim live-audited no-money/no-PII tenant-contract proof; it may not claim production-ready delegated human authority.

## Current max-loop addendum — safe egress (`20260615T173947Z`)

The max-prize Council loop added a bounded Terminal 3-native egress proof:

```text
contract: ../repos/z-safe-egress-demo
harness: src/cli/safe-egress-demo.ts
package script: pnpm t3n:safe-egress
interface exercised: host:interfaces/http-with-placeholders@2.1.0
scope: no money, no raw PII, testnet only
```

Latest verification:

```text
pnpm verify: 12 test files / 50 tests passed; typecheck passed; build passed; local demo wrote receipts.
z-safe-egress-demo cargo test: 2 unit tests + 1 doctest passed.
z-safe-egress-demo wasm build: passed.
z-safe-egress-demo wasm validate: passed.
pnpm t3n:safe-egress: ok=true; evidenceBoundary.ok=true.
```

Safe-egress evidence:

| Artifact | Whole-file sha256 |
|---|---:|
| `../T3_SAFE_EGRESS_IMPLEMENTATION_RECEIPT_20260615T173947Z.md` | `bd5bff8782a73e7cbc4e5c386fa57acc8f4f011ef72378ab3ce214f0a1a0ae8a` |
| `logs/t3n-safe-egress-20260615t173901793z.json` | `e2cec7df3a7e221ed2c22a7e69f519fec4edf6050768c203b45a02ee2caada5f` |
| `receipts/safe_egress_denied-egress-req-egress-denied-20260615t173901793z-live-failed.json` | `f6dd3c5b3579e94a1cdf62e7e4c2cfb2d74caadbfc8e36daf4b65cb13e8971b8` |
| `receipts/safe_egress_placeholder-denial-req-placeholder-denied-20260615t173901793z-live-failed.json` | `016190feed620bfc75492f4892adaed8c18d61d1077a46248b9c7be9a591e8e7` |
| `receipts/safe_egress_allowed-egress-req-egress-allowed-20260615t173901793z-live-audited.json` | `efb8351dd81192ceb7efaa3b758e2c567572b7dc049a15ff3d6265eaa1aa4618` |
| `../repos/z-safe-egress-demo/target/wasm32-wasip2/release/z_safe_egress_demo.wasm` | `224ce92c892d9b2262639fd5ba5fe00ff9a33811b5c202cb878d72c9f2f4de79` |

Observed edges:

```text
before grant: egress denied for host httpbin.org
after grant placeholder path: user profile missing field __leonardo_forbidden_demo_field, with only placeholder hash in receipt
after grant allowed path: httpStatus=200, rawPiiReturned=false, moneyMovement=false, auditEventCommitted=true
auditEventHash: sha256:1874bc2bc4906048d641e66521dc5c014b7715794e350a4d660133ac23e57ce0
```

This addendum supersedes older top-level counts of `11 test files / 45 tests`; historical sections below are retained as provenance for earlier build gates.

## Current max-loop addendum — SDK breadth probe (`20260615T192705Z`)

After the rules/all-links rescan, the max loop added a live SDK breadth proof:

```text
harness: src/cli/sdk-breadth-probe.ts
package script: pnpm t3n:sdk-breadth
scope: auth, usage, wallet/history, human-identity-status boundary, audit-read
safe boundary: testnet only; no raw PII; no money movement; no KYC/human-identity proof claim
```

Latest verification:

```text
pnpm verify: 14 test files / 54 tests passed; typecheck passed; build passed; local demo wrote receipts.
pnpm t3n:sdk-breadth: ok=true; auth/usage/wallet/history/audit-read live-submitted; humanIdentity safeClaim=not-proved-by-this-probe.
```

SDK breadth evidence:

| Artifact | Whole-file sha256 |
|---|---:|
| `../T3_SDK_BREADTH_IMPLEMENTATION_RECEIPT_20260615T192705Z.md` | `73122ba74bed18b081973fe73db2d7117095aa3c8db61298e8a76f8b00a1ee26` |
| `src/sdk-breadth.ts` | `457aa3b4a771547694bd1946d0401fdfb35f388dd49f72cd9cbdf20416ec52a5` |
| `src/cli/sdk-breadth-probe.ts` | `4594743ac386421082620886125225d25b954e66bfed636348b5bf09c1cc3376` |
| `tests/sdk-breadth.test.ts` | `aaac26db6425b8bd49eac3d663a8b29019d784b4a57543006f6c9331430f2710` |
| `receipts/sdk_breadth-20260615t192626284z-live-submitted.json` | `2066eab85f00a2df074ddb77280944f9292b115685d8c7e911c1c9f3d567ad23` |
| `logs/t3n-sdk-breadth-20260615t192626284z.json` | `87f334838cb3a4ddf089886392367a82f7c2b178d819f8bd4ba99accded3c194` |

Observed edges:

```text
auth ok; address hashed only
usage ok; balanceAvailable=1546
wallet/history ok; wallet address hashed only
humanIdentity refused before provider-session setup; safeClaim=not-proved-by-this-probe
auditRead ok; batchCount=5; eventCount=5
```

This addendum supersedes older top-level counts of `12 test files / 50 tests` after safe egress.

## Current post-Council copy/privacy patch (`20260615T2001Z`)

The post-SDK-breadth Council audit attempt produced two copy/privacy findings in the fallback independent seat pass. Applied without new live Terminal 3 runs:

```text
- Bug/docs lane copy now points to BUGS_AND_DOC_GAPS_RULE_COMPLIANT_APPENDIX_20260615T191349Z.md as the countable artifact.
- Stale judge-facing verification counts in DEVREL_REPORT.md and JUDGE_WALKTHROUGH_90S.md were updated from 11/45 to 13/52.
- Public testnet wallet addresses in bundled historical logs were redacted or converted to generated test fixtures; receipts remain unchanged.
- pnpm verify stayed green: 14 test files / 54 tests passed; typecheck passed; build passed; local demo wrote receipts.
```

Post-patch evidence:

| Artifact | Whole-file sha256 |
|---|---:|
| `../SUBMISSION_PACKET.md` | `eff9aca5833f3b6d9f69736c2d4fed986039cda18237e03d9a33525e874868d9` |
| `../SUBMISSION_FORM_FIELDS.md` | `fb5f9ce7b33614ad76964c7bd516a8821f3f6b5ddb2a1fb2a909dc7bd3f7cc9f` |
| `../DEVREL_REPORT.md` | `1c02614820f45f6b1effa65f97034321d6d349f20d90f78ec337f43b19c91c54` |
| `../JUDGE_WALKTHROUGH_90S.md` | `edcc66ddb60e816f8e4769d92e0105a9aed1df03b0d7cb4614f695e69ba37c9e` |
| `tests/sdk-breadth.test.ts` | `aaac26db6425b8bd49eac3d663a8b29019d784b4a57543006f6c9331430f2710` |
| `logs/t3n-live-audit-probe-20260615t030651722z.json` | `d9e3e4b9f5cf1a1902fc8da6964435915ff78ea2766729ecf83c0d398c1b7124` |
| `logs/t3n-live-audit-probe-20260615t051314496z.json` | `541d0a3f4f5f6b9cade48f83d336f6e28156282260df1c4d7853039ee63f376c` |
| `logs/t3n-live-protected-read-20260615T022930Z.json` | `3796620df0318e69d69c6ab1a5ad50aaf1575a8004d7a4e2fd702c3fdf37f221` |
| `logs/t3n-safe-egress-20260615t173901793z.json` | `e2cec7df3a7e221ed2c22a7e69f519fec4edf6050768c203b45a02ee2caada5f` |
| `../logs/post-council-copy-patch-verify-20260615T2001Z.txt` | `d466ae98fb24f7a9e4ea667be65c8fdf9412e096d2f0ee2829898d998e716338` |

## Current Council gate

```text
Round 1: BUILD_SPLIT
Round 2: first hardening gate accepted; next gate was live-audited tenant-contract proof
Current result: external audit registry anchor gate crossed after live-audited no-money/no-PII tenant-contract proof, repeatability, local delegated consent, signed consent, policy anchor, and governance witness scaffold
```

Council synthesis artifact:

```text
../BUILD_TRACK_COUNCIL_SYNTHESIS.md
sha256:db2fa4c3aea21bbccf817fe32274e3bac59d235c9688dd6d1383515e817d9668
```

README artifact:

```text
README.md
sha256:660067f7b0df9c9e367d818e5676fc5f97fbc0e645897540b02919a2ba082ad7
```

## SDK / package

```text
project: agent-passport-protected-actions
project version: 0.1.0
@terminal3/t3n-sdk: 3.5.2
repo status: no enclosing git repository found under /home/exor/Leonardo or the project directory
```

## Whole-file SHA-256

| Artifact | Whole-file sha256 |
|---|---:|
| `../BUILD_TRACK_COUNCIL_SYNTHESIS.md` | `db2fa4c3aea21bbccf817fe32274e3bac59d235c9688dd6d1383515e817d9668` |
| `README.md` | `660067f7b0df9c9e367d818e5676fc5f97fbc0e645897540b02919a2ba082ad7` |
| `package.json` | `aa25557f5faaf84be934239c8a938bcedf64e613f96aa4e3bb2147791daed48f` |
| `src/audit.ts` | `b5aef92e672d368a77c14669c45adfcfe8aeaa1bf035712042acc71d6bb5eecf` |
| `src/protected-action.ts` | `dcc1df90ec3ba9665fbad4600e22937a7a32afc8b9f51dcf93feb44d752fb022` |
| `src/receipt.ts` | `d60918683340df0d5bedb9d52491e6ea64148053d5152fbb5a0014e184e75973` |
| `src/cli/live-audit-probe.ts` | `369c5e9179353019ca85d29f81fd9492d00f2ceb1d3773ae9f0059313f39de56` |
| `tests/audit.test.ts` | `d1e85c8adceb6c7dbc75a6c8120f6a467523de6378bb0856ee4ab2dfd4c10861` |
| `tests/protected-action.test.ts` | `555befd3b9fc6af58fc5d48ffe20117907eb9acd6941c352b657b34d20e02bcb` |
| `tests/receipt.test.ts` | `c4e6994a087d691d74d33c73b555942862b8a728dba94167b11432eafe9f2c4e` |
| `receipts/demo_allowed-allowed.json` | `62f8560b0681b8a189cd69d5e5dded21ace06c5f5bc592b0449ccd4b9f801689` |
| `receipts/demo_refused_over_cap-refused.json` | `592bef0e7f0238fe00a1c5062a6e0427b9500900e3745b15d364612713402e28` |
| `receipts/live_get_self_eth_address-submitted.json` | `3d961ac16dc704c6aea1d858ec0509b395dc35ed6254e7f6e3134199af92bb27` |
| `receipts/live_audit_probe-req-audit-20260615t030651722z-live-audited.json` | `137743ea9e1791aa797c4d9c4bcb10969edaba6ca8fe6f724faedbc00abd54e8` |
| `logs/t3n-live-protected-read-20260615T022930Z.json` | `2806b39597e3763d67b6c5e529e4d9dd3aa7bc9bb759905021646e4b19984533` |
| `logs/t3n-live-audit-probe-20260615t030651722z.json` | `fbb473de8578aef64638aa0836deb049b2f6d3a0b8b58df84dc776512a60f5e6` |
| `../repos/z-audit-probe/Cargo.toml` | `98751a4eee4cb4ffcc8547a13c72b81181123f601cff482faf67c9bc2411c357` |
| `../repos/z-audit-probe/src/lib.rs` | `598a77a3285bac55b54faf42d5323719970381a4bf958503d79bd4b646f39395` |
| `../repos/z-audit-probe/wit/world.wit` | `5211b5c2beed4276f776b9b0253557285db4c3b97b6dbc5fb7178e00a72eeb6f` |
| `../repos/z-audit-probe/wit/deps/host-interfaces-2.1.0/package.wit` | `2b4226da02a7a9c8f204860b606bf741e304bc1452d36251cc03ea0abd28be59` |
| `../repos/z-audit-probe/target/wasm32-wasip2/release/z_audit_probe.wasm` | `243ebb088c125e8f95c08bb8b042c1a03b155c0fb675f139a8bcb0e710cf232b` |
| `../repos/z-audit-probe/target/wasm32-wasip2/release/z_audit_probe_no_audit.wasm` | `f9de785367ad0cd62e806c22b9c574dcb48e8b5ba8a0bd09495fe3f5523326dd` |
| `../logs/agent-passport-final-verify-live-audited-20260615T0310Z.txt` | `5270a6ff8ac3c43a6617856aa0223d1446c075d95a0e911aff17a1259edd13d1` |
| `../logs/z-audit-probe-cargo-test-20260615T0310Z.txt` | `5bae00daf85cdbdda5ce7adbf96e62b440381ace5fec22f0539bfc48aade9846` |
| `../logs/z-audit-probe-wasm-build-20260615T0310Z.txt` | `222a02ed477d249a21359df8cae975864a62d848f4739cadc5b00b6190a963c6` |

## Embedded receipt hashes vs whole-file hashes

Do not label embedded receipt hashes as whole-file SHA. They are different by design: the embedded receipt hash covers the canonical receipt body before the `receiptHash` field is appended; the whole-file SHA covers the JSON file bytes on disk.

| Receipt file | Embedded `receiptHash` | Whole-file sha256 | T3 evidence status | Audit event? |
|---|---:|---:|---|---|
| `receipts/demo_allowed-allowed.json` | `sha256:317b2cab394fb1fed2430bbc9abbc47baa40dbe4dbad905ef1aa9dc8995c2552` | `62f8560b0681b8a189cd69d5e5dded21ace06c5f5bc592b0449ccd4b9f801689` | `dry-run-no-api-key` | none |
| `receipts/demo_refused_over_cap-refused.json` | `sha256:e302700e58b9996bc23bdf779efabefd2170c518e4fd39d6ceaba4d7907e472a` | `592bef0e7f0238fe00a1c5062a6e0427b9500900e3745b15d364612713402e28` | `dry-run-no-api-key` | none |
| `receipts/live_get_self_eth_address-submitted.json` | `sha256:ea56b71749d81e66211c09ef8be1de913415a343c5d352042f41fbeae129e088` | `3d961ac16dc704c6aea1d858ec0509b395dc35ed6254e7f6e3134199af92bb27` | `live-submitted` | none |
| `receipts/live_audit_probe-req-audit-20260615t030651722z-live-audited.json` | `sha256:89df2ddcf390a45745eaa6460bc7b8f94a0aec69ccfef2f92046300b37e80a03` | `137743ea9e1791aa797c4d9c4bcb10969edaba6ca8fe6f724faedbc00abd54e8` | `live-audited` | committed event |

## Live Terminal 3 evidence

### Auth / usage smoke

```text
environment: testnet
nodeUrl: https://cn-api.sg.testnet.t3n.terminal3.io
address: [PUBLIC_TESTNET_ADDRESS_REDACTED]
did: did:t3n:5c946503c2d9924f58ee273dbd2efba8d03a12df
balance.available: 20000
status: live-authenticated-only / usage-read smoke
note: raw public testnet address redacted from manifest after Council privacy pass; current SDK breadth receipt keeps wallet/address evidence hashed.
```

### Protected read smoke

```text
method: T3nClient.getSelfEthAddress
status: live-submitted
ok: true
responseHash: sha256:f175836fc46f4da7aedf17529a0bb2360eb2e90b6f449417f7865e13f7ac0287
receipt: receipts/live_get_self_eth_address-submitted.json
receiptHash: sha256:ea56b71749d81e66211c09ef8be1de913415a343c5d352042f41fbeae129e088
```

Audit read after the protected read:

```text
method: T3nClient.getAuditEvents
ok: true
batchCount: 0
committedBatchCount: 0
eventCount: 0
responseHash: sha256:d021665a487b73477a52e550b7d6ed127b2a0b93ff94a00ff49cb0595f497242
```

Therefore: this SDK read is `live-submitted`, **not** `live-audited`.

### Audited tenant-contract probe

```text
method: z:<did>:ap-audit-probe audit-ping()
contract source: ../repos/z-audit-probe
wasm: ../repos/z-audit-probe/target/wasm32-wasip2/release/z_audit_probe.wasm
wasm sha256: f2bfc503511f6ff3a5105d43e445a714a5847eeb7ff8910242485219ce749a70
contract version: 0.1.2
contract_id: 129
requestId: req-audit-20260615t030651722z
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
detailsHash: sha256:8b8e8142a39c1e7ef4ba0d24833ee2a2fd24a33069a8d83b4d81cf2b38c30da9
responseHash: sha256:9c5bdbeb5a5ee5ea89f5fbb8dc926e2c50350d699936ac8c516829dba185426a
executePayloadHash: sha256:688e6bbf903b51104a21bb23bd612b3d066d35db1ad877b96d0a5f6f328ebea1
```

## Repeatability gate

After Council verification, Archimedes named the next smallest useful experiment: repeat the same no-money/no-PII audit probe with distinct request IDs and require distinct committed audit-event IDs.

Result:

```text
total live-audited runs in repeatability set: 4
manual-version repeatability runs: 3
default CLI repair run: 1
allStatusLiveAudited: true
distinctRequestIds: 4
distinctAuditEventIds: 4
allNoMoney: true
allNoPii: true
```

Repeatability summary artifact:

```text
../logs/t3n-audit-repeatability-summary-20260615T0323Z.json
sha256:f059bf7db182263a55f8782ad91c2f9e74a5470dbefe6fff78a118fcc14b1e80
```

Repeatability receipt set:

| Request ID | Receipt whole-file sha256 | Embedded receiptHash | Audit event hash |
|---|---:|---:|---:|
| `req-audit-20260615t032117658z` | `2c4f49d9a2cedbb1b216c2ec3591006aff70197d162d70677f83d0cf7374dad7` | `sha256:d7c3b45d555e93e79b157f7db77e5e91308f03c5feeb6d3a0728cff91ec26b0d` | `sha256:5d1b5623aaa3fbc55a8f4b166e9b8ff4b69aa0ef18dd09b2abe59f1c5b41eb2e` |
| `req-audit-20260615t032125784z` | `833eb4b404dc3a1acedc29ec2bfa9ade4ac31a1080ad31b1efa9cbca402f0fa8` | `sha256:2da2cd28daa97b9ea81824b5d4d4c14fb8e496c95ed5aba6c411a4f8741c5183` | `sha256:514500d0925259255997a7c2c49e19bb5a9e081365d8144d62d3fbf3f816eed1` |
| `req-audit-20260615t032136561z` | `7ca53926b0ae1bb4ed9bbd88e55268e24092005eaa17e28e1ff3e448ca985736` | `sha256:c5c7e61da5357538dbb129de4fc15fbccad0823e0e8cae1c093d51b3cae7f38a` | `sha256:019dee496dfeb0485647b85424fdb0dfe17e73725604531eac691a5f2d9cca83` |
| `req-audit-20260615t032311691z` | `73378c1c83c74f7e4f85bda2ba1631fd1b740db7cf32addb4597cd80e823df81` | `sha256:5c59f8d8a88cb42762910deb59dd5f6f603126696259beb20703f9e10501d49c` | `sha256:c1de6c6b047922ed0f59d942edb33c7b7d54dd212d7d8cd9cda7755d4a420cac` |

Pitfall found and fixed:

```text
Fixed-tail rerun with default version 0.1.0 failed after the tail already had version 0.1.2 registered.
The CLI now defaults to a unique short tail (`ap-audit-<base36-ms>`) so `pnpm t3n:audit-probe` can be repeated without manual version override.
Fixed CLI sha256: d1b5932823db3cd34d515eec72a7b9026f935725eb57f6c21a91ed72372b50d2
```

## Delegated-consent local gate

After repeatability, the next safe build step was the human-delegation boundary **without** claiming live human authority. I added a local delegation grant scaffold that can be required by `decideProtectedAction` before payload construction.

What this proves:

```text
- protected actions can require an explicit delegation grant;
- missing grants refuse before a T3 execute payload exists;
- grants are bound to passport issuer, agent DID, action, target, amount cap, currency, PII mode, nonce, expiry, and opaque human/evidence hashes;
- revoked grants and replayed nonces refuse before payload;
- receipts bind delegation grant id/hash/evidence hash/nonce hash without raw human identity.
```

What this still does **not** prove:

```text
- live human signature ceremony;
- production identity proofing;
- legal delegated authority;
- real payment/action movement;
- raw PII handling.
```

Delegation gate summary:

```text
../logs/delegation-gate-summary-20260615T0337Z.json
sha256:5fd708538a192ffa800c85487ea0502a08c2fda82ba476161fef6364a123c006
```

Delegation code/tests:

| Artifact | Whole-file sha256 |
|---|---:|
| `src/delegation.ts` | `4acbd5f76a0219db6c74f63e4257f8061c7a763b2e3c266fe7c2b24a0b672dd5` |
| `src/protected-action.ts` | `1d0c5eb2422a58da7bac7ade627453754ffd571f60c26f216046b1866bc29a32` |
| `src/receipt.ts` | `2c555175359fb6762c7a5aa91de10283d94cf59e836034766f1b02c0b415e695` |
| `src/demo.ts` | `53b9fe9c16f1fd6ce3796b690524c752c38aed476698216439782b01255886e7` |
| `tests/delegation.test.ts` | `893ac4ac363fd648987af55e8e46672f117e248cd4ad33dc4826e8905bf401d6` |
| `tests/demo.test.ts` | `bfde11bbfbcefcc576406dacf9397a0a696ff39b873e1b41e5ead720559d142a` |

Delegation receipts:

| Receipt | Whole-file sha256 | Embedded receiptHash | Result |
|---|---:|---:|---|
| `receipts/demo_delegated_missing_grant-refused.json` | `42e47c9d64eaa4d24f249a1f5f946dbc02228bc266204a4fa5c2afe8f7d19715` | `sha256:89cb6c2bc14d7519c83db961e0a00452793a5b2df9557e5664c1d43c44ad5076` | refused: delegation grant required |
| `receipts/demo_delegated_allowed-allowed.json` | `2bab2db82112f8580cbe2d13b2a1c76634fa42de17bba33598414ea82530b30b` | `sha256:d19fe3717846a5c2a41ab059a50dcbfc5dfb300a0395a37194acf1036b31e906` | allowed: in-scope with grant |

Allowed delegation receipt binds:

```text
grantId: deleg_f7baae10eef76ecdf881c7f5e7496f72
grantHash: sha256:8d6a76206461fb42039c07d9c8249df8b79c1e35100734c43414755221029175
humanRefHash: sha256:6718ba5c24a11369a88690b26827fe5f9eefc0f740cfa334f329191ad4ad9524
evidenceHash: sha256:cb1c4819bd68669fa86e6f3447a614ef6302fc9099b3c278b9ed5d7101864ed0
nonceHash: sha256:5efeb27d240078bfa4d924704eba6c408c8500ff0f5988f5b4637a7874d1f7e9
containsRawEmail: false
```

## Signed delegated-consent ceremony

The next gate adds an actual cryptographic consent signature ceremony over the delegation challenge. This is still local/testnet-adjacent: it proves signature mechanics and receipt binding, **not** legal/production identity proofing.

What this proves:

```text
- canonical delegation challenge is built from issuer DID, agent DID, action/target scope, amount cap, PII mode, nonce, expiry, opaque humanRefHash, and evidenceHash;
- an Ed25519 key signs that exact challenge;
- tampered challenge verification fails;
- signed-grant enforcement refuses unsigned grants when requireSignedDelegationGrant=true;
- signed grant allows payload creation and injects delegation_consent_signature_hash/challenge_hash;
- receipt binds consentChallengeHash, consentSignatureHash, and publicKeyFingerprint;
- private key is not persisted; raw human identity is not included.
```

Signed ceremony summary:

```text
../logs/signed-consent-summary-20260615T0354Z.json
sha256:eebe390c91a306004a795a37654078259dceda1dbb469411c9940f775c0392d9
```

Signed ceremony artifacts:

| Artifact | Whole-file sha256 |
|---|---:|
| `src/consent.ts` | `4ceb9e7439dfe9cb0d0ae062b53575f08c91adff6e4e73137418cb7f4dcc525f` |
| `src/cli/consent-ceremony.ts` | `6169a4715c8cc783c9227578ff339d527a8930466343a5fc344150417e35dd06` |
| `tests/consent.test.ts` | `d7c2630307e08dcf3f02d32d908abd1f227aa46931a193a5ac9af77cda928f68` |
| `package.json` | `26ed1579df98d53be1c604aa685ab25dc738c0f62ac973d7c0de60eb859c2665` |
| `receipts/demo_signed_delegation-20260615t035401682z-allowed.json` | `e2f27b0be9c217e94f64b1488f6e8e10213f6e68cda162a061e378ae58b2a24d` |
| `logs/signed-consent-ceremony-20260615t035401682z.json` | `8f39a2c629cadb365ae20f3b1dab7f360db6775cc8656a2bad5337d4465fabdf` |

Signed receipt binds:

```text
receiptHash: sha256:2a6cc058b2bf4bffbf7d4f69470028988933a38ac173257f92447acc8d17ad1f
grantId: deleg_8cfd1c253daacb160382817d966872f7
grantHash: sha256:01823feb41807f6748fab34ca06e40d4774f531cd45f22524380b59a8e9a66ff
humanRefHash: sha256:423487c3d1c85e444c6c1252dcb58ae5da1b6245026f636c7de6966370b6c0b6
evidenceHash: sha256:aae877a7bb82fa33920414f89bb1b6a8852cc596b611d7f1d8092db3dedf0e4b
nonceHash: sha256:fd427731fa79abae71e3ce0af34be2ad51a77a11e61d8f6346250780a4d365aa
consentChallengeHash: sha256:702bbb16eabf570f28735e2b497e579e5f03057685f8c0585a1eebf1947e250e
consentSignatureHash: sha256:f1a0bbd62892a37f9c1e9633bc488cb4f61ef6634b361931471c6f81a8cd4eda
publicKeyFingerprint: sha256:371eb6b2ecfaca46ffbe9f969352b2040b3789c64f22af361808494065d99d15
signatureVerified: true
privateKeyPersisted: false
rawHumanIdentityIncluded: false
containsPrivateKeyText: false
containsRawEmail: false
```

## Consent policy source-of-truth anchor scaffold

The next gate after local signature mechanics is a policy source-of-truth anchor. This still does **not** prove legal authority or production identity proofing; it proves a fail-closed policy anchor can be required before payload creation and bound into receipts.

What this proves:

```text
- policy source document has a stable source hash;
- policy anchor records policyId/version/sourceUri/sourceHash, issuer DIDs, scope, caps, PII mode, requiresSignedConsent, requiresAudit;
- requireConsentPolicyAnchor=true refuses before payload when missing;
- revoked policy IDs and over-cap policies refuse before payload;
- active matching policy + signed grant allows payload and injects consent_policy_id/hash/source_hash;
- receipt binds policy id/hash/version/source URI/source hash and requirements without raw policy text.
```

Policy anchor summary:

```text
../logs/policy-anchor-summary-20260615T0410Z.json
sha256:7b8e6b82b25bb31734a70aa7295feae1b348c14e42661ead890f82af9e127fb0
```

Policy anchor artifacts:

| Artifact | Whole-file sha256 |
|---|---:|
| `policies/agent-passport-consent-policy-v0.1.json` | `89310ff9542391fa6d1e621e618d26be65bd027f43acb748361398cc4d8a3696` |
| `src/policy.ts` | `0bae2eec263fe74150dcf772d6a14eb706d4dac01d73ea762ce8fe152379fb80` |
| `src/protected-action.ts` | `c9a644edad91255075f03e6d6b7d958ee1d513a7a363a2cb6c203714b425f179` |
| `src/receipt.ts` | `8d5dba7fb30654141586edc01faa61c2d9cf0d7ae8e948f1fe4a9ab06d296375` |
| `src/cli/policy-anchor-demo.ts` | `ae965ef262e66189771fe171971d7feec03bbd653366081cb446d0679c416ef7` |
| `tests/policy.test.ts` | `c2007dfc6f3e1794949917ebc50db9ec48ac7f8724baa446339d79bf9d234f8e` |
| `package.json` | `10ddaa6ec7f13c911ceec630a4c323dacf877b70a6a60829c4b50cc9352f40f7` |

Policy anchor receipts/log:

| Artifact | Whole-file sha256 | Embedded receiptHash | Result |
|---|---:|---:|---|
| `receipts/demo_policy_anchor_missing-20260615t040834535z-refused.json` | `93ab8644702129bb0b09f21834a3c500e5ca822adb66d7bf5ea2244fdb4d3efb` | `sha256:800828a6edb0319478984fb06b179fa7f47c8c9838e306b6afc90727c92893ce` | refused: consent policy anchor required |
| `receipts/demo_policy_anchor-20260615t040834535z-allowed.json` | `2b7f326be782974cac4858c7833efbe77993f3c36b0f36d5f83fee9d862d6d13` | `sha256:0ea93675ab7f509adb512147dd56ea20cab3eed5f4fd56580f5130ed2a93fbc4` | allowed: signed grant + policy anchor |
| `logs/policy-anchor-ceremony-20260615t040834535z.json` | `8446860540e887f5eeae657f08fa926e1ee4be195395f84b1d513a0cd5192a49` | n/a | policy anchor public log |

Allowed policy receipt binds:

```text
policyId: policy-agent-passport-demo-v0.1
policyHash: sha256:5cd0d6646c6a094e9f8d26826e05e645702e81c6c393ed5983f385f72a027094
sourceUri: file://policies/agent-passport-consent-policy-v0.1.json
sourceHash: sha256:cc364995d1a687caa1d0cde1af6a3096dfffc633584a23fd684b3c29d766ef2b
requiresSignedConsent: true
requiresAudit: true
requestId: req-policy-anchor-20260615t040834535z
grantId: deleg_c2c4d2a97fdd3d74edb7b0c6a266c1e4
consentSignatureHash: sha256:f668b4492eaea998c382afe7179d1a0946f801cfc14dd7b12a1754373a1cb46d
signatureVerified: true
privateKeyPersisted: false
rawHumanIdentityIncluded: false
rawPolicyTextInReceipt: false
containsPrivateKeyText: false
containsRawEmail: false
```

## Governance witness scaffold

The next gate after policy anchoring is a governance-witness scaffold. This still does **not** prove external governance or legal authority; it proves a required, separately signed witness attestation over the policy hash, signed grant, and request scope can fail closed before payload creation and be bound into receipts.

What this proves:

```text
- governance witness challenge covers witness ID/role, policy hash/source hash, grant hash, consent signature hash, and request hash;
- witness attestation is Ed25519-signed and verifies against the exact challenge;
- tampered request scope fails verification;
- requireGovernanceWitness=true refuses before payload when missing;
- revoked or request-mismatched witness attestations refuse before payload;
- matching signed grant + policy anchor + witness allows payload and injects governance_witness_id/attestation_hash/signature_hash;
- receipt binds witness id/role, attestation hash, challenge hash, signature hash, and public key fingerprint.
```

Governance witness summary:

```text
../logs/governance-witness-summary-20260615T0430Z.json
sha256:fb3aa68c2c25c49068382f83225158781adcd2dde9bb1b6827527548ec026089
```

Governance witness artifacts:

| Artifact | Whole-file sha256 |
|---|---:|
| `src/governance.ts` | `271725c9ceca405c1da0b5ad53fe486849a1eecb10ebdf2a757e2adc74a27b42` |
| `src/protected-action.ts` | `418f86ccb393ee38c29773e92e7ab8b329b77521f8bc48ff476798dc7eddb689` |
| `src/receipt.ts` | `0ccbf6c00002c90711bed1dc39c585f9f2a3b53f36f8ea64c1d4ef97d5a4c678` |
| `src/cli/governance-witness-demo.ts` | `d2a5e0e0cafc43ca47c0254a939f45226f0bf05ef84d467bd842e4024c099394` |
| `tests/governance.test.ts` | `da8e41bbb21ad65b9b5579e27c8701669cbe0ea2ed1533579a31578e418fb9d6` |
| `package.json` | `9c032abd2cd5d0c3d65b84a876a53ec0e002d42b98adf7583fe5d51fbf5937bb` |

Governance witness receipts/log:

| Artifact | Whole-file sha256 | Embedded receiptHash | Result |
|---|---:|---:|---|
| `receipts/demo_governance_witness_missing-20260615t042857030z-refused.json` | `ddfa256384f0035620059aae3b2a841645d2aedcf3bc64a53340457556a59cf1` | `sha256:21a9ff1799fd84c808a1d33b6a01b3edad6fe388f467ae8822f1cdbc6b1ee2c7` | refused: governance witness required |
| `receipts/demo_governance_witness-20260615t042857030z-allowed.json` | `9725b48ce30c0f653903ba7620acb6a52a86968abbd2e80474649585f5c9975b` | `sha256:4721c459ec7142c686582b1f0881eb2aeff09da7a90c6a57a0f3995a1bea8cc3` | allowed: signed grant + policy anchor + governance witness |
| `logs/governance-witness-ceremony-20260615t042857030z.json` | `d5238190283f73956c086d9922e6454614c00bf73b1a35ad7c5cebecb57e0d2b` | n/a | governance witness public log |

Allowed governance witness receipt binds:

```text
witnessId: witness-local-governance-demo-1
witnessRole: policy-governance-witness
attestationHash: sha256:eb4b4f18925d96e0bb5e5f44e17555478550aa76ee901391f61a38eafc89b98a
challengeHash: sha256:e7e26c49a11a90786b1f2cf0e819dab95cf60b6ee78c5ed1e79d0061c5ac8b3d
signatureHash: sha256:6e9effea6281d86e449b0a9ae134a2583704b7b6bf0ac6211b13e03fd68803fc
publicKeyFingerprint: sha256:3c98591f49ebd0744eef4b080694074d1d32d20bc7cc2a99452a12fff801ad24
witnessVerified: true
privateKeysPersisted: false
rawHumanIdentityIncluded: false
realExternalGovernanceClaimed: false
containsPrivateKeyText: false
containsRawEmail: false
```

## External audit registry anchor scaffold

The next gate after the local governance-witness scaffold is an external audit-registry anchor. This is deliberately narrower than "external governance solved": it imports a committed Terminal 3 testnet audit event as an external host-stamped registry record and requires a local anchor binding that record to the policy, signed grant, governance witness, and request subject before payload creation.

What this proves:

```text
- buildExternalRegistrySubject binds policyHash/sourceHash, grantHash, consentSignatureHash, governanceWitness attestation/signature hashes, and requestHash;
- buildExternalRegistryAnchor requires Terminal 3 evidence status live-audited, auditEventCommitted=true, auditEventId, and auditEventHash;
- requireExternalRegistryAnchor=true refuses before payload when missing;
- request-mismatched external registry anchors refuse before payload;
- matching signed grant + policy anchor + governance witness + external registry anchor allows payload;
- receipt binds registryId, registryKind, registryUrl, registryRecordId, registryRecordHash, subjectHash, and anchorHash;
- public logs mark realExternalGovernanceClaimed=false.
```

External registry live audit record:

| Artifact | Whole-file sha256 | Embedded receiptHash | Result |
|---|---:|---:|---|
| `receipts/live_audit_probe-req-audit-20260615t051314496z-live-audited.json` | `ce6f38fbaaed85bcb0819e75b2b114c0e0eb85261943ffba5b10cf9805b7d873` | `sha256:4324628f9927999ae8a2c4ca322cfbbec9c90c6c045cfda348e87869286ee152` | live-audited external registry anchor probe |
| `logs/t3n-live-audit-probe-20260615t051314496z.json` | `fcf2395b0496a0ae7c02eeb271d36d5a6c7458ac3a310c8e0852c8807a4dd7e5` | n/a | live T3N audit log |

External registry anchor artifacts:

| Artifact | Whole-file sha256 |
|---|---:|
| `src/registry.ts` | `4d24cae2a00a91fe647f8a99e0dac11727f576b791eede845ed137e74f94b876` |
| `src/protected-action.ts` | `dcc1df90ec3ba9665fbad4600e22937a7a32afc8b9f51dcf93feb44d752fb022` |
| `src/receipt.ts` | `d60918683340df0d5bedb9d52491e6ea64148053d5152fbb5a0014e184e75973` |
| `src/cli/external-registry-anchor-demo.ts` | `410957f80767e4df50bd845deb4137016c6f548f1861fe3c5cf6fb9e90d5f35f` |
| `src/cli/live-audit-probe.ts` | `369c5e9179353019ca85d29f81fd9492d00f2ceb1d3773ae9f0059313f39de56` |
| `tests/registry.test.ts` | `44c9d50e8c00ada009c3a8e8e67fe90e582a51010b0c56b9596cdde56a5becff` |
| `package.json` | `aa25557f5faaf84be934239c8a938bcedf64e613f96aa4e3bb2147791daed48f` |
| `../repos/z-audit-probe/src/lib.rs` | `598a77a3285bac55b54faf42d5323719970381a4bf958503d79bd4b646f39395` |
| `../repos/z-audit-probe/target/wasm32-wasip2/release/z_audit_probe.wasm` | `243ebb088c125e8f95c08bb8b042c1a03b155c0fb675f139a8bcb0e710cf232b` |

External registry receipts/log:

| Artifact | Whole-file sha256 | Embedded receiptHash | Result |
|---|---:|---:|---|
| `receipts/demo_external_registry_missing-20260615t051347500z-refused.json` | `d30b5e11a0a5ef59490df0d6fa0da11872180e35b4d6e4c481ea84fe60074c50` | `sha256:c30efe7fe541fe53e48a51944e18f5baa814b313512fbabb2792b82e270c2392` | refused: external registry anchor required |
| `receipts/demo_external_registry_anchor-20260615t051347500z-allowed.json` | `1576803b4755fc849df250797fdd5311812cbffa163dd6010f65d3a4f93bd63e` | `sha256:289a6cdfc6dbeb3dc239885775949048e875aeb3a540c7f5cc2a96d02078d6df` | allowed: signed grant + policy + governance witness + external registry anchor |
| `logs/external-registry-anchor-20260615t051347500z.json` | `460401db615f048aa9c1d90fb492216d7f603e0b6f0d9b92f8b83fccff6a9d6e` | n/a | external registry anchor public log |

Allowed external registry receipt binds:

```text
registryKind: terminal3-testnet-audit
registryUrl: https://cn-api.sg.testnet.t3n.terminal3.io
registryRecordHash: sha256:725f9534923c4453a86f0caa8de8459b786cb1ad6e83845babe469f665c6c2ed
subjectHash: sha256:b5ec16b0034deebc1c065b3b083315c245a8fb1f6a987e6a46fcf57110169bc6
anchorHash: sha256:b5268af8d119dda8852514b29efd653960a5361d450d344fd56d1947c6787e15
externalRegistryRecordLiveAudited: true
privateKeysPersisted: false
rawHumanIdentityIncluded: false
realExternalGovernanceClaimed: false
```

## Verification log

Latest build-track verification:

```text
pnpm verify
- 11 test files passed
- 45 tests passed
- typecheck passed
- build passed
- local demo wrote allowed/refused + delegated-consent receipts

pnpm consent:demo
- signed consent challenge created
- Ed25519 signature verified
- signed grant accepted
- receipt written

pnpm policy:demo
- missing policy anchor refused before payload
- active policy anchor + signed grant allowed
- policy id/hash/source hash bound into receipt

pnpm governance:demo
- missing governance witness refused before payload
- policy + signed grant + witness allowed
- witness id/challenge/signature/attestation hashes bound into receipt

pnpm registry:demo
- imported committed Terminal 3 testnet audit event as external registry record
- missing external registry anchor refused before payload
- policy + signed grant + governance witness + external registry anchor allowed
- registry id/kind/url/record hash/subject hash/anchor hash bound into receipt
```

Contract verification:

```text
cargo test --manifest-path ../repos/z-audit-probe/Cargo.toml
- 1 unit test passed
- 1 doctest passed

cargo build --manifest-path ../repos/z-audit-probe/Cargo.toml --target wasm32-wasip2 --release
- passed

wasm-tools validate ../repos/z-audit-probe/target/wasm32-wasip2/release/z_audit_probe.wasm
- passed
```

Log files:

```text
../logs/agent-passport-final-verify-live-audited-20260615T0310Z.txt
sha256:5270a6ff8ac3c43a6617856aa0223d1446c075d95a0e911aff17a1259edd13d1

../logs/agent-passport-repeatability-verify-20260615T0324Z.txt
sha256:54d43e0d9238110f555289a97889024ef80152e20260d9c1d0f31f48b922fd06

../logs/agent-passport-delegation-verify-20260615T0336Z.txt
sha256:e85b86be5e7ef311a230d3e24b80ac6b5193833bca2c157ce31daf4e83e9bf19

../logs/agent-passport-signed-consent-verify-20260615T0354Z.txt
sha256:313fde6f1cf9322c47a727363ce83a08a8458c57ebe2c19ecda51125f076dcab

../logs/agent-passport-signed-consent-cli-20260615T0354Z.txt
sha256:de8e3d3c7e6b0395a4f9545dd5393efce606fb5decb2d9875e005260be3a3feb

../logs/agent-passport-policy-anchor-verify-20260615T0410Z.txt
sha256:b547cbf463096bde165feb8e83ef7a489f4b7ef2a2ea328b3ef06e3e6c47ad12

../logs/agent-passport-policy-anchor-cli-20260615T0410Z.txt
sha256:999585d43bbf28c5eca12c6c59d588da387886fe0dd749c03bf0ce263d2e9422

../logs/agent-passport-governance-witness-verify-20260615T0430Z.txt
sha256:7a740f41ae6d0342338092126480778bdab7d152f8cd92ebe86e0a412f1e4001

../logs/agent-passport-governance-witness-cli-20260615T0430Z.txt
sha256:6812d4fe734dbd30ee478a7a967da893ac1f0cac0e65c9cc83540ef3cb4da820

../logs/agent-passport-external-registry-verify-20260615T0514Z.txt
sha256:89123db2766b58232b3f8247dac4a8edd4a75ea9bbb861069abaf4c7bd95b1a0

../logs/agent-passport-external-registry-demo-20260615T0514Z.txt
sha256:208891e1d5c1272d88dfb296c7e0287fbbbe5d8742e74e5e73989f836a55f33d

../logs/z-audit-probe-cargo-test-20260615T0310Z.txt
sha256:5bae00daf85cdbdda5ce7adbf96e62b440381ace5fec22f0539bfc48aade9846

../logs/z-audit-probe-repeatability-cargo-test-20260615T0324Z.txt
sha256:4cbbad6b460bd7e5beaa725eb2a880e3442d71a0c28f4ac74332dbe1f204b20e

../logs/z-audit-probe-delegation-cargo-test-20260615T0337Z.txt
sha256:9213e35abbe0813f726afcb24dffd8f64682f78ba37d9baf6e767c98465b1670

../logs/z-audit-probe-signed-consent-cargo-test-20260615T0354Z.txt
sha256:0dcbf29f0e2c999249118a99852d9ef5e8ad7e101f8c1310cbcab89bcff52cc1

../logs/z-audit-probe-policy-anchor-cargo-test-20260615T0410Z.txt
sha256:4cbbad6b460bd7e5beaa725eb2a880e3442d71a0c28f4ac74332dbe1f204b20e

../logs/z-audit-probe-governance-witness-cargo-test-20260615T0430Z.txt
sha256:4cbbad6b460bd7e5beaa725eb2a880e3442d71a0c28f4ac74332dbe1f204b20e

../logs/z-audit-probe-cargo-test-external-registry-20260615T0514Z.txt
sha256:0e2f1ac00dd1dac6e7213a70a7abbbee5f5fab34621a4a32f4b7cb1349f218dd

../logs/z-audit-probe-wasm-build-20260615T0310Z.txt
sha256:222a02ed477d249a21359df8cae975864a62d848f4739cadc5b00b6190a963c6

../logs/z-audit-probe-repeatability-wasm-build-20260615T0324Z.txt
sha256:222a02ed477d249a21359df8cae975864a62d848f4739cadc5b00b6190a963c6

../logs/z-audit-probe-delegation-wasm-build-20260615T0337Z.txt
sha256:222a02ed477d249a21359df8cae975864a62d848f4739cadc5b00b6190a963c6

../logs/z-audit-probe-signed-consent-wasm-build-20260615T0354Z.txt
sha256:222a02ed477d249a21359df8cae975864a62d848f4739cadc5b00b6190a963c6

../logs/z-audit-probe-policy-anchor-wasm-build-20260615T0410Z.txt
sha256:222a02ed477d249a21359df8cae975864a62d848f4739cadc5b00b6190a963c6

../logs/z-audit-probe-governance-witness-wasm-build-20260615T0430Z.txt
sha256:222a02ed477d249a21359df8cae975864a62d848f4739cadc5b00b6190a963c6

../logs/z-audit-probe-wasm-build-external-registry-20260615T0514Z.txt
sha256:222a02ed477d249a21359df8cae975864a62d848f4739cadc5b00b6190a963c6

../logs/z-audit-probe-wasm-validate-external-registry-20260615T0514Z.txt
sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
```

## Bounded bounty extraction — 2026-06-15T15:38:21Z

After the external audit registry anchor scaffold, the next build-track gate remained recognized external governance authority / human identity proofing. Since that cannot be honestly crossed by another local scaffold, bounded bounty copy was extracted with BUILD_SPLIT caveats preserved.

## Final Council optimization — 2026-06-15T16:06:21Z

Five concrete Council seats reviewed the bounded packet under run token `T3_BOUNTY_FINAL_REVIEW_20260615T160621Z`.

| Seat | Discord message ID | Verdict | Result |
|---|---:|---|---|
| Humboldt | `1516112227818672280` | `REVISE_COPY_ONLY` | tightened Design Partner line |
| Sextus Empiricus | `1516112313323884728` | `REVISE_COPY_ONLY` | tightened audited-scope wording |
| Archimedes | `1516112415278891038` | `READY_TO_SUBMIT` | no technical patch; hash hygiene |
| Kallimachos | `1516112428797001949` | `REVISE_COPY_ONLY` | bundle-relative commands; hash hygiene |
| Philo | `1516112429422088386` | `REVISE_COPY_ONLY` | removed regulated-institution readiness overreach |

Decision:

```text
BLOCK count: 0
READY_TO_SUBMIT count: 1
REVISE_COPY_ONLY count: 4
Final action: copy-only patches, refresh hashes/bundle, verify, ready for human submission.
```

Final submission artifacts:

| Artifact | Whole-file sha256 | Purpose |
|---|---:|---|
| `../SUBMISSION_PACKET.md` | `e21f26725f521a8bd54cf67ed1ac1a5de90dc8dd3b37b35207aa35964af17366` | bounded bounty narrative + evidence, audited-scope tightened |
| `../SUBMISSION_FORM_FIELDS.md` | `2c83dfbf6851de13d6d06c8fa9962d6ffd082c228095108c5037543a4b16b20a` | paste-ready DoraHacks-style answers, bundle-relative commands |
| `../DEVREL_REPORT.md` | `5e25640ed7435e094230d5a0ff34af3f96bb24d72d4f976033e43e4095d85684` | developer-experience / docs-gap report |
| `README.md` | `2f20db2e16d5d09c16d275f777fdadbaec869584fe1e4eebbab0d72b0b610863` | app README, bundle-relative commands and current test counts |
| `../BOUNTY_COUNCIL_FINAL_REVIEW_PACKET.md` | `29f8e5dcf313bcd45a5e35222d092a5ce9f383c98abcc48a8b98b07b2ecaa754` | five-seat Council review packet |
| `../BOUNTY_COUNCIL_FINAL_SYNTHESIS.md` | `0d4e2f346a122be0dd6c0b0b6ba389d234d7b4e367b36767fe727b69ba04bc1f` | final Council synthesis / decision record |
| `../submission-bundles/terminal3-agent-passport-submission-<final-stamp>.tar.gz` | `see final delivery receipt` | sanitized source/docs/receipts/logs bundle; final hash computed after this manifest to avoid self-reference |

Final post-Council verification logs:

| Log | Whole-file sha256 |
|---|---:|
| `../logs/final-council-patched-verify-20260615T161518Z.txt` | `8d0c446fa0b1ee3ee52118e8a01d726565e8fc300def1317f1b656e771d328d3` |
| `../logs/final-council-patched-registry-demo-20260615T161518Z.txt` | `c500f27f4b998043d461a850f1de204b95a5f970847dffd0657dca4859262164` |
| `../logs/final-council-patched-z-audit-cargo-test-20260615T161518Z.txt` | `6bb7eef0631dfe3fba4afb667f598da503f37481a08d109fa2e08866d0b79536` |
| `../logs/final-council-patched-z-audit-wasm-build-20260615T161518Z.txt` | `079cf400184df7a7c856688cc618651a67309861be7a86177cd322cacfd1863f` |
| `../logs/final-council-patched-z-audit-wasm-validate-20260615T161518Z.txt` | `7cd0d109c9e3daea15ded92c6960ce97b9c88fa75d69f8930aa78efeee817898` |

Final verification:

```text
pnpm verify: 11 test files / 45 tests passed; typecheck passed; build passed; local demo wrote receipts.
pnpm registry:demo: missing external registry anchor refused before payload; policy + signed grant + governance witness + external registry anchor allowed.
cargo test: 1 unit test + 1 doctest passed.
cargo build wasm32-wasip2: passed.
wasm-tools validate: passed.
```

Final registry demo receipts from post-Council run:

```text
missing anchor refused:
receipts/demo_external_registry_missing-20260615t161524072z-refused.json
whole-file sha256:14430b12ef8a723d9d6260c730085b9ededd2d96e842bae4e3482198b99c30c0
receiptHash:sha256:419dc3aeec2795fbe83ec965ff16a82501d33cbd7d6cc3d9e7db7cd451b1ce59

allowed with anchor:
receipts/demo_external_registry_anchor-20260615t161524072z-allowed.json
whole-file sha256:845ac761b0f748b3199664c0ff4fba758c6ccb4cb487a0658219a17f32eb4c67
receiptHash:sha256:464226c89f3e01396cbb4a393421db77cb645e4c36d0914234f20057b237783c
subjectHash:sha256:7987f0fa6a0990a2cefa7dfe11c11414066d25a4ab1d817d0639255dac4f560c
anchorHash:sha256:811e44ab1d3c5df80ff2c245e4cbde0e4059b7116f9e9d6b3f0af79d9608e4c1
realExternalGovernanceClaimed:false
```

## Claim boundary

Safe current claim:

```text
Terminal 3 testnet auth works; local scoped/refusal receipts work; issuer allow-list and revocation regressions fail closed; one no-money/no-PII Terminal 3 protected read reached live-submitted; one no-money/no-PII Terminal 3 tenant-contract invocation emitted a committed host-stamped audit event and produced a live-audited Agent Passport receipt; the repeatability gate has 4/4 live-audited no-money/no-PII runs with distinct request IDs and distinct audit event IDs; the local delegated-consent gate requires an explicit opaque-hash grant before selected payloads can be created; the signed delegated-consent ceremony verifies an Ed25519 signature over a canonical challenge and binds challenge/signature/fingerprint hashes into the receipt without raw human identity or persisted private key; the policy anchor scaffold requires a hashed policy source-of-truth before payload creation and binds policy id/hash/source hash into receipts; the governance witness scaffold requires a separately signed witness attestation over policy, signed grant, and request scope before payload creation and binds witness hashes into receipts; and the external audit registry anchor scaffold imports a committed Terminal 3 testnet audit event as a host-stamped registry record, requires an anchor over policy + signed grant + governance witness + request subject, refuses before payload when missing/mismatched, and binds registry id/kind/url/record hash/subject hash/anchor hash into receipts.
```

Unsafe current claim:

```text
Do not claim delegated human authority is solved, live human signature/identity proofing is complete, external governance or legal authority is solved, production trust is complete, real payment/action flow is proved, raw PII flow is proved, or bounty copy can omit BUILD_SPLIT caveats.
```

# Terminal 3 ADK bounty — final Council re-rate packet

**Run token:** `T3_BOUNTY_MAX_LOOP_20260615T171622Z`  
**Packet stamp:** `20260615T1750Z`  
**Question:** Is this now `READY_MAX_SUBMIT`, `REVISE_COPY_ONLY`, or `BLOCK`?

## What changed after the prior ready packet

Built and verified a real Terminal-3-native safe-egress extension, not another local governance scaffold:

```text
Terminal 3 user grant / allowed host / http-with-placeholders / egress-denial proof
no money movement
no raw PII returned
testnet only
```

## Final curated bundle

```text
path: submission-bundles/terminal3-agent-passport-submission-max-curated-20260615T1750Z.tar.gz
sha256: 82c4096af0730656e722b7e283716e6cfc3f5a3ac3dc6dcafaa86e6726638319
size_bytes: 287663
member_count: 96
scan: forbidden_path_hits=[], old_failed_live_receipts=[], secret_assignment_hits=[], private_key_pem_hits=[]
```

## Verification

```text
pnpm verify: 12 test files / 50 tests passed; typecheck passed; build passed; local demo wrote receipts.
pnpm registry:demo: missing external registry anchor refused; matched policy+grant+witness+registry anchor allowed.
z-audit-probe: cargo test/build/wasm validate passed.
z-safe-egress-demo: cargo test/build/wasm validate passed.
pnpm t3n:safe-egress: ok=true; evidenceBoundary.ok=true.
```

## New live safe-egress proof

```text
log: agent-passport-protected-actions/logs/t3n-safe-egress-20260615t173901793z.json
log sha256: e2cec7df3a7e221ed2c22a7e69f519fec4edf6050768c203b45a02ee2caada5f
wasm sha256: 224ce92c892d9b2262639fd5ba5fe00ff9a33811b5c202cb878d72c9f2f4de79
```

Edges:

```text
1. Before grant: egress denied for host httpbin.org.
   receipt sha256: f6dd3c5b3579e94a1cdf62e7e4c2cfb2d74caadbfc8e36daf4b65cb13e8971b8
2. Placeholder denial: missing synthetic field only; no raw PII returned.
   receipt sha256: 016190feed620bfc75492f4892adaed8c18d61d1077a46248b9c7be9a591e8e7
3. After self-grant: allowed host succeeds; live-audited receipt binds committed T3 audit event.
   receipt sha256: efb8351dd81192ceb7efaa3b758e2c567572b7dc049a15ff3d6265eaa1aa4618
   auditEventHash: sha256:1874bc2bc4906048d641e66521dc5c014b7715794e350a4d660133ac23e57ce0
```

## Updated judge-facing docs

```text
SUBMISSION_PACKET.md sha256: dec55fb4104bd57d799153d86d50f7aa2cf3dbd25ada62f6ab9336fec94017ce
SUBMISSION_FORM_FIELDS.md sha256: 944e143850dc4b65771c6f5e156e395977f9e2e34f87667e68e8bfcab82cb108
EVIDENCE_MANIFEST.md sha256: 6072435ae7820c2a218c0c83071648247b492a9f6dafec618cb2016f1f98b277
README.md sha256: aca753c730ef287fd594595267edadfb0925ae96318409dc127cd6f36511045c
FINAL_MAX_SUBMISSION_RECEIPT_20260615T1750Z.md: present in submission-bundles/
```

## Claim boundary to enforce

Safe:

```text
T3 testnet; no-money/no-PII live audit events; repeatability; user-scoped http-with-placeholders egress control; receipts with hashes; local scaffolds clearly bounded.
```

Forbidden:

```text
production trust complete; KYC/human identity proofing complete; recognized legal/governance authority solved; real payment movement proved; raw PII flow proved.
```

## Council ask

Each seat: reply with exactly one of:

```text
READY_MAX_SUBMIT — no blocker; packet is top-tier-ready for human DoraHacks submission.
REVISE_COPY_ONLY — only wording/packaging tweak; name exact line/artifact.
BLOCK — evidence or safety blocker; name exact missing proof.
```

Also give one 1-line reason and one optional final tweak.

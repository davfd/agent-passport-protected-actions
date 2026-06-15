import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { makeLocalDemoReceipts } from "../demo.js";

const now = process.env.DEMO_TIMESTAMP ?? "2026-06-15T00:01:00.000Z";
const receipts = makeLocalDemoReceipts({ now, issuedAt: now });
const outDir = join(process.cwd(), "receipts");
mkdirSync(outDir, { recursive: true });

for (const receipt of receipts) {
  const suffix = receipt.decision.allowed ? "allowed" : "refused";
  const outPath = join(outDir, `${receipt.decision.requestId}-${suffix}.json`);
  writeFileSync(outPath, `${JSON.stringify(receipt, null, 2)}\n`);
  console.log(`${suffix.toUpperCase()} ${receipt.decision.reason} -> ${outPath}`);
  console.log(`receiptHash=${receipt.receiptHash}`);
}

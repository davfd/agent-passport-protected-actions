import { inspect } from "node:util";
import { liveT3nSmoke, requireT3nApiKey } from "../t3n.js";

async function main() {
  const apiKey = requireT3nApiKey();
  const result = await liveT3nSmoke(apiKey);
  console.log(inspect(result, { depth: 6, colors: false }));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

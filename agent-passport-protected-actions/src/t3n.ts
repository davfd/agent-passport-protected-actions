import { readFileSync } from "node:fs";
import { join } from "node:path";

export interface T3nSdkSurface {
  sdkVersion: string;
  getNodeUrl: (...args: unknown[]) => string;
  T3nClient: new (...args: unknown[]) => unknown;
}

export function requireT3nApiKey(env: NodeJS.ProcessEnv = process.env): string {
  const key = env.T3N_API_KEY;
  if (!key || key.trim().length === 0) {
    throw new Error("T3N_API_KEY is required for live Terminal 3 testnet calls. Claim it on the T3N sandbox page and keep it secret.");
  }
  return key;
}

export async function loadT3nSdkSurface(): Promise<T3nSdkSurface> {
  const sdk = await import("@terminal3/t3n-sdk");
  const packageJsonPath = join(process.cwd(), "node_modules", "@terminal3", "t3n-sdk", "package.json");
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8")) as { version: string };
  return {
    sdkVersion: packageJson.version,
    getNodeUrl: sdk.getNodeUrl as (...args: unknown[]) => string,
    T3nClient: sdk.T3nClient as new (...args: unknown[]) => unknown
  };
}

export async function liveT3nSmoke(apiKey: string) {
  const sdk = await import("@terminal3/t3n-sdk");
  sdk.setEnvironment("testnet");
  const wasmComponent = await sdk.loadWasmComponent();
  const address = sdk.eth_get_address(apiKey);
  const client = new sdk.T3nClient({
    wasmComponent,
    handlers: {
      EthSign: sdk.metamask_sign(address, undefined, apiKey)
    }
  });
  const handshake = await client.handshake();
  const did = await client.authenticate(sdk.createEthAuthInput(address));
  const usage = await client.getUsage({ limit: 5 });
  return {
    environment: sdk.getEnvironmentName(),
    nodeUrl: sdk.getNodeUrl(),
    address,
    handshake,
    did,
    usage
  };
}

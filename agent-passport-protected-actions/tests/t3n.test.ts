import { describe, expect, it } from "vitest";
import { loadT3nSdkSurface, requireT3nApiKey } from "../src/t3n.js";

describe("Terminal 3 SDK integration surface", () => {
  it("loads the installed @terminal3/t3n-sdk exports used by the live smoke path", async () => {
    const surface = await loadT3nSdkSurface();
    expect(surface.sdkVersion).toBe("3.5.2");
    expect(typeof surface.getNodeUrl).toBe("function");
    expect(typeof surface.T3nClient).toBe("function");
  });

  it("fails closed when T3N_API_KEY has not been provided", () => {
    expect(() => requireT3nApiKey({})).toThrow(/T3N_API_KEY/);
  });
});

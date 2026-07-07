import type { ConnectResult, DiscoveredAccount, SocialProvider, TestResult } from "./SocialProvider";
import type { ProviderReference } from "../model/types";

/*
 * ============================================================
 *  DEMO DATA — MOCK INSTAGRAM PROVIDER
 *
 *  Simulates the provider boundary for Step 1. No real Instagram
 *  or Meta API calls happen anywhere in this file.
 *
 *  Every account, id, and handle below is demo/sample data only —
 *  nothing here is permanent infrastructure. The real provider
 *  (providers/composioInstagram.ts) implements the same interface
 *  against the server-side API boundary.
 *
 *  Deterministic simulation rules (for demos and validation):
 *   - connect(): handles containing "fail" are rejected.
 *   - testConnection(): provider connection ids containing
 *     "stale" report an invalid authorization.
 * ============================================================
 */

const PROVIDER_NAME = "mock-instagram";
const SIMULATED_LATENCY_MS = 800;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function demoId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}

export const mockInstagramProvider: SocialProvider = {
  name: PROVIDER_NAME,

  async discoverAuthorizedAccounts(): Promise<DiscoveredAccount[]> {
    await delay(SIMULATED_LATENCY_MS);
    return demoSeedAccounts;
  },

  async connect(usernameHint: string): Promise<ConnectResult> {
    await delay(SIMULATED_LATENCY_MS);
    const handle = usernameHint.trim().replace(/^@/, "");
    if (!handle) {
      throw new Error("No account handle provided.");
    }
    if (handle.toLowerCase().includes("fail")) {
      throw new Error(`Simulated authorization failure for @${handle}.`);
    }
    return {
      account: {
        platform: "instagram",
        platformAccountId: demoId("ig_demo"),
        username: handle,
        displayName: `${handle} (demo)`,
      },
      provider: {
        providerName: PROVIDER_NAME,
        externalConnectionId: demoId("mockconn"),
      },
    };
  },

  async testConnection(providerRef: ProviderReference): Promise<TestResult> {
    await delay(SIMULATED_LATENCY_MS);
    const checkedAt = new Date().toISOString();
    if (providerRef.externalConnectionId.includes("stale")) {
      return {
        ok: false,
        message: "Simulated check: the provider reports this authorization is no longer valid.",
        checkedAt,
      };
    }
    return { ok: true, message: "Simulated check passed: connection is healthy.", checkedAt };
  },

  async disconnect(): Promise<void> {
    await delay(300);
  },
};

/** DEMO DATA — accounts returned by mock discovery. */
export const demoSeedAccounts: DiscoveredAccount[] = [
  {
    account: {
      platform: "instagram",
      platformAccountId: "ig_demo_001",
      username: "demo_account_one",
      displayName: "demo_account_one (demo)",
    },
    provider: { providerName: PROVIDER_NAME, externalConnectionId: "mockconn_demo_a" },
  },
  {
    account: {
      platform: "instagram",
      platformAccountId: "ig_demo_002",
      username: "factory_second_demo",
      displayName: "factory_second_demo (demo)",
    },
    // "stale" id: this seeded connection deterministically fails Test Connection,
    // so the error state can be demonstrated without typing anything.
    provider: { providerName: PROVIDER_NAME, externalConnectionId: "mockconn_stale_demo" },
  },
];

import type { DiscoveredAccount, SocialProvider, TestResult } from "./SocialProvider";
import type { ProviderReference } from "../model/types";

/**
 * Real Instagram provider backed by the app's own server-side API boundary
 * (server/), which holds the Composio API key. The browser only ever calls
 * same-origin /api routes and never receives or sends any provider secret.
 *
 * Capabilities: discovery and testing only. `connect` and `disconnect` are
 * intentionally absent — authorizing new accounts and revoking external
 * authorization are not part of this milestone, and this adapter does not
 * pretend otherwise.
 */

interface ApiAccount {
  providerName: string;
  externalConnectionId: string;
  connectionStatus: string;
  identity: { platformAccountId: string; username: string; displayName: string } | null;
  issue?: string;
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function apiError(status: number, body: unknown): Error {
  const message =
    typeof body === "object" && body !== null && typeof (body as { error?: unknown }).error === "string"
      ? (body as { error: string }).error
      : `API boundary returned HTTP ${status}`;
  return new Error(message);
}

export const composioInstagramProvider: SocialProvider = {
  name: "composio-instagram",

  async discoverAuthorizedAccounts(): Promise<DiscoveredAccount[]> {
    const response = await fetch("/api/social/instagram/accounts");
    const body = await readJson(response);
    if (!response.ok) throw apiError(response.status, body);
    const accounts = (body as { accounts: ApiAccount[] }).accounts ?? [];
    return accounts.map((item) => ({
      account: item.identity
        ? {
            platform: "instagram",
            platformAccountId: item.identity.platformAccountId,
            username: item.identity.username,
            displayName: item.identity.displayName,
          }
        : null,
      provider: {
        providerName: "composio-instagram",
        externalConnectionId: item.externalConnectionId,
      },
      ...(item.issue ? { issue: item.issue } : {}),
    }));
  },

  async testConnection(providerRef: ProviderReference): Promise<TestResult> {
    const response = await fetch(
      `/api/social/instagram/test?connectionId=${encodeURIComponent(providerRef.externalConnectionId)}`,
    );
    const body = await readJson(response);
    if (!response.ok) throw apiError(response.status, body);
    const result = body as { ok: boolean; message: string };
    return { ok: result.ok, message: result.message, checkedAt: new Date().toISOString() };
  },
};

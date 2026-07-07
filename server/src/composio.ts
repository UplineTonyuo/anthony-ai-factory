import { Composio } from "@composio/core";

/**
 * Server-side Composio integration for the Instagram read milestone.
 *
 * Secrets policy: COMPOSIO_API_KEY is read from the server process
 * environment only. Connected-account credential state (`state`, `data`,
 * `params` — which contain access tokens) is never included in anything
 * this module returns; only the safe fields below leave the server.
 */

export class ConfigurationError extends Error {}

/** The only Instagram account shape the API boundary is allowed to return. */
export interface SafeInstagramAccount {
  providerName: "composio-instagram";
  /** Composio connected-account id — a provider reference, never business identity. */
  externalConnectionId: string;
  /** Composio connection status, e.g. ACTIVE, EXPIRED, FAILED. */
  connectionStatus: string;
  identity: {
    platformAccountId: string;
    username: string;
    displayName: string;
  } | null;
  /** Honest reason when identity is null or the connection is unusable. */
  issue?: string;
}

let client: Composio | null = null;

function getClient(): Composio {
  const apiKey = process.env.COMPOSIO_API_KEY;
  if (!apiKey) {
    throw new ConfigurationError(
      "COMPOSIO_API_KEY is not configured on the server. Provide it via server/.env (see server/.env.example).",
    );
  }
  client ??= new Composio({ apiKey });
  return client;
}

function pickString(obj: unknown, keys: string[]): string | undefined {
  if (typeof obj !== "object" || obj === null) return undefined;
  const record = obj as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.length > 0) return value;
    if (typeof value === "number") return String(value);
  }
  return undefined;
}

/**
 * Extract identity fields from an identity-tool response without trusting
 * any particular shape: runtime-checked lookups over the common nesting
 * levels, never fabricated values.
 */
function extractIdentity(data: Record<string, unknown>): SafeInstagramAccount["identity"] {
  const layers = [data, data["data"], data["response_data"], data["user"]];
  for (const layer of layers) {
    const username = pickString(layer, ["username"]);
    if (username) {
      return {
        username,
        platformAccountId: pickString(layer, ["user_id", "id", "ig_id"]) ?? "",
        displayName: pickString(layer, ["name"]) ?? username,
      };
    }
  }
  return null;
}

/**
 * Flatten an error's cause chain into a safe diagnostic string. The SDK wraps
 * execution failures as "Error executing the tool <slug>" and hides the real
 * reason in `cause` (often an API error body with message/code) — surface it,
 * capped in length, values only from error messages (never credential state).
 */
function describeError(e: unknown): string {
  const parts: string[] = [];
  let current: unknown = e;
  let depth = 0;
  while (current instanceof Error && depth < 4) {
    parts.push(current.message);
    const body = (current as { error?: { error?: { message?: string; code?: number; suggested_fix?: string } } })
      .error;
    const apiError = body?.error;
    if (apiError?.message) {
      parts.push(`api: ${apiError.message}${apiError.code !== undefined ? ` (code ${apiError.code})` : ""}`);
      if (apiError.suggested_fix) parts.push(`suggested fix: ${apiError.suggested_fix}`);
    }
    current = (current as { cause?: unknown }).cause;
    depth += 1;
  }
  if (typeof current === "string" && current) parts.push(current);
  return [...new Set(parts)].join(" — ").slice(0, 400);
}

async function resolveIdentity(
  composio: Composio,
  connectedAccountId: string,
  userId: string,
): Promise<{ identity: SafeInstagramAccount["identity"]; issue?: string }> {
  const slug = process.env.COMPOSIO_INSTAGRAM_IDENTITY_TOOL;
  if (!slug) {
    return {
      identity: null,
      issue:
        "Identity tool not configured: set COMPOSIO_INSTAGRAM_IDENTITY_TOOL to the Composio tool slug verified for the Instagram identity read.",
    };
  }
  try {
    const result = await composio.getClient().tools.execute(slug, {
  connected_account_id: connectedAccountId,
  user_id: userId,
  entity_id: userId,
  arguments: { ig_user_id: "me" },
  version: "latest",
});
    if (!result.successful) {
      return { identity: null, issue: `Identity read failed: ${result.error ?? "unknown error"}` };
    }
    const identity = extractIdentity(result.data);
    if (!identity) {
      // Field names only — never values — to aid diagnosis safely.
      return {
        identity: null,
        issue: `Identity fields not found in tool response (top-level keys: ${Object.keys(result.data).join(", ")}).`,
      };
    }
    return { identity };
  } catch (e) {
    return { identity: null, issue: `Identity read failed: ${describeError(e)}` };
  }
}

/** Discover already-authorized Instagram connections. Read-only; no writes. */
export async function listInstagramAccounts(): Promise<SafeInstagramAccount[]> {
  const composio = getClient();
  // Raw client response: the SDK's transformed list drops the user_id field
  // that tools.execute requires alongside connectedAccountId.
  const response = await composio.getClient().connectedAccounts.list({
    toolkit_slugs: ["instagram"],
  });
  const accounts: SafeInstagramAccount[] = [];
  for (const item of response.items) {
    if (item.is_disabled) continue;
    const base = {
      providerName: "composio-instagram" as const,
      externalConnectionId: item.id,
      connectionStatus: item.status,
    };
    if (item.status !== "ACTIVE") {
      accounts.push({
        ...base,
        identity: null,
        issue: `Connection is not active (status: ${item.status}${item.status_reason ? `, reason: ${item.status_reason}` : ""}).`,
      });
      continue;
    }
    const { identity, issue } = await resolveIdentity(composio, item.id, item.user_id);
    accounts.push({ ...base, identity, ...(issue ? { issue } : {}) });
  }
  return accounts;
}

/** Re-run the identity read for one connection as an honest liveness test. */
export async function testInstagramConnection(
  connectionId: string,
): Promise<{ ok: boolean; message: string }> {
  const composio = getClient();
  // Raw retrieve to obtain the owning user_id for this connection at runtime.
  const record = await composio.getClient().connectedAccounts.retrieve(connectionId);
  const { identity, issue } = await resolveIdentity(composio, connectionId, record.user_id);
  if (identity) {
    return { ok: true, message: `Live identity read succeeded for @${identity.username}.` };
  }
  return { ok: false, message: issue ?? "Identity read failed." };
}

import type { ProviderReference, SocialAccountIdentity } from "../model/types";

export interface ConnectResult {
  account: SocialAccountIdentity;
  provider: ProviderReference;
}

/** An externally authorized account found by discovery. */
export interface DiscoveredAccount {
  /** null when the account exists but its identity could not be resolved. */
  account: SocialAccountIdentity | null;
  provider: ProviderReference;
  /** Honest reason when the account is present but not fully usable. */
  issue?: string;
}

export interface TestResult {
  ok: boolean;
  message: string;
  /** ISO timestamp of when the check ran. */
  checkedAt: string;
}

/**
 * Replaceable integration boundary between the app and any external
 * connection provider.
 *
 * Operation semantics are deliberately distinct — providers must not
 * conflate them:
 * - discoverAuthorizedAccounts: list accounts ALREADY authorized at the
 *   provider. Read-only; never starts an authorization flow.
 * - testConnection: honestly verify an existing connection is usable now.
 * - connect (optional capability): authorize a NEW account. Only providers
 *   that can genuinely do this implement it (the mock simulates it; a real
 *   OAuth flow is not part of the current milestone).
 * - disconnect (optional capability): sever the provider-side connection.
 *   Only implemented where that is genuinely performed. Detaching an
 *   account from app state alone is UI state, not a provider operation.
 *
 * Kept deliberately minimal: platforms will not have identical
 * capabilities, so platform-specific operations belong in
 * capability-specific extensions, not in this shared contract.
 */
export interface SocialProvider {
  readonly name: string;

  discoverAuthorizedAccounts(): Promise<DiscoveredAccount[]>;

  testConnection(provider: ProviderReference): Promise<TestResult>;

  connect?(usernameHint: string): Promise<ConnectResult>;

  disconnect?(provider: ProviderReference): Promise<void>;
}

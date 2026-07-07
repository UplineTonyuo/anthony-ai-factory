/**
 * Core social connection model.
 *
 * Five concepts are kept deliberately separate so that no single external
 * account or provider ever becomes permanent infrastructure:
 *   1. Platform                  — which network (Instagram first).
 *   2. SocialAccountIdentity     — who the account is on that platform.
 *   3. ConnectionRecord          — our internal, stable record of a connection.
 *   4. ProviderReference         — the replaceable external integration handle.
 *   5. ActivePublishingSelection — which connection publishing currently targets.
 */

/** Platforms are added to this union only when they are actually being proven. */
export type Platform = "instagram";

export interface SocialAccountIdentity {
  platform: Platform;
  /** The platform's own id for the account (demo values in Step 1). */
  platformAccountId: string;
  username: string;
  displayName: string;
}

/**
 * Handle to the external provider brokering the connection (mock today;
 * e.g. Composio or direct Meta APIs later). Never business identity.
 */
export interface ProviderReference {
  providerName: string;
  /** The provider's identifier for this connection. */
  externalConnectionId: string;
}

export type ConnectionStatus = "connected" | "disconnected" | "connecting" | "error";

/**
 * Internal record owned by the application. Its id stays stable even when
 * the underlying account or provider is replaced.
 */
export interface ConnectionRecord {
  id: string;
  account: SocialAccountIdentity;
  /** null while disconnected. */
  provider: ProviderReference | null;
  status: ConnectionStatus;
  /** Human-readable detail for the current status (e.g. an error message). */
  statusDetail?: string;
  /** ISO timestamp of the last connection test. */
  lastCheckedAt?: string;
}

/**
 * The publishing destination is an explicit selection, separate from any
 * connection's identity — connections can change while the destination
 * remains a deliberate choice.
 */
export interface ActivePublishingSelection {
  platform: Platform;
  /** null when no destination is selected. */
  connectionId: string | null;
}

export type DraftContentType = "reel" | "image" | "carousel";

/**
 * A queued draft. The destination is bound server-side from the persisted
 * active publishing selection at creation time — never chosen by the client.
 */
export interface DraftItem {
  id: string;
  platform: Platform;
  destinationExternalConnectionId: string;
  contentType: DraftContentType;
  caption: string;
  mediaRef?: string;
  /** ISO timestamp of the intended publish time. */
  scheduledAt: string;
  /** IANA timezone the time was entered in. */
  timezone: string;
  status: "draft";
  createdBy: "human" | "agent";
  createdAt: string;
  updatedAt: string;
}

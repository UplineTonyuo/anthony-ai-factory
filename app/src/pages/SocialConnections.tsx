import { useEffect, useReducer, useState } from "react";
import type {
  ActivePublishingSelection,
  ConnectionRecord,
  ProviderReference,
  SocialAccountIdentity,
} from "../model/types";
import type { DiscoveredAccount, SocialProvider } from "../providers/SocialProvider";
import { mockInstagramProvider } from "../providers/mockInstagram";
import { composioInstagramProvider } from "../providers/composioInstagram";
import { ConnectionCard } from "../components/ConnectionCard";

/**
 * Explicit provider mode. There is no fallback in either direction:
 * real-mode failures surface as honest errors, never as mock data.
 */
const MODE: "mock" | "composio" =
  import.meta.env.VITE_SOCIAL_PROVIDER_MODE === "composio" ? "composio" : "mock";

const provider: SocialProvider =
  MODE === "composio" ? composioInstagramProvider : mockInstagramProvider;

interface ConnectionsState {
  records: ConnectionRecord[];
  selection: ActivePublishingSelection;
}

type ConnectionsAction =
  | { type: "discovered"; records: ConnectionRecord[] }
  | { type: "connect_start"; id: string; handle: string }
  | { type: "connect_success"; id: string; account: SocialAccountIdentity; provider: ProviderReference }
  | { type: "connect_failure"; id: string; message: string }
  | { type: "replace_start"; id: string }
  | { type: "replace_failure"; id: string; message: string }
  | { type: "test_start"; id: string }
  | { type: "test_result"; id: string; ok: boolean; message: string; checkedAt: string }
  | { type: "disconnected"; id: string }
  | { type: "set_active"; id: string };

function updateRecord(
  records: ConnectionRecord[],
  id: string,
  patch: Partial<ConnectionRecord>,
): ConnectionRecord[] {
  return records.map((r) => (r.id === id ? { ...r, ...patch } : r));
}

function reducer(state: ConnectionsState, action: ConnectionsAction): ConnectionsState {
  switch (action.type) {
    case "discovered":
      // Replace, not append: discovery is idempotent (safe under re-runs).
      return {
        records: action.records,
        selection:
          state.selection.connectionId &&
          action.records.some((r) => r.id === state.selection.connectionId)
            ? state.selection
            : { ...state.selection, connectionId: null },
      };
    case "connect_start":
      return {
        ...state,
        records: [
          ...state.records,
          {
            id: action.id,
            account: {
              platform: "instagram",
              platformAccountId: "",
              username: action.handle,
              displayName: action.handle,
            },
            provider: null,
            status: "connecting",
          },
        ],
      };
    case "connect_success":
      return {
        ...state,
        records: updateRecord(state.records, action.id, {
          account: action.account,
          provider: action.provider,
          status: "connected",
          statusDetail: undefined,
        }),
      };
    case "connect_failure":
      return {
        ...state,
        records: updateRecord(state.records, action.id, { status: "error", statusDetail: action.message }),
      };
    case "replace_start":
      return {
        ...state,
        records: updateRecord(state.records, action.id, { status: "connecting", statusDetail: undefined }),
      };
    case "replace_failure":
      return {
        ...state,
        records: updateRecord(state.records, action.id, { status: "error", statusDetail: action.message }),
      };
    case "test_start":
      return {
        ...state,
        records: updateRecord(state.records, action.id, {
          status: "connecting",
          statusDetail: "Testing connection…",
        }),
      };
    case "test_result":
      return {
        ...state,
        records: updateRecord(state.records, action.id, {
          status: action.ok ? "connected" : "error",
          statusDetail: action.message,
          lastCheckedAt: action.checkedAt,
        }),
      };
    case "disconnected": {
      const records = updateRecord(state.records, action.id, {
        provider: null,
        status: "disconnected",
        statusDetail: undefined,
      });
      // A disconnected record cannot remain the publishing destination.
      const selection =
        state.selection.connectionId === action.id
          ? { ...state.selection, connectionId: null }
          : state.selection;
      return { records, selection };
    }
    case "set_active":
      return { ...state, selection: { ...state.selection, connectionId: action.id } };
    default:
      return state;
  }
}

function newRecordId(): string {
  return `rec_${Math.random().toString(36).slice(2, 8)}`;
}

function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

function recordFromDiscovered(found: DiscoveredAccount): ConnectionRecord {
  return {
    id: newRecordId(),
    account:
      found.account ??
      ({
        platform: "instagram",
        platformAccountId: "",
        username: "unknown",
        displayName: "Identity unavailable",
      } satisfies SocialAccountIdentity),
    provider: found.provider,
    status: found.account && !found.issue ? "connected" : "error",
    ...(found.issue ? { statusDetail: found.issue } : {}),
  };
}

export function SocialConnections() {
  const [state, dispatch] = useReducer(reducer, {
    records: [],
    selection: { platform: "instagram", connectionId: null },
  });
  const [newHandle, setNewHandle] = useState("");
  const [discovery, setDiscovery] = useState<{ loading: boolean; error: string | null }>({
    loading: true,
    error: null,
  });

  const activeRecord = state.records.find((r) => r.id === state.selection.connectionId) ?? null;

  async function runDiscovery() {
    setDiscovery({ loading: true, error: null });
    try {
      const found = await provider.discoverAuthorizedAccounts();
      dispatch({ type: "discovered", records: found.map(recordFromDiscovered) });
      setDiscovery({ loading: false, error: null });
    } catch (e) {
      setDiscovery({ loading: false, error: errorMessage(e) });
    }
  }

  useEffect(() => {
    void runDiscovery();
  }, []);

  async function connectNew() {
    if (!provider.connect) return;
    const handle = newHandle.trim().replace(/^@/, "");
    if (!handle) return;
    setNewHandle("");
    const id = newRecordId();
    dispatch({ type: "connect_start", id, handle });
    try {
      const result = await provider.connect(handle);
      dispatch({ type: "connect_success", id, account: result.account, provider: result.provider });
    } catch (e) {
      dispatch({ type: "connect_failure", id, message: errorMessage(e) });
    }
  }

  async function replaceAccount(record: ConnectionRecord, handle: string) {
    if (!provider.connect) return;
    dispatch({ type: "replace_start", id: record.id });
    try {
      // Connect the replacement first; only sever the old connection on success.
      const result = await provider.connect(handle);
      if (record.provider && provider.disconnect) {
        await provider.disconnect(record.provider);
      }
      dispatch({
        type: "connect_success",
        id: record.id,
        account: result.account,
        provider: result.provider,
      });
    } catch (e) {
      dispatch({
        type: "replace_failure",
        id: record.id,
        message: `Replace failed — previous account details retained. ${errorMessage(e)}`,
      });
    }
  }

  async function testConnection(record: ConnectionRecord) {
    if (!record.provider) return;
    const providerRef = record.provider;
    dispatch({ type: "test_start", id: record.id });
    try {
      const result = await provider.testConnection(providerRef);
      dispatch({
        type: "test_result",
        id: record.id,
        ok: result.ok,
        message: result.message,
        checkedAt: result.checkedAt,
      });
    } catch (e) {
      dispatch({
        type: "test_result",
        id: record.id,
        ok: false,
        message: errorMessage(e),
        checkedAt: new Date().toISOString(),
      });
    }
  }

  async function disconnect(record: ConnectionRecord) {
    if (!record.provider || !provider.disconnect) return;
    await provider.disconnect(record.provider);
    dispatch({ type: "disconnected", id: record.id });
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Social Connections</h1>
        <p className="page-sub">Manage the social accounts this factory can publish to.</p>
      </header>

      {MODE === "mock" ? (
        <div className="demo-banner" role="note">
          <strong>DEMO DATA</strong> — every connection below is simulated by a mock provider. No
          real Instagram API calls are made and no real accounts are connected. Handles containing
          &ldquo;fail&rdquo; simulate authorization errors.
        </div>
      ) : (
        <div className="demo-banner" role="note">
          <strong>LIVE MODE (read-only)</strong> — accounts below are discovered from already-
          authorized provider connections through this app&rsquo;s server boundary. No publishing
          actions are performed.
        </div>
      )}

      <div className="panel selection-summary">
        <div>
          <div className="summary-label">Active publishing destination · Instagram</div>
          <div className="summary-value">
            {activeRecord ? `@${activeRecord.account.username}` : "None selected"}
          </div>
        </div>
        <p className="summary-note">
          The publishing destination is an explicit selection, separate from any account&rsquo;s
          identity — connections can change while the destination stays a deliberate choice.
        </p>
      </div>

      {provider.connect && (
        <form
          className="connect-form"
          onSubmit={(e) => {
            e.preventDefault();
            void connectNew();
          }}
        >
          <input
            value={newHandle}
            onChange={(e) => setNewHandle(e.target.value)}
            placeholder="@instagram_handle"
            aria-label="Instagram handle to connect"
          />
          <button className="btn btn-primary" type="submit" disabled={!newHandle.trim()}>
            Connect Instagram account
          </button>
        </form>
      )}

      {discovery.loading && <div className="panel">Discovering authorized accounts…</div>}

      {discovery.error && (
        <div className="panel">
          <p className="status-detail is-error">Account discovery failed: {discovery.error}</p>
          <button className="btn" onClick={() => void runDiscovery()}>
            Retry discovery
          </button>
        </div>
      )}

      {!discovery.loading && !discovery.error && state.records.length === 0 && (
        <div className="panel">
          <p>No authorized accounts were found for this provider.</p>
        </div>
      )}

      <section className="connection-list" aria-label="Instagram connections">
        {state.records.map((record) => (
          <ConnectionCard
            key={record.id}
            record={record}
            isActive={record.id === state.selection.connectionId}
            demo={MODE === "mock"}
            canReplace={Boolean(provider.connect)}
            canDisconnect={Boolean(provider.disconnect)}
            onTest={() => void testConnection(record)}
            onReplace={(handle) => void replaceAccount(record, handle)}
            onDisconnect={() => void disconnect(record)}
            onSetActive={() => dispatch({ type: "set_active", id: record.id })}
          />
        ))}
      </section>
    </div>
  );
}

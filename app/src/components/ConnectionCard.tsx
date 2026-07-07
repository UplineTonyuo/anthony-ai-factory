import { useState } from "react";
import type { ConnectionRecord } from "../model/types";

interface Props {
  record: ConnectionRecord;
  isActive: boolean;
  /** Whether the record comes from the mock provider (controls DEMO tag). */
  demo: boolean;
  /** Provider capabilities — controls are hidden when unsupported. */
  canReplace: boolean;
  canDisconnect: boolean;
  onTest: () => void;
  onReplace: (handle: string) => void;
  onDisconnect: () => void;
  onSetActive: () => void;
}

const STATUS_LABEL: Record<ConnectionRecord["status"], string> = {
  connected: "Connected",
  disconnected: "Disconnected",
  connecting: "Connecting…",
  error: "Error",
};

export function ConnectionCard({
  record,
  isActive,
  demo,
  canReplace,
  canDisconnect,
  onTest,
  onReplace,
  onDisconnect,
  onSetActive,
}: Props) {
  const [replacing, setReplacing] = useState(false);
  const [replaceHandle, setReplaceHandle] = useState("");

  const busy = record.status === "connecting";
  const hasProvider = record.provider !== null;

  function submitReplace() {
    const handle = replaceHandle.trim();
    if (!handle) return;
    setReplacing(false);
    setReplaceHandle("");
    onReplace(handle);
  }

  return (
    <article className={`connection-card${isActive ? " is-active" : ""}`}>
      <div className="card-top">
        <div className="account-identity">
          <div className="monogram" aria-hidden="true">
            {record.account.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="account-handle">@{record.account.username}</div>
            <div className="account-name">{record.account.displayName}</div>
          </div>
        </div>
        <div className="card-tags">
          <span className="tag tag-platform">Instagram</span>
          {demo && <span className="tag tag-demo">DEMO</span>}
          <span className={`status-pill status-${record.status}`}>{STATUS_LABEL[record.status]}</span>
        </div>
      </div>

      {isActive && <div className="active-badge">Active publishing account</div>}

      {record.statusDetail && (
        <p className={`status-detail${record.status === "error" ? " is-error" : ""}`}>
          {record.statusDetail}
        </p>
      )}

      <dl className="card-meta">
        <div>
          <dt>Internal record</dt>
          <dd>{record.id}</dd>
        </div>
        <div>
          <dt>Provider</dt>
          <dd>{record.provider ? record.provider.providerName : "—"}</dd>
        </div>
        <div>
          <dt>Provider connection</dt>
          <dd>{record.provider ? record.provider.externalConnectionId : "—"}</dd>
        </div>
        <div>
          <dt>Platform account id</dt>
          <dd>{record.account.platformAccountId || "pending"}</dd>
        </div>
        <div>
          <dt>Last checked</dt>
          <dd>{record.lastCheckedAt ? new Date(record.lastCheckedAt).toLocaleTimeString() : "never"}</dd>
        </div>
      </dl>

      <div className="card-actions">
        <button className="btn" onClick={onTest} disabled={busy || !hasProvider}>
          Test Connection
        </button>
        {canReplace && (
          <button className="btn" onClick={() => setReplacing((v) => !v)} disabled={busy}>
            Replace Account
          </button>
        )}
        {canDisconnect && (
          <button className="btn btn-danger" onClick={onDisconnect} disabled={busy || !hasProvider}>
            Disconnect
          </button>
        )}
        {record.status === "connected" && !isActive && (
          <button className="btn btn-primary" onClick={onSetActive}>
            Select as Active Publishing Account
          </button>
        )}
      </div>

      {replacing && (
        <div className="replace-form">
          <input
            value={replaceHandle}
            onChange={(e) => setReplaceHandle(e.target.value)}
            placeholder="@new_handle"
            aria-label={`Replacement handle for ${record.account.username}`}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitReplace();
            }}
          />
          <button className="btn btn-primary" onClick={submitReplace} disabled={!replaceHandle.trim()}>
            Confirm Replace
          </button>
          <button
            className="btn"
            onClick={() => {
              setReplacing(false);
              setReplaceHandle("");
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </article>
  );
}

import { useEffect, useState } from "react";
import type { DraftContentType, DraftItem } from "../model/types";
import { createDraft, fetchDrafts } from "../api/drafts";

/**
 * Minimal draft content queue: create one draft manually, list persisted
 * upcoming drafts. Drafts bind server-side to the active publishing
 * destination; nothing here publishes anything.
 */

/** Single-user stage: times are entered and displayed in this timezone. */
const DISPLAY_TIMEZONE = "Asia/Manila";
// Manila has no daylight saving time, so a fixed +08:00 offset is correct.
const DISPLAY_UTC_OFFSET = "+08:00";

function toIsoFromLocalInput(datetimeLocal: string): string {
  return `${datetimeLocal}:00${DISPLAY_UTC_OFFSET}`;
}

function formatInDisplayTz(iso: string): string {
  return new Date(iso).toLocaleString("en-PH", {
    timeZone: DISPLAY_TIMEZONE,
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

export function ContentQueue() {
  const [drafts, setDrafts] = useState<DraftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [contentType, setContentType] = useState<DraftContentType>("reel");
  const [caption, setCaption] = useState("");
  const [mediaRef, setMediaRef] = useState("");
  const [scheduledLocal, setScheduledLocal] = useState("");

  async function loadDrafts() {
    setLoading(true);
    setLoadError(null);
    try {
      setDrafts(await fetchDrafts());
    } catch (e) {
      setLoadError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDrafts();
  }, []);

  async function submitDraft() {
    if (!caption.trim() || !scheduledLocal) {
      setFormError("Caption and scheduled time are required.");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const draft = await createDraft({
        contentType,
        caption: caption.trim(),
        ...(mediaRef.trim() ? { mediaRef: mediaRef.trim() } : {}),
        scheduledAt: toIsoFromLocalInput(scheduledLocal),
        timezone: DISPLAY_TIMEZONE,
      });
      setDrafts((current) => [...current, draft]);
      setCaption("");
      setMediaRef("");
      setScheduledLocal("");
    } catch (e) {
      // Honest failure — e.g. no active destination, or destination not ACTIVE.
      setFormError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  const upcoming = [...drafts].sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));

  return (
    <div className="page">
      <header className="page-header">
        <h1>Content Queue</h1>
        <p className="page-sub">
          Draft queue for the active publishing destination. Drafts only — nothing is published.
        </p>
      </header>

      <div className="panel draft-form-panel">
        <h2>New draft</h2>
        <form
          className="draft-form"
          onSubmit={(e) => {
            e.preventDefault();
            void submitDraft();
          }}
        >
          <label>
            Content type
            <select value={contentType} onChange={(e) => setContentType(e.target.value as DraftContentType)}>
              <option value="reel">Reel</option>
              <option value="image">Image</option>
              <option value="carousel">Carousel</option>
            </select>
          </label>
          <label>
            Caption
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              placeholder="Write the caption…"
            />
          </label>
          <label>
            Media reference (optional)
            <input
              value={mediaRef}
              onChange={(e) => setMediaRef(e.target.value)}
              placeholder="File name, URL, or asset note"
            />
          </label>
          <label>
            Scheduled time ({DISPLAY_TIMEZONE})
            <input
              type="datetime-local"
              value={scheduledLocal}
              onChange={(e) => setScheduledLocal(e.target.value)}
            />
          </label>
          {formError && <p className="status-detail is-error">{formError}</p>}
          <div>
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? "Saving…" : "Add draft"}
            </button>
          </div>
        </form>
      </div>

      <section aria-label="Upcoming drafts">
        <h2 className="queue-heading">Upcoming drafts</h2>
        {loading && <div className="panel">Loading drafts…</div>}
        {loadError && (
          <div className="panel">
            <p className="status-detail is-error">Could not load drafts: {loadError}</p>
            <button className="btn" onClick={() => void loadDrafts()}>
              Retry
            </button>
          </div>
        )}
        {!loading && !loadError && upcoming.length === 0 && (
          <div className="panel">
            <p>No drafts queued yet.</p>
          </div>
        )}
        {upcoming.map((draft) => (
          <article key={draft.id} className="panel draft-item">
            <div className="draft-item-top">
              <span className="tag tag-platform">Instagram</span>
              <span className="tag">{draft.contentType}</span>
              <span className="status-pill status-disconnected">Draft</span>
              <span className="draft-time">{formatInDisplayTz(draft.scheduledAt)}</span>
            </div>
            <p className="draft-caption">{draft.caption}</p>
            <dl className="card-meta">
              <div>
                <dt>Destination connection</dt>
                <dd>{draft.destinationExternalConnectionId}</dd>
              </div>
              <div>
                <dt>Media</dt>
                <dd>{draft.mediaRef ?? "—"}</dd>
              </div>
              <div>
                <dt>Timezone</dt>
                <dd>{draft.timezone}</dd>
              </div>
              <div>
                <dt>Created by</dt>
                <dd>{draft.createdBy}</dd>
              </div>
            </dl>
          </article>
        ))}
      </section>
    </div>
  );
}
